<?php

namespace App\Http\Controllers;

use App\Models\InternProfile;
use App\Models\JobApplication;
use App\Models\TestAnswer;
use App\Models\InternExperience;
use App\Models\InternCertification;
use App\Models\Lowongan; // Pastikan Abang buat model untuk tabel lowongan
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class InternController extends Controller
{
    /**
     * Ambil Data Profil Lengkap
     */
    public function getProfile()
    {
        $user = Auth::user();
        $profile = InternProfile::where('user_id', $user->user_id)->first();
        
        if (!$profile) return response()->json(['message' => 'Profil tidak ditemukan'], 404);

        $experiences = InternExperience::where('user_id', $user->user_id)->get();
        $certifications = InternCertification::where('user_id', $user->user_id)->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'nama' => $user->nama, 
                'email' => $user->email,
                'universitas' => $profile->universitas,
                'jurusan' => $profile->jurusan,
                'ipk' => $profile->ipk,
                'provinsi' => $profile->provinsi,
                'kabupaten' => $profile->kabupaten,
                'foto' => $profile->foto ? asset('storage/' . $profile->foto) : null,
                'cv' => $profile->cv_pdf ? asset('storage/' . $profile->cv_pdf) : null,
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

        $request->validate([
            'foto'           => 'nullable|image|max:2048',
            'cv_pdf'         => 'nullable|mimes:pdf|max:5120',
            'portofolio_pdf' => 'nullable|mimes:pdf|max:5120',
            'ipk'            => 'nullable|numeric|between:0,4.00',
        ]);

        if ($request->hasFile('foto')) {
            if ($profile->foto) Storage::disk('public')->delete($profile->foto);
            $profile->foto = $request->file('foto')->store('profiles/photos', 'public');
        }
        if ($request->hasFile('cv_pdf')) {
            if ($profile->cv_pdf) Storage::disk('public')->delete($profile->cv_pdf);
            $profile->cv_pdf = $request->file('cv_pdf')->store('profiles/documents', 'public');
        }
        if ($request->hasFile('portofolio_pdf')) {
            if ($profile->portofolio_pdf) Storage::disk('public')->delete($profile->portofolio_pdf);
            $profile->portofolio_pdf = $request->file('portofolio_pdf')->store('profiles/documents', 'public');
        }

        $profile->update($request->only([
            'tentang_saya', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin',
            'provinsi', 'kabupaten', 'detail_alamat', 'universitas', 'jurusan',
            'jenjang', 'ipk', 'tahun_masuk', 'tahun_lulus', 'linkedin', 'instagram', 'notelp'
        ]));

        // Update status kelengkapan
        if ($profile->foto && $profile->cv_pdf && $profile->universitas) {
            $profile->is_profile_complete = 1;
            $profile->save();
        }

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

        if (!$profile->test_started_at) {
            $profile->test_started_at = now();
            $profile->save();
        }

        return response()->json([
            'status' => 'success', 
            'message' => 'Test dimulai!',
            'test_started_at' => $profile->test_started_at
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

        foreach ($request->answers as $ans) {
            TestAnswer::create([
                'user_id' => $user->user_id,
                'question_text' => $ans['question'],
                'user_answer' => $ans['selected_option'],
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
}