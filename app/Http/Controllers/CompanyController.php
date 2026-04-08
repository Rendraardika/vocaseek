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
     * Ambil Data Profil Perusahaan (Untuk API /profile)
     */
    public function getCompanyProfile()
    {
        $user = Auth::user();
        $profile = CompanyProfile::where('user_id', $user->user_id)->first();

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
                'created_at' => $profile->created_at ? $profile->created_at->format('d M Y') : null
            ]
        ]);
    }

    /**
     * Data Statistik Dashboard Company
     */
    public function getDashboardData(Request $request)
    {
        $user = Auth::user();
        // Menggunakan relasi atau query langsung agar aman
        $company = CompanyProfile::where('user_id', $user->user_id)->first();

        if (!$company) {
            return response()->json(['message' => 'Profil perusahaan tidak ditemukan'], 404);
        }

        $stats = [
            'total_applicants' => JobApplication::where('job_id', function($q) use ($company) {
                $q->select('id')->from('lowongan')->where('company_profile_id', $company->id);
            })->count(),
            'active_jobs' => Lowongan::where('company_profile_id', $company->id)->where('status', 'ACTIVE')->count(),
            'shortlisted' => JobApplication::where('status', 'SHORTLISTED')->count(),
        ];

        // Ambil pelamar terbaru
        $recentApplicants = JobApplication::with(['user', 'lowongan'])
            ->whereIn('job_id', function($q) use ($company) {
                $q->select('id')->from('lowongan')->where('company_profile_id', $company->id);
            })
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($app) => [
                'id' => $app->application_id, // Sesuai Primary Key Abang
                'name' => $app->user->nama ?? 'N/A',
                'position' => $app->lowongan->judul_posisi ?? 'N/A',
                'date' => $app->created_at->format('M d, Y'),
                'status' => $app->status
            ]);

        return response()->json([
            'status' => 'success', 
            'stats' => $stats, 
            'recent_applicants' => $recentApplicants
        ]);
    }

    /**
     * List Lowongan Kerja Milik Company
     */
    public function getJobPostings(Request $request)
    {
        $user = Auth::user();
        $company = CompanyProfile::where('user_id', $user->user_id)->first();

        $jobs = Lowongan::where('company_profile_id', $company->id)
            ->latest()
            ->get()
            ->map(fn($job) => [
                'id' => $job->id,
                'title' => $job->judul_posisi,
                'location' => $job->lokasi,
                'posted_date' => $job->created_at->format('M d, Y'),
                'status' => $job->status, 
            ]);

        return response()->json([
            'status' => 'success',
            'jobs' => $jobs
        ]);
    }

    /**
     * Simpan Lowongan Baru (Sinkron dengan DB)
     */
    public function storeJob(Request $request)
    {
        $user = Auth::user();
        $company = CompanyProfile::where('user_id', $user->user_id)->first();

        if ($company->status_mitra !== 'active') {
            return response()->json(['message' => 'Akun belum diverifikasi admin'], 403);
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

        $job = Lowongan::create(array_merge($validated, ['company_profile_id' => $company->id]));

        return response()->json([
            'status' => 'success', 
            'message' => 'Lowongan berhasil diterbitkan!', 
            'data' => $job
        ]);
    }

    /**
     * Hapus Lowongan
     */
    public function destroyJob($id)
    {
        $job = Lowongan::findOrFail($id);
        $job->delete();
        return response()->json(['message' => 'Lowongan berhasil dihapus']);
    }

    /**
     * Statistik Publik untuk Landing Page
     */
    public function getPublicStats()
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'live_jobs'  => Lowongan::where('status', 'ACTIVE')->count(),
                'companies'  => CompanyProfile::count(),
                'candidates' => User::where('role', 'intern')->count(),
            ]
        ]);
    }
}