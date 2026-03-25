<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Lowongan;
use App\Models\JobApplication;
use App\Models\InternProfile;
use App\Notifications\CandidateStatusUpdated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TalentController extends Controller
{
    /**
     * SEMUA KANDIDAT (Gambar 1 & 2)
     */
    public function getAllCandidates(Request $request)
    {
        $company = $request->user()->companyProfile;

        if (!$company) {
            return response()->json(['message' => 'Profil perusahaan tidak ditemukan'], 404);
        }

        $query = JobApplication::with(['user.internProfile', 'lowongan'])
            ->whereHas('lowongan', function($q) use ($company) {
                $q->where('company_profile_id', $company->id);
            });

        if ($request->has('search')) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('nama', 'like', '%' . $request->search . '%');
            });
        }

        $applications = $query->latest()->get();

        $stats = [
            'total_shortlisted' => $applications->where('status', 'SHORTLISTED')->count(),
            'total_interviews'  => $applications->where('status', 'INTERVIEW')->count(),
            'accepted_this_month' => $applications->where('status', 'OFFER')
                                    ->where('updated_at', '>=', now()->startOfMonth())->count(),
        ];

        $tableData = $applications->map(fn($app) => [
            'id' => $app->id,
            'candidate_id' => 'KDT-' . str_pad($app->user_id, 3, '0', STR_PAD_LEFT),
            'name' => $app->user->nama ?? 'N/A',
            'email' => $app->user->email ?? '-',
            'position' => $app->lowongan->judul_pekerjaan ?? 'N/A',
            'type' => $app->lowongan->tipe_pekerjaan ?? 'Internship',
            'date_applied' => $app->created_at->format('d M Y'),
            'status' => $app->status,
        ]);

        return response()->json([
            'status' => 'success', 
            'stats' => $stats, 
            'candidates' => $tableData
        ]);
    }

    /**
     * DETAIL PROFIL LENGKAP (Gambar 4 & 5)
     * Fungsi baru untuk melihat CV, Portofolio, dan IPK Sarah Jenkins dkk.
     */
    public function getCandidateDetail($id)
    {
        // $id adalah ID lamaran
        $application = JobApplication::with([
            'user.internProfile', 
            'lowongan'
        ])->findOrFail($id);

        $user = $application->user;
        $profile = $user->internProfile;

        return response()->json([
            'status' => 'success',
            'data' => [
                // Bagian Kiri UI: Data Pribadi (Gambar 4)
                'personal' => [
                    'name' => $user->nama,
                    'role' => $profile->posisi_sekarang ?? 'Candidate',
                    'biodata' => $profile->biodata ?? 'Belum ada biodata.',
                    'gender' => $profile->jenis_kelamin ?? '-',
                    'birth' => ($profile->tempat_lahir ?? '-') . ', ' . ($profile->tgl_lahir ?? '-'),
                    'email' => $user->email,
                    'phone' => $user->notelp,
                    'address' => $profile->alamat ?? '-',
                    'socials' => [
                        'linkedin' => $profile->linkedin_url,
                        'instagram' => $profile->instagram_url,
                    ]
                ],
                // Bagian Tengah: Akademik & Assessment (Gambar 4 & 5)
                'academic' => [
                    'university' => $profile->asal_kampus,
                    'major' => $profile->prodi,
                    'ipk' => $profile->ipk ?? '0.00',
                    'graduation' => $profile->tahun_lulus ?? '-',
                ],
                'assessment' => [
                    'score' => $application->test_score ?? 0,
                    'summary' => 'Kandidat memiliki potensi teknis yang stabil.',
                    'date' => $application->created_at->format('d M Y')
                ],
                // Bagian Kanan: Dokumen (Gambar 4)
                'documents' => [
                    'cv' => $profile->cv_path ? url('storage/'.$profile->cv_path) : null,
                    'portfolio' => $profile->portfolio_url,
                    'ktp' => $profile->ktp_path ? url('storage/'.$profile->ktp_path) : null,
                ]
            ]
        ]);
    }

    /**
     * CREATE MANUAL KANDIDATE (Gambar 3)
     */
    public function storeManualCandidate(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'notelp' => 'required',
            'asal_kampus' => 'required',
            'prodi' => 'required',
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
                'prodi' => $validated['prodi'],
                'is_profile_complete' => true 
            ]);

            return $user;
        });

        return response()->json(['status' => 'success', 'message' => 'Kandidat manual berhasil dibuat']);
    }

    /**
     * UPDATE STATUS (Gambar 6)
     */
    public function updateCandidateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:PENDING,REVIEWED,SHORTLISTED,INTERVIEW,REJECTED,OFFER', 
        ]);

        $application = JobApplication::with(['user', 'lowongan.companyProfile'])->findOrFail($id);
        $application->update(['status' => $validated['status']]);

        if ($request->send_notification && $application->user) {
            $application->user->notify(new CandidateStatusUpdated(
                $validated['status'], 
                $application->lowongan->judul_pekerjaan, 
                $application->lowongan->companyProfile->nama_perusahaan ?? 'Vokaseek'
            ));
        }

        return response()->json(['status' => 'success', 'message' => 'Status diperbarui!']);
    }

    /**
     * KANDIDAT TERPILIH (Gambar 7)
     */
    public function getSelectedCandidates(Request $request)
    {
        $company = $request->user()->companyProfile;

        $candidates = JobApplication::with(['user.internProfile', 'lowongan'])
            ->whereHas('lowongan', function($q) use ($company) {
                $q->where('company_profile_id', $company->id);
            })
            ->whereIn('status', ['OFFER', 'SHORTLISTED', 'INTERVIEW'])
            ->latest()->get();

        return response()->json([
            'status' => 'success', 
            'data' => $candidates->map(fn($app) => [
                'id' => $app->id,
                'candidate_id' => 'KDT-' . str_pad($app->user_id, 3, '0', STR_PAD_LEFT),
                'name' => $app->user->nama,
                'position' => $app->lowongan->judul_pekerjaan,
                'status' => $app->status,
            ])
        ]);
    }
}