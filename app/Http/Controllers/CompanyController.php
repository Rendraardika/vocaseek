<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lowongan;
use App\Models\JobApplication;
use App\Models\CompanyProfile;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CompanyController extends Controller
{
    /**
     * Helper untuk mengambil profil Company yang sedang login
     */
    private function getMyCompany()
    {
        return CompanyProfile::where('user_id', Auth::id())->first();
    }

    /**
     * Mengambil Detail Profil Perusahaan
     */
    public function getCompanyProfile()
    {
        $profile = $this->getMyCompany();
        if (!$profile) {
            return response()->json(['message' => 'Profil perusahaan tidak ditemukan'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'nama_perusahaan' => $profile->nama_perusahaan,
                'notelp' => $profile->notelp,
                'nib' => $profile->nib,
                'status_mitra' => $profile->status_mitra,
                'loa_url' => $profile->loa_pdf ? asset('storage/' . $profile->loa_pdf) : null,
                'akta_url' => $profile->akta_pdf ? asset('storage/' . $profile->akta_pdf) : null,
                'created_at' => $profile->created_at->format('d M Y')
            ]
        ]);
    }

    /**
     * Data Statistik Dashboard untuk Company
     */
    public function getDashboardData()
    {
        $company = $this->getMyCompany();
        if (!$company) return response()->json(['message' => 'Unauthorized'], 403);

        // Ambil semua ID lowongan milik perusahaan ini untuk filter
        $jobIds = Lowongan::where('company_profile_id', $company->id)->pluck('id');

        $stats = [
            'total_applicants' => JobApplication::whereIn('job_id', $jobIds)->count(),
            'active_jobs'      => Lowongan::where('company_profile_id', $company->id)->where('status', 'ACTIVE')->count(),
            'shortlisted'      => JobApplication::whereIn('job_id', $jobIds)->where('status', 'SHORTLISTED')->count(),
        ];

        $recentApplicants = JobApplication::with(['user', 'lowongan'])
            ->whereIn('job_id', $jobIds)
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($app) => [
                'application_id' => $app->application_id,
                'name'           => $app->user->nama ?? 'N/A',
                'position'       => $app->lowongan->judul_posisi ?? 'N/A',
                'date'           => $app->created_at->format('d M Y'),
                'status'         => $app->status
            ]);

        return response()->json([
            'status' => 'success', 
            'stats' => $stats, 
            'recent_applicants' => $recentApplicants
        ]);
    }

    /**
     * Melihat List Pelamar pada Lowongan Tertentu
     */
    public function getApplicantsByJob($jobId)
    {
        $company = $this->getMyCompany();
        $job = Lowongan::where('id', $jobId)
            ->where('company_profile_id', $company->id)
            ->firstOrFail();

        $applicants = JobApplication::with(['user.internProfile'])
            ->where('job_id', $jobId)
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success', 
            'job' => $job->judul_posisi, 
            'applicants' => $applicants
        ]);
    }

    /**
     * Mengubah Status Lamaran (Seleksi)
     */
    public function updateApplicationStatus(Request $request, $id)
    {
        // Validasi sesuai dengan isi ENUM di database Abang
        $request->validate([
            'status' => 'required|in:PENDING,REVIEW,INTERVIEW,SHORTLISTED,ACCEPTED,REJECTED'
        ]);

        $app = JobApplication::findOrFail($id);
        $app->update(['status' => $request->status]);

        return response()->json([
            'status' => 'success', 
            'message' => 'Status pelamar berhasil diperbarui ke ' . $request->status
        ]);
    }

    /**
     * List Semua Lowongan yang Pernah Dibuat Company
     */
    public function getJobPostings()
    {
        $company = $this->getMyCompany();
        $jobs = Lowongan::where('company_profile_id', $company->id)->latest()->get();

        return response()->json(['status' => 'success', 'jobs' => $jobs]);
    }

    /**
     * Menambah Lowongan Baru
     */
    public function storeJob(Request $request)
    {
        $company = $this->getMyCompany();
        if ($company->status_mitra !== 'active') {
            return response()->json(['message' => 'Akun mitra belum aktif atau diverifikasi'], 403);
        }

        $validated = $request->validate([
            'judul_posisi' => 'required|string',
            'deskripsi_pekerjaan' => 'required|string',
            'persyaratan' => 'required|string',
            'lokasi' => 'required|string',
            'tipe_magang' => 'required|string',
            'gaji_per_bulan' => 'nullable|string',
            'status' => 'required|in:ACTIVE,CLOSED,DRAFT',
        ]);

        $job = Lowongan::create(array_merge($validated, [
            'company_profile_id' => $company->id
        ]));

        return response()->json([
            'status' => 'success', 
            'message' => 'Lowongan berhasil diterbitkan!', 
            'data' => $job
        ]);
    }

    /**
     * Update Data Lowongan
     */
    public function updateJob(Request $request, $id)
    {
        $company = $this->getMyCompany();
        $job = Lowongan::where('id', $id)->where('company_profile_id', $company->id)->firstOrFail();

        $job->update($request->all());

        return response()->json([
            'status' => 'success', 
            'message' => 'Lowongan berhasil diupdate!'
        ]);
    }

    /**
     * Menghapus Lowongan
     */
    public function destroyJob($id)
    {
        $company = $this->getMyCompany();
        $job = Lowongan::where('id', $id)->where('company_profile_id', $company->id)->firstOrFail();
        
        $job->delete();

        return response()->json([
            'status' => 'success', 
            'message' => 'Lowongan berhasil dihapus'
        ]);
    }

    /**
     * Statistik Publik (Tanpa Auth)
     */
    public function getPublicStats()
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'live_jobs'  => Lowongan::where('status', 'ACTIVE')->count(),
                'companies'  => CompanyProfile::where('status_mitra', 'active')->count(),
                'candidates' => User::where('role', 'intern')->count(),
            ]
        ]);
    }
}