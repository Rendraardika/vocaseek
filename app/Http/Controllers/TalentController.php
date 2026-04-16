<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Lowongan;
use App\Models\JobApplication;
use App\Models\InternProfile;
use App\Models\InternExperience;
use App\Models\InternCertification;
use App\Models\TestAnswer;
use App\Notifications\CandidateStatusUpdated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TalentController extends Controller
{

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
            'id' => $app->application_id,
            'application_id' => $app->application_id,
            'candidate_id' => 'KDT-' . str_pad($app->user_id, 3, '0', STR_PAD_LEFT),
            'name' => $app->user->nama ?? 'N/A',
            'email' => $app->user->email ?? '-',
            'position' => $app->lowongan->judul_posisi ?? $app->lowongan->judul_pekerjaan ?? 'N/A',
            'type' => $app->lowongan->tipe_magang ?? $app->lowongan->tipe_pekerjaan ?? 'Internship',
            'date_applied' => $app->created_at->format('d M Y'),
            'status' => $app->status,
        ]);

        return response()->json([
            'status' => 'success', 
            'stats' => $stats, 
            'candidates' => $tableData
        ]);
    }

    
    public function getCandidateDetail($id)
    {
        $application = JobApplication::with([
            'user.internProfile', 
            'lowongan'
        ])->where('application_id', $id)->firstOrFail();

        $user = $application->user;
        $profile = $user->internProfile;
        $answers = TestAnswer::where('user_id', $user->user_id)
            ->orderBy('id')
            ->get(['id', 'question_text', 'user_answer'])
            ->map(fn ($answer, $index) => [
                'id' => $answer->id,
                'nomor' => $index + 1,
                'question' => $answer->question_text,
                'question_text' => $answer->question_text,
                'answer' => $answer->user_answer,
                'user_answer' => $answer->user_answer,
            ])
            ->values();
        $experiences = InternExperience::where('user_id', $user->user_id)
            ->orderByDesc('id')
            ->get(['id', 'title', 'company', 'period', 'document_path'])
            ->map(fn ($experience) => $this->transformDocumentItem([
                'id' => $experience->id,
                'title' => $experience->title,
                'company' => $experience->company,
                'period' => $experience->period,
                'document_path' => $experience->document_path,
            ]))
            ->values();
        $certifications = InternCertification::where('user_id', $user->user_id)
            ->orderByDesc('id')
            ->get(['id', 'name', 'document_path'])
            ->map(fn ($certification) => $this->transformDocumentItem([
                'id' => $certification->id,
                'name' => $certification->name,
                'document_path' => $certification->document_path,
            ]))
            ->values();
        $photoUrl = $this->assetFromPublicDisk($profile?->foto);
        $educationDocumentUrl = $this->assetFromPublicDisk($profile?->dokumen_pendidikan_pdf);
        $cvUrl = $this->assetFromPublicDisk($profile?->cv_pdf);
        $portfolioUrl = $this->assetFromPublicDisk($profile?->portofolio_pdf);
        $recommendationUrl = $this->assetFromPublicDisk($profile?->surat_rekomendasi_pdf);
        $ktpUrl = $this->assetFromPublicDisk($profile?->ktp_pdf);
        $transcriptUrl = $this->assetFromPublicDisk($profile?->transkrip_nilai_pdf);
        $birthDisplay = trim(collect([
            $profile?->tempat_lahir,
            optional($profile?->tanggal_lahir)->format('d M Y'),
        ])->filter()->implode(', '));

        return response()->json([
            'status' => 'success',
            'data' => [
                // Bagian Kiri UI: Data Pribadi
                'personal' => [
                    'name' => $user->nama,
                    'photo' => $photoUrl,
                    'foto' => $photoUrl,
                    'role' => $profile?->jenjang ?? 'Candidate',
                    'biodata' => $profile?->tentang_saya ?? 'Belum ada biodata.',
                    'gender' => $profile?->jenis_kelamin ?? '-',
                    'birth' => $birthDisplay !== '' ? $birthDisplay : '-',
                    'email' => $user->email,
                    'phone' => $profile?->notelp ?? $user->notelp,
                    'address' => trim(collect([
                        $profile?->detail_alamat,
                        $profile?->kabupaten,
                        $profile?->provinsi,
                    ])->filter()->implode(', ')) ?: '-',
                    'socials' => [
                        'linkedin' => $profile?->linkedin,
                        'instagram' => $profile?->instagram,
                    ]
                ],
                // Bagian Tengah: Akademik & Assessment
                'academic' => [
                    'education' => [
                        'universitas' => $profile?->universitas ?? '-',
                        'jurusan' => $profile?->jurusan ?? '-',
                        'jenjang' => $profile?->jenjang ?? '-',
                        'ipk' => $profile?->ipk,
                        'tahun_masuk' => $profile?->tahun_masuk,
                        'tahun_lulus' => $profile?->tahun_lulus,
                        'document' => $educationDocumentUrl,
                        'document_url' => $educationDocumentUrl,
                    ],
                    'university' => $profile?->universitas ?? '-',
                    'major' => $profile?->jurusan ?? '-',
                    'ipk' => $profile?->ipk ?? '0.00',
                    'graduation' => $profile?->tahun_lulus ?? '-',
                    'experiences' => $experiences,
                    'experience' => $experiences,
                    'certifications' => $certifications,
                ],
                'assessment' => [
                    'score' => $profile?->skor_pretest ?? 0,
                    'summary' => $answers->isNotEmpty()
                        ? 'Jawaban pre-test tersedia untuk direview oleh mitra.'
                        : 'Belum ada hasil assessment untuk ditampilkan.',
                    'date' => optional($profile?->test_finished_at)->format('d M Y, H:i') ?? '-',
                    'answers' => $answers,
                ],
                // Bagian Kanan: Dokumen
                'documents' => [
                    'cv' => $cvUrl,
                    'portfolio' => $portfolioUrl,
                    'ktp' => $ktpUrl,
                    'recommendation_letter' => $recommendationUrl,
                    'transcript' => $transcriptUrl,
                    'education_document' => $educationDocumentUrl,
                ],
                'profile' => [
                    'foto' => $photoUrl,
                    'tentang_saya' => $profile?->tentang_saya,
                    'jenis_kelamin' => $profile?->jenis_kelamin,
                    'tempat_lahir' => $profile?->tempat_lahir,
                    'tanggal_lahir' => optional($profile?->tanggal_lahir)->format('Y-m-d'),
                    'notelp' => $profile?->notelp ?? $user->notelp,
                    'provinsi' => $profile?->provinsi,
                    'kabupaten' => $profile?->kabupaten,
                    'detail_alamat' => $profile?->detail_alamat,
                    'universitas' => $profile?->universitas,
                    'jurusan' => $profile?->jurusan,
                    'jenjang' => $profile?->jenjang,
                    'ipk' => $profile?->ipk,
                    'tahun_masuk' => $profile?->tahun_masuk,
                    'tahun_lulus' => $profile?->tahun_lulus,
                    'linkedin' => $profile?->linkedin,
                    'instagram' => $profile?->instagram,
                ],
            ]
        ]);
    }

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
                'password' => Str::random(16),
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

    
    public function updateCandidateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:PENDING,REVIEWED,SHORTLISTED,INTERVIEW,REJECTED,OFFER', 
        ]);

        $application = JobApplication::with(['user', 'lowongan.companyProfile'])
            ->where('application_id', $id)
            ->firstOrFail();
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
                'id' => $app->application_id,
                'application_id' => $app->application_id,
                'candidate_id' => 'KDT-' . str_pad($app->user_id, 3, '0', STR_PAD_LEFT),
                'name' => $app->user->nama,
                'position' => $app->lowongan->judul_posisi ?? $app->lowongan->judul_pekerjaan,
                'status' => $app->status,
            ])
        ]);
    }

    private function assetFromPublicDisk(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return asset('storage/' . ltrim($path, '/'));
    }

    private function transformDocumentItem(array $item): array
    {
        $documentUrl = $this->assetFromPublicDisk($item['document_path'] ?? null);

        return array_merge($item, [
            'document' => $documentUrl,
            'file' => $documentUrl,
            'document_url' => $documentUrl,
            'file_url' => $documentUrl,
            'preview_url' => $documentUrl,
            'supporting_document_url' => $documentUrl,
        ]);
    }
}
