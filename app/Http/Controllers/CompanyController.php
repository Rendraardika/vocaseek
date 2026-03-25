<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lowongan;
use App\Models\JobApplication;
use App\Models\CompanyProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CompanyController extends Controller
{
    /**
     * STATISTIK LANDING PAGE (Publik - Gambar 1 Landing Page)
     */
    public function getPublicStats()
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'live_jobs'  => Lowongan::where('status', 'OPEN')->count(),
                'companies'  => CompanyProfile::count(),
                'candidates' => User::where('role', 'intern')->count(),
                'new_jobs'   => Lowongan::where('created_at', '>=', now()->subDays(7))->count(),
            ]
        ]);
    }

    /**
     * DASHBOARD DATA (Internal Mitra - Gambar 1 Dashboard)
     */
    public function getDashboardData(Request $request)
    {
        $company = $request->user()->companyProfile;

        if (!$company) {
            return response()->json(['message' => 'Profil perusahaan tidak ditemukan'], 404);
        }

        $stats = [
            'total_applicants' => JobApplication::whereHas('lowongan', function($q) use ($company) {
                $q->where('company_profile_id', $company->id);
            })->count(),
            'active_jobs' => Lowongan::where('company_profile_id', $company->id)->where('status', 'OPEN')->count(),
            'shortlisted' => JobApplication::where('status', 'SHORTLISTED')->whereHas('lowongan', function($q) use ($company) {
                $q->where('company_profile_id', $company->id);
            })->count(),
        ];

        $recentApplicants = JobApplication::with(['user', 'lowongan'])
            ->whereHas('lowongan', function($q) use ($company) {
                $q->where('company_profile_id', $company->id);
            })->latest()->take(5)->get()
            ->map(fn($app) => [
                'id' => $app->id,
                'candidate_id' => 'KDT-' . str_pad($app->id, 3, '0', STR_PAD_LEFT),
                'name' => $app->user->nama ?? 'N/A',
                'position' => $app->lowongan->judul_pekerjaan ?? 'N/A',
                'date' => $app->created_at->format('M d, Y'),
                'status' => $app->status
            ]);

        return response()->json(['status' => 'success', 'stats' => $stats, 'recent_applicants' => $recentApplicants]);
    }

    /**
     * MANAJEMEN LOWONGAN (List & Statistik - Gambar 1)
     */
    public function getJobPostings(Request $request)
    {
        $company = $request->user()->companyProfile;

        $jobs = Lowongan::where('company_profile_id', $company->id)
            ->withCount('applications')
            ->latest()
            ->get()
            ->map(fn($job) => [
                'id' => $job->id,
                'job_id_display' => '#JOB-' . $job->created_at->format('Y') . '-' . str_pad($job->id, 3, '0', STR_PAD_LEFT),
                'title' => $job->judul_pekerjaan,
                'department' => $job->kategori_pekerjaan,
                'applicants_count' => $job->applications_count,
                'posted_date' => $job->created_at->format('M d, Y'),
                'status' => $job->status, 
            ]);

        return response()->json([
            'status' => 'success',
            'stats' => [
                'total_jobs' => $jobs->count(),
                'active_openings' => $jobs->where('status', 'OPEN')->count(),
                'closed_jobs' => $jobs->where('status', 'CLOSED')->count(),
                'drafts' => $jobs->where('status', 'DRAFT')->count(),
            ],
            'jobs' => $jobs
        ]);
    }

    /**
     * SIMPAN LOWONGAN BARU (Gambar 2-5)
     */
    public function storeJob(Request $request)
    {
        $company = $request->user()->companyProfile;

        $validated = $request->validate([
            'judul_pekerjaan' => 'required|string',
            'kategori_pekerjaan' => 'required|string',
            'tipe_pekerjaan' => 'required|string',
            'lokasi' => 'required|string',
            'pengaturan_kerja' => 'required|string',
            'gaji_min' => 'nullable|numeric',
            'gaji_max' => 'nullable|numeric',
            'deskripsi_pekerjaan' => 'required|string',
            'persyaratan' => 'required|string',
            'tgl_tutup_lamaran' => 'required|date',
            'tgl_mulai_kerja' => 'required|date',
            'status' => 'required|in:OPEN,CLOSED,DRAFT',
        ]);

        $job = Lowongan::create(array_merge($validated, ['company_profile_id' => $company->id]));

        return response()->json(['status' => 'success', 'message' => 'Lowongan berhasil diterbitkan!', 'data' => $job]);
    }

    /**
     * UPDATE LOWONGAN (Edit - Gambar 5 / Icon Edit)
     */
    public function updateJob(Request $request, $id)
    {
        $company = $request->user()->companyProfile;
        $job = Lowongan::where('id', $id)->where('company_profile_id', $company->id)->firstOrFail();

        $validated = $request->validate([
            'judul_pekerjaan' => 'required|string',
            'kategori_pekerjaan' => 'required|string',
            'tipe_pekerjaan' => 'required|string',
            'lokasi' => 'required|string',
            'pengaturan_kerja' => 'required|string',
            'gaji_min' => 'nullable|numeric',
            'gaji_max' => 'nullable|numeric',
            'deskripsi_pekerjaan' => 'required|string',
            'persyaratan' => 'required|string',
            'tgl_tutup_lamaran' => 'required|date',
            'tgl_mulai_kerja' => 'required|date',
            'status' => 'required|in:OPEN,CLOSED,DRAFT',
        ]);

        $job->update($validated);
        return response()->json(['status' => 'success', 'message' => 'Lowongan berhasil diperbarui!']);
    }

    /**
     * HAPUS LOWONGAN
     */
    public function destroyJob($id)
    {
        Lowongan::findOrFail($id)->delete();
        return response()->json(['message' => 'Lowongan berhasil dihapus']);
    }
}