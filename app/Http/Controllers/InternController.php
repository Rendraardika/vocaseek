<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\InternProfile;
use App\Models\JobApplication;
use App\Models\TestAnswer;
use App\Models\InternExperience;
use App\Models\InternCertification;
use App\Models\Lowongan; // Pastikan Abang buat model untuk tabel lowongan
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class InternController extends Controller
{
    private function normalizeApplicationStatus(?string $status): string
    {
        return match ($status) {
            'HIRED', 'ACCEPTED', 'OFFER' => 'HIRED',
            'REJECTED', 'DECLINED' => 'REJECTED',
            default => 'PENDING',
        };
    }

    private function internStatusLabel(?string $status): string
    {
        return match ($this->normalizeApplicationStatus($status)) {
            'HIRED' => 'Diterima',
            'REJECTED' => 'Ditolak',
            default => 'Pending',
        };
    }

    public function getTestQuestions()
    {
        $user = Auth::user();
        $profile = InternProfile::where('user_id', $user->user_id)->first();

        if (!$profile || (int) $profile->is_profile_complete === 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lengkapi profil dulu sebelum mengakses pre-test.',
            ], 403);
        }

        if ($profile->test_finished_at) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pre-test hanya dapat dikerjakan satu kali.',
                'data' => [
                    'already_completed' => true,
                    'test_started_at' => $profile->test_started_at,
                    'test_finished_at' => $profile->test_finished_at,
                ],
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'questions' => $this->pretestQuestions(),
                'duration_minutes' => $this->pretestDurationMinutes(),
                'total_questions' => count($this->pretestQuestions()),
                'already_started' => (bool) $profile->test_started_at,
                'test_started_at' => $profile->test_started_at,
                'expires_at' => $this->expiresAt($profile),
            ],
        ]);
    }

    /**
     * Ambil Data Profil Lengkap
     */
    public function getProfile()
    {
        $user = Auth::user();
        $profile = InternProfile::where('user_id', $user->user_id)->first();
        
        if (!$profile) return response()->json(['message' => 'Profil tidak ditemukan'], 404);

        $experiences = InternExperience::where('user_id', $user->user_id)
            ->get()
            ->map(fn ($experience) => $this->transformDocumentItem([
                'id' => $experience->id,
                'title' => $experience->title,
                'company' => $experience->company,
                'period' => $experience->period,
                'document_path' => $experience->document_path,
            ]))
            ->values();
        $certifications = InternCertification::where('user_id', $user->user_id)
            ->get()
            ->map(fn ($certification) => $this->transformDocumentItem([
                'id' => $certification->id,
                'name' => $certification->name,
                'document_path' => $certification->document_path,
            ]))
            ->values();

        return response()->json([
            'status' => 'success',
            'data' => [
                'nama' => $user->nama, 
                'email' => $user->email,
                'universitas' => $profile->universitas,
                'jurusan' => $profile->jurusan,
                'ipk' => $profile->ipk,
                'tahun_masuk' => $profile->tahun_masuk,
                'tahun_lulus' => $profile->tahun_lulus,
                'provinsi' => $profile->provinsi,
                'kabupaten' => $profile->kabupaten,
                'foto' => $profile->foto ? asset('storage/' . $profile->foto) : null,
                'cv' => $profile->cv_pdf ? asset('storage/' . $profile->cv_pdf) : null,
                'cv_pdf' => $profile->cv_pdf ? asset('storage/' . $profile->cv_pdf) : null,
                'dokumen_pendidikan_pdf' => $profile->dokumen_pendidikan_pdf ? asset('storage/' . $profile->dokumen_pendidikan_pdf) : null,
                'education_document' => $profile->dokumen_pendidikan_pdf ? asset('storage/' . $profile->dokumen_pendidikan_pdf) : null,
                'education_document_url' => $profile->dokumen_pendidikan_pdf ? asset('storage/' . $profile->dokumen_pendidikan_pdf) : null,
                'portofolio_pdf' => $profile->portofolio_pdf ? asset('storage/' . $profile->portofolio_pdf) : null,
                'surat_rekomendasi_pdf' => $profile->surat_rekomendasi_pdf ? asset('storage/' . $profile->surat_rekomendasi_pdf) : null,
                'ktp_pdf' => $profile->ktp_pdf ? asset('storage/' . $profile->ktp_pdf) : null,
                'transkrip_nilai_pdf' => $profile->transkrip_nilai_pdf ? asset('storage/' . $profile->transkrip_nilai_pdf) : null,
                'instagram' => $profile->instagram,
                'is_complete' => (int) $profile->is_profile_complete,
                'pengalaman' => $experiences,
                'sertifikasi' => $certifications
            ]
        ]);
    }

    /**
     * Update Profile Utama
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $profile = InternProfile::where('user_id', $user->user_id)->first();
        $pengalaman = $this->normalizeArrayInput($request->input('pengalaman', $request->input('experiences')));
        $sertifikasi = $this->normalizeArrayInput($request->input('sertifikasi', $request->input('certifications')));
        $pengalamanFiles = $this->normalizeNestedFiles($request->file('pengalaman', $request->file('experiences', [])));
        $sertifikasiFiles = $this->normalizeNestedFiles($request->file('sertifikasi', $request->file('certifications', [])));

        $request->validate([
            'foto'           => 'nullable|image|max:2048',
            'cv_pdf'         => 'nullable|mimes:pdf|max:5120',
            'dokumen_pendidikan_pdf' => 'nullable|mimes:pdf|max:5120',
            'education_document' => 'nullable|mimes:pdf|max:5120',
            'portofolio_pdf' => 'nullable|mimes:pdf|max:5120',
            'surat_rekomendasi_pdf' => 'nullable|mimes:pdf|max:5120',
            'ktp_pdf' => 'nullable|mimes:pdf|max:5120',
            'transkrip_nilai_pdf' => 'nullable|mimes:pdf|max:5120',
            'ipk'            => 'nullable|numeric|between:0,4.00',
        ]);

        DB::transaction(function () use (
            $request,
            $profile,
            $user,
            $pengalaman,
            $sertifikasi,
            $pengalamanFiles,
            $sertifikasiFiles
        ) {
            if ($request->hasFile('foto')) {
                if ($profile->foto) Storage::disk('public')->delete($profile->foto);
                $profile->foto = $request->file('foto')->store('profiles/photos', 'public');
            }
            if ($request->hasFile('cv_pdf')) {
                if ($profile->cv_pdf) Storage::disk('public')->delete($profile->cv_pdf);
                $profile->cv_pdf = $request->file('cv_pdf')->store('profiles/documents', 'public');
            }
            $educationDocument = $request->file('dokumen_pendidikan_pdf', $request->file('education_document'));
            if ($educationDocument) {
                if ($profile->dokumen_pendidikan_pdf) {
                    Storage::disk('public')->delete($profile->dokumen_pendidikan_pdf);
                }
                $profile->dokumen_pendidikan_pdf = $educationDocument->store('profiles/documents', 'public');
            }
            if ($request->hasFile('portofolio_pdf')) {
                if ($profile->portofolio_pdf) Storage::disk('public')->delete($profile->portofolio_pdf);
                $profile->portofolio_pdf = $request->file('portofolio_pdf')->store('profiles/documents', 'public');
            }
            if ($request->hasFile('surat_rekomendasi_pdf')) {
                if ($profile->surat_rekomendasi_pdf) Storage::disk('public')->delete($profile->surat_rekomendasi_pdf);
                $profile->surat_rekomendasi_pdf = $request->file('surat_rekomendasi_pdf')->store('profiles/documents', 'public');
            }
            if ($request->hasFile('ktp_pdf')) {
                if ($profile->ktp_pdf) Storage::disk('public')->delete($profile->ktp_pdf);
                $profile->ktp_pdf = $request->file('ktp_pdf')->store('profiles/documents', 'public');
            }
            if ($request->hasFile('transkrip_nilai_pdf')) {
                if ($profile->transkrip_nilai_pdf) Storage::disk('public')->delete($profile->transkrip_nilai_pdf);
                $profile->transkrip_nilai_pdf = $request->file('transkrip_nilai_pdf')->store('profiles/documents', 'public');
            }

            $profile->fill($request->only([
                'tentang_saya', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin',
                'provinsi', 'kabupaten', 'detail_alamat', 'universitas', 'jurusan',
                'jenjang', 'ipk', 'tahun_masuk', 'tahun_lulus', 'linkedin', 'instagram', 'notelp'
            ]));

            if ($profile->foto && $profile->cv_pdf && $profile->universitas) {
                $profile->is_profile_complete = 1;
            }

            $profile->save();

            if ($request->exists('pengalaman') || $request->exists('experiences')) {
                $existingExperiences = InternExperience::where('user_id', $user->user_id)->get();

                foreach ($existingExperiences as $existingExperience) {
                    if ($existingExperience->document_path) {
                        Storage::disk('public')->delete($existingExperience->document_path);
                    }
                }

                InternExperience::where('user_id', $user->user_id)->delete();

                foreach ($pengalaman as $index => $item) {
                    $title = trim((string) ($item['title'] ?? $item['jabatan'] ?? ''));
                    $company = trim((string) ($item['company'] ?? $item['perusahaan'] ?? ''));
                    $period = trim((string) ($item['period'] ?? $item['periode'] ?? ''));
                    $documentPath = $this->storeNestedDocument(
                        $pengalamanFiles,
                        $index,
                        ['document', 'document_file', 'file', 'supporting_document']
                    );

                    if ($title === '' && $company === '' && $period === '' && !$documentPath) {
                        continue;
                    }

                    InternExperience::create([
                        'user_id' => $user->user_id,
                        'title' => $title !== '' ? $title : '-',
                        'company' => $company !== '' ? $company : '-',
                        'period' => $period !== '' ? $period : '-',
                        'document_path' => $documentPath,
                    ]);
                }
            }

            if ($request->exists('sertifikasi') || $request->exists('certifications')) {
                $existingCertifications = InternCertification::where('user_id', $user->user_id)->get();

                foreach ($existingCertifications as $existingCertification) {
                    if ($existingCertification->document_path) {
                        Storage::disk('public')->delete($existingCertification->document_path);
                    }
                }

                InternCertification::where('user_id', $user->user_id)->delete();

                foreach ($sertifikasi as $index => $item) {
                    $name = is_array($item)
                        ? trim((string) ($item['name'] ?? $item['nama'] ?? ''))
                        : trim((string) $item);
                    $documentPath = $this->storeNestedDocument(
                        $sertifikasiFiles,
                        $index,
                        ['document', 'document_file', 'file', 'supporting_document']
                    );

                    if ($name === '' && !$documentPath) {
                        continue;
                    }

                    InternCertification::create([
                        'user_id' => $user->user_id,
                        'name' => $name !== '' ? $name : 'Dokumen Pendukung',
                        'document_path' => $documentPath,
                    ]);
                }
            }
        });

        return response()->json(['status' => 'success', 'message' => 'Profil diperbarui!']);
    }

    /**
     * Memulai Tes
     */
    public function startTest()
    {
        $user = Auth::user();
        $profile = InternProfile::where('user_id', $user->user_id)->first();

        if (!$profile || (int)$profile->is_profile_complete === 0) {
            return response()->json(['status' => 'error', 'message' => 'Lengkapi profil dulu!'], 403);
        }

        if ($profile->test_finished_at) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pre-test hanya dapat dikerjakan satu kali.',
            ], 403);
        }

        if (!$profile->test_started_at) {
            $profile->test_started_at = now();
            $profile->save();
        }

        return response()->json([
            'status' => 'success', 
            'message' => 'Test dimulai!',
            'test_started_at' => $profile->test_started_at,
            'expires_at' => $this->expiresAt($profile),
            'duration_minutes' => $this->pretestDurationMinutes(),
            'total_questions' => count($this->pretestQuestions()),
        ]);
    }

    /**
     * Submit Jawaban Tes
     */
    public function submitPreTest(Request $request)
    {
        $request->validate([
            'answers' => 'required|array',
        ]);

        $user = Auth::user();
        $profile = InternProfile::where('user_id', $user->user_id)->first();
        $questionsById = collect($this->pretestQuestions())->keyBy('id');

        if (!$profile || (int) $profile->is_profile_complete === 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lengkapi profil dulu sebelum mengerjakan pre-test.',
            ], 403);
        }

        if ($profile->test_finished_at) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pre-test hanya dapat dikerjakan satu kali.',
            ], 403);
        }

        if (!$profile->test_started_at) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mulai pre-test terlebih dahulu.',
            ], 400);
        }

        if ($this->isTestExpired($profile)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Waktu pre-test sudah habis.',
                'expires_at' => $this->expiresAt($profile),
            ], 422);
        }

        if (count($request->answers) !== $questionsById->count()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jumlah jawaban tidak sesuai dengan jumlah soal.',
                'expected' => $questionsById->count(),
            ], 422);
        }

        $normalizedAnswers = collect($request->answers);
        $questionIds = $normalizedAnswers->pluck('question_id')->filter()->values();

        if ($questionIds->count() !== $questionsById->count() || $questionIds->unique()->count() !== $questionsById->count()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Setiap soal harus dijawab tepat satu kali.',
            ], 422);
        }

        if ($questionIds->sort()->values()->all() !== $questionsById->keys()->sort()->values()->all()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Daftar soal yang dikirim tidak valid.',
            ], 422);
        }

        foreach ($request->answers as $ans) {
            $question = $questionsById->get((int) ($ans['question_id'] ?? 0));
            $selectedOption = $ans['selected_option'] ?? null;

            if (!$question || !in_array($selectedOption, $question['options'], true)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Jawaban pre-test tidak valid.',
                ], 422);
            }

            TestAnswer::create([
                'user_id' => $user->user_id,
                'question_text' => $question['question'],
                'user_answer' => $selectedOption,
            ]);
        }

        $profile->update(['test_finished_at' => now()]);

        return response()->json(['status' => 'success', 'message' => 'Tes berhasil dikirim!']);
    }

    /**
     * Melamar Kerja (Final Step)
     */
    public function applyJob(Request $request)
    {
        $request->validate([
            'job_id' => 'required|integer', // Mengacu ke ID di tabel lowongan
        ]);

        $user = Auth::user();
        $profile = InternProfile::where('user_id', $user->user_id)->first();

        // Validasi: Profil Lengkap & Sudah Test
        if (!$profile->is_profile_complete || !$profile->test_finished_at) {
            return response()->json([
                'status' => 'error', 
                'message' => 'Selesaikan profil dan tes dulu sebelum melamar!'
            ], 403);
        }

        // Cek apakah sudah pernah melamar di posisi yang sama
        $exists = JobApplication::where('user_id', $user->user_id)
                                ->where('job_id', $request->job_id)
                                ->exists();
        
        if ($exists) {
            return response()->json(['message' => 'Anda sudah melamar di posisi ini.'], 400);
        }

        // Simpan Lamaran (Sesuai kolom di tabel job_applications Abang)
        JobApplication::create([
            'user_id' => $user->user_id,
            'job_id'  => $request->job_id,
            'status'  => 'PENDING' // Sesuai default ENUM di gambar DB
        ]);

        return response()->json(['status' => 'success', 'message' => 'Lamaran berhasil terkirim!']);
    }

    public function getMyApplications()
    {
        $user = Auth::user();

        $applications = JobApplication::with(['lowongan.companyProfile'])
            ->where('user_id', $user->user_id)
            ->latest()
            ->get();

        $data = $applications->map(function ($application) {
            $job = $application->lowongan;
            $company = $job?->companyProfile;
            $normalizedStatus = $this->normalizeApplicationStatus($application->status);

            return [
                'id' => $application->application_id,
                'application_id' => $application->application_id,
                'job_id' => $application->job_id,
                'status' => $normalizedStatus,
                'status_label' => $this->internStatusLabel($application->status),
                'raw_status' => $application->status,
                'applied_at' => optional($application->created_at)->format('d M Y'),
                'applied_at_iso' => optional($application->created_at)->toDateTimeString(),
                'job' => [
                    'id' => $job?->id,
                    'title' => $job?->judul_posisi ?? $job?->judul_pekerjaan ?? 'N/A',
                    'position' => $job?->judul_posisi ?? $job?->judul_pekerjaan ?? 'N/A',
                    'location' => $job?->lokasi ?? '-',
                    'type' => $job?->tipe_magang ?? $job?->tipe_pekerjaan ?? '-',
                    'salary' => $job?->gaji_per_bulan,
                    'tanggal_penutupan_lamaran' => optional($job?->tanggal_penutupan_lamaran)->format('Y-m-d'),
                    'tanggal_mulai_kerja' => optional($job?->tanggal_mulai_kerja)->format('Y-m-d'),
                    'close_date' => optional($job?->tanggal_penutupan_lamaran)->format('d M Y'),
                    'start_date' => optional($job?->tanggal_mulai_kerja)->format('d M Y'),
                ],
                'company' => [
                    'id' => $company?->id,
                    'name' => $company?->nama_perusahaan ?? 'N/A',
                    'company_name' => $company?->nama_perusahaan ?? 'N/A',
                    'logo_url' => $company?->logo_perusahaan ? asset('storage/' . ltrim($company->logo_perusahaan, '/')) : null,
                    'location' => $company?->alamat_kantor_pusat ?? '-',
                ],
            ];
        })->values();

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    private function pretestQuestions(): array
    {
        return config('pretest.questions', []);
    }

    private function pretestDurationMinutes(): int
    {
        return (int) config('pretest.duration_minutes', 20);
    }

    private function expiresAt(InternProfile $profile): ?string
    {
        if (!$profile->test_started_at) {
            return null;
        }

        return Carbon::parse($profile->test_started_at)
            ->addMinutes($this->pretestDurationMinutes())
            ->toDateTimeString();
    }

    private function isTestExpired(InternProfile $profile): bool
    {
        if (!$profile->test_started_at) {
            return false;
        }

        return now()->greaterThan(
            Carbon::parse($profile->test_started_at)->addMinutes($this->pretestDurationMinutes())
        );
    }

    private function normalizeArrayInput(mixed $value): array
    {
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : [];
        }

        return is_array($value) ? $value : [];
    }

    private function normalizeNestedFiles(mixed $value): array
    {
        return is_array($value) ? $value : [];
    }

    private function storeNestedDocument(array $items, int $index, array $keys): ?string
    {
        $item = $items[$index] ?? null;

        if (!is_array($item)) {
            return null;
        }

        foreach ($keys as $key) {
            $file = $item[$key] ?? null;

            if ($file) {
                return $file->store('profiles/documents', 'public');
            }
        }

        return null;
    }

    private function transformDocumentItem(array $item): array
    {
        $documentUrl = $this->documentUrl($item['document_path'] ?? null);

        return array_merge($item, [
            'document' => $documentUrl,
            'file' => $documentUrl,
            'document_url' => $documentUrl,
            'file_url' => $documentUrl,
            'preview_url' => $documentUrl,
            'supporting_document_url' => $documentUrl,
        ]);
    }

    private function documentUrl(?string $path): ?string
    {
        return $path ? asset('storage/' . ltrim($path, '/')) : null;
    }
}
