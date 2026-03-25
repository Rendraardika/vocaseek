<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Lowongan;
use App\Models\JobApplication;
use App\Models\InternProfile;
use App\Notifications\CandidateStatusUpdated; // Import Notification yang kita buat tadi
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TalentController extends Controller
{
    /**
     * SEMUA KANDIDAT (Menu Utama - Gambar 1 & 2)
     */
    public function getAllCandidates(Request $request)
    {
        $company = $request->user()->companyProfile;

        if (!$company) {
            return response()->json(['message' => 'Profil perusahaan tidak ditemukan'], 404);
        }

        $applications = JobApplication::with(['user', 'lowongan'])
            ->whereHas('lowongan', function($q) use ($company) {
                $q->where('company_profile_id', $company->id);
            })->latest()->get();

        $stats = [
            'total_shortlisted' => $applications->where('status', 'SHORTLISTED')->count(),
            'total_reviewed'    => $applications->where('status', 'REVIEWED')->count(),
            'total_rejected'    => $applications->where('status', 'REJECTED')->count(),
            'total_interviews'  => $applications->where('status', 'INTERVIEW')->count(),
        ];

        $tableData = $applications->map(fn($app) => [
            'id' => $app->id,
            'name' => $app->user->nama ?? 'N/A',
            'email' => $app->user->email ?? '-',
            'date_applied' => $app->created_at->format('M d, Y'),
            'job_title' => $app->lowongan->judul_pekerjaan ?? 'Posisi Terhapus',
            'status' => $app->status,
        ]);

        return response()->json(['status' => 'success', 'stats' => $stats, 'candidates' => $tableData]);
    }

    /**
     * CREATE MANUAL KANDIDATE (Proses Gambar 3)
     */
    public function storeManualCandidate(Request $request)
    {
        $validated = $request->validate([
            'nama'     => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'notelp'   => 'required',
            'asal_kampus' => 'required',
            'prodi'       => 'required',
        ]);

        $candidate = DB::transaction(function () use ($validated) {
            $user = User::create([
                'nama' => $validated['nama'],
                'email' => $validated['email'],
                'password' => Hash::make(Str::random(16)),
                'role' => 'intern',
                'notelp' => $validated['notelp'],
            ]);

            InternProfile::create([
                'user_id' => $user->user_id,
                'asal_kampus' => $validated['asal_kampus'],
                'prodi'       => $validated['prodi'],
                'is_profile_complete' => false
            ]);

            return $user;
        });

        return response()->json(['status' => 'success', 'message' => 'Kandidat manual berhasil dibuat', 'data' => $candidate]);
    }

    /**
     * EDIT STATUS & KIRIM NOTIFIKASI (Gambar 6 - Popup)
     */
    public function updateCandidateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:APPLIED,REVIEWED,SHORTLISTED,INTERVIEW,REJECTED,OFFER', 
        ]);

        // Kita load relasi user dan company profile untuk kebutuhan email notifikasi
        $application = JobApplication::with(['user', 'lowongan.companyProfile'])->findOrFail($id);
        
        // Update status di DB
        $application->update(['status' => $validated['status']]);

        // KIRIM NOTIFIKASI OTOMATIS KE EMAIL INTERN
        $user = $application->user;
        $jobTitle = $application->lowongan->judul_pekerjaan;
        $companyName = $application->lowongan->companyProfile->nama_perusahaan ?? 'Perusahaan Mitra';

        if ($user) {
            $user->notify(new CandidateStatusUpdated($validated['status'], $jobTitle, $companyName));
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Status berhasil diperbarui dan email notifikasi telah dikirim.',
            'new_status' => $validated['status']
        ]);
    }

    /**
     * KANDIDAT TERPILIH (Menu Kandidat Terpilih - Gambar 7)
     */
    public function getSelectedCandidates(Request $request)
    {
        $company = $request->user()->companyProfile;

        if (!$company) {
            return response()->json(['message' => 'Profil tidak ditemukan'], 404);
        }

        // Ambil lowongan milik perusahaan ini
        $jobs = Lowongan::where('company_profile_id', $company->id)->get();
        
        $selectedCandidates = $jobs->map(function($job) {
            return [
                'id_pekerjaan' => $job->id,
                'judul_pekerjaan' => $job->judul_pekerjaan,
                // Ambil pelamar yang statusnya 'OFFER'
                'candidates' => $job->applications()
                    ->where('status', 'OFFER')
                    ->with(['user.internProfile'])
                    ->latest()->take(3)->get()
                    ->map(fn($app) => [
                        'name' => $app->user->nama ?? 'N/A',
                        'prodi' => $app->user->internProfile->prodi ?? '-',
                        'asal_kampus' => $app->user->internProfile->asal_kampus ?? '-',
                    ]),
            ];
        });

        return response()->json(['status' => 'success', 'data' => $selectedCandidates]);
    }
}