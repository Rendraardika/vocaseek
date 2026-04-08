<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lowongan;
use App\Models\JobApplication;
use App\Models\CompanyProfile;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    /**
     * Helper: Ambil profil company yang sedang login
     */
    private function getMyCompany()
    {
        return CompanyProfile::where('user_id', Auth::id())->first();
    }

    // ==========================================
    // 1. FITUR PROFIL (Sesuai UI Settings)
    // ==========================================

    public function getCompanyProfile()
    {
        $profile = $this->getMyCompany();
        if (!$profile) return response()->json(['message' => 'Profil tidak ditemukan'], 404);

        return response()->json([
            'status' => 'success',
            'data' => [
                'nama_perusahaan'     => $profile->nama_perusahaan,
                'industri'            => $profile->industri,
                'ukuran_perusahaan'   => $profile->ukuran_perusahaan,
                'website_url'         => $profile->website_url,
                'deskripsi'           => $profile->deskripsi,
                'notelp'              => $profile->notelp,
                'alamat_kantor_pusat' => $profile->alamat_kantor_pusat,
                'nib'                 => $profile->nib,
                'status_mitra'        => $profile->status_mitra,
                'logo_url'            => $profile->logo_perusahaan ? asset('storage/' . $profile->logo_perusahaan) : null,
                'banner_url'          => $profile->banner_perusahaan ? asset('storage/' . $profile->banner_perusahaan) : null,
                'linkedin_url'        => $profile->linkedin_url,
                'instagram_url'       => $profile->instagram_url,
                'twitter_url'         => $profile->twitter_url,
                'loa_url'             => $profile->loa_pdf ? asset('storage/' . $profile->loa_pdf) : null,
                'akta_url'            => $profile->akta_pdf ? asset('storage/' . $profile->akta_pdf) : null,
                'created_at'          => $profile->created_at->format('d M Y')
            ]
        ]);
    }

    public function updateProfile(Request $request)
    {
        $company = $this->getMyCompany();
        if (!$company) return response()->json(['message' => 'Unauthorized'], 403);
        
        $validated = $request->validate([
            'nama_perusahaan'     => 'required|string|max:255',
            'industri'            => 'nullable|string',
            'ukuran_perusahaan'   => 'nullable|string',
            'website_url'         => 'nullable|url',
            'deskripsi'           => 'nullable|string',
            'notelp'              => 'nullable|string',
            'alamat_kantor_pusat' => 'nullable|string',
            'linkedin_url'        => 'nullable|url',
            'instagram_url'       => 'nullable|url',
            'twitter_url'         => 'nullable|url',
            'logo'                => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'banner'              => 'nullable|image|mimes:jpg,jpeg,png|max:3072',
        ]);

        if ($request->hasFile('logo')) {
            if ($company->logo_perusahaan) Storage::disk('public')->delete($company->logo_perusahaan);
            $validated['logo_perusahaan'] = $request->file('logo')->store('company/logos', 'public');
        }

        if ($request->hasFile('banner')) {
            if ($company->banner_perusahaan) Storage::disk('public')->delete($company->banner_perusahaan);
            $validated['banner_perusahaan'] = $request->file('banner')->store('company/banners', 'public');
        }

        $company->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Profil berhasil diperbarui!', 'data' => $company]);
    }

    // ==========================================
    // 2. FITUR DASHBOARD & STATS
    // ==========================================

    public function getDashboardData()
    {
        $company = $this->getMyCompany();
        if (!$company) return response()->json(['message' => 'Unauthorized'], 403);

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

        return response()->json(['status' => 'success', 'stats' => $stats, 'recent_applicants' => $recentApplicants]);
    }

    // ==========================================
    // 3. FITUR MANAJEMEN PELAMAR
    // ==========================================

    public function getApplicantsByJob($jobId)
    {
        $company = $this->getMyCompany();
        $job = Lowongan::where('id', $jobId)->where('company_profile_id', $company->id)->firstOrFail();
        $applicants = JobApplication::with(['user.internProfile'])->where('job_id', $jobId)->latest()->get();
        return response()->json(['status' => 'success', 'job' => $job->judul_posisi, 'applicants' => $applicants]);
    }

    public function updateApplicationStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:PENDING,REVIEW,INTERVIEW,SHORTLISTED,ACCEPTED,REJECTED']);
        $app = JobApplication::findOrFail($id);
        $app->update(['status' => $request->status]);
        return response()->json(['status' => 'success', 'message' => 'Status pelamar diperbarui!']);
    }

    // ==========================================
    // 4. FITUR LOWONGAN (CRUD)
    // ==========================================

    public function getJobPostings()
    {
        $company = $this->getMyCompany();
        return response()->json(['status' => 'success', 'jobs' => Lowongan::where('company_profile_id', $company->id)->latest()->get()]);
    }

    public function storeJob(Request $request)
    {
        $company = $this->getMyCompany();
        if ($company->status_mitra !== 'active') return response()->json(['message' => 'Akun belum aktif'], 403);
        
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
        return response()->json(['status' => 'success', 'data' => $job]);
    }

    public function updateJob(Request $request, $id)
    {
        $company = $this->getMyCompany();
        $job = Lowongan::where('id', $id)->where('company_profile_id', $company->id)->firstOrFail();
        $job->update($request->all());
        return response()->json(['status' => 'success', 'message' => 'Lowongan diupdate!']);
    }

    public function destroyJob($id)
    {
        $company = $this->getMyCompany();
        Lowongan::where('id', $id)->where('company_profile_id', $company->id)->delete();
        return response()->json(['status' => 'success', 'message' => 'Lowongan dihapus']);
    }

    public function getPublicStats()
    {
        return response()->json(['status' => 'success', 'data' => [
            'live_jobs'  => Lowongan::where('status', 'ACTIVE')->count(),
            'companies'  => CompanyProfile::where('status_mitra', 'active')->count(),
            'candidates' => User::where('role', 'intern')->count(),
        ]]);
    }
}