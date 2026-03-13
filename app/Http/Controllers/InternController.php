<?php

namespace App\Http\Controllers;

use App\Models\InternProfile;
use App\Models\JobApplication;
use App\Models\TestAnswer;
use App\Models\InternExperience;
use App\Models\InternCertification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class InternController extends Controller
{
    /**
     * Ambil Data Profil Lengkap (Biodata + Pengalaman + Sertifikasi)
     */
    public function getProfile()
    {
        $user = Auth::user();
        // Load profile beserta relasi pengalaman dan sertifikasi
        $profile = InternProfile::where('user_id', $user->user_id)->first();
        
        if (!$profile) return response()->json(['message' => 'Profil tidak ditemukan'], 404);

        $experiences = InternExperience::where('user_id', $user->user_id)->get();
        $certifications = InternCertification::where('user_id', $user->user_id)->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'nama' => $user->name,
                'email' => $user->email,
                'universitas' => $profile->universitas,
                'jurusan' => $profile->jurusan,
                'ipk' => $profile->ipk,
                'provinsi' => $profile->provinsi,
                'kabupaten' => $profile->kabupaten,
                'foto' => $profile->foto ? asset('storage/' . $profile->foto) : null,
                'cv' => $profile->cv_pdf ? asset('storage/' . $profile->cv_pdf) : null,
                'instagram' => $profile->instagram,
                'is_complete' => $profile->is_profile_complete,
                // Data Opsional (Nilai Plus)
                'pengalaman' => $experiences,
                'sertifikasi' => $certifications
            ]
        ]);
    }

    /**
     * Update Profile Utama (Langkah 1)
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $profile = InternProfile::where('user_id', $user->user_id)->first();

        $request->validate([
            'foto'           => 'nullable|image|max:1024',
            'cv_pdf'         => 'nullable|mimes:pdf|max:2048',
            'portofolio_pdf' => 'nullable|mimes:pdf|max:2048',
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
            'jenjang', 'ipk', 'tahun_masuk', 'tahun_lulus', 'linkedin', 'instagram'
        ]));

        // Syarat minimal kelengkapan profil
        if ($profile->foto && $profile->cv_pdf && $profile->universitas) {
            $profile->is_profile_complete = 1;
            $profile->save();
        }

        return response()->json(['status' => 'success', 'message' => 'Profil diperbarui!']);
    }

    /**
     * Tambah Pengalaman Kerja (Opsional - Nilai Plus)
     */
    public function addExperience(Request $request)
    {
        $request->validate([
            'title'   => 'required|string',
            'company' => 'required|string',
            'period'  => 'required|string',
        ]);

        $exp = InternExperience::create([
            'user_id' => Auth::id(),
            'title'   => $request->title,
            'company' => $request->company,
            'period'  => $request->period,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Pengalaman ditambahkan!', 'data' => $exp]);
    }

    /**
     * Tambah Sertifikasi (Opsional - Nilai Plus)
     */
    public function addCertification(Request $request)
    {
        $request->validate(['name' => 'required|string']);

        $cert = InternCertification::create([
            'user_id' => Auth::id(),
            'name'    => $request->name,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Sertifikasi ditambahkan!', 'data' => $cert]);
    }

    /**
     * Memulai Tes (Langkah 2)
     */
    public function startTest()
    {
        $profile = InternProfile::where('user_id', Auth::id())->first();

        if (!$profile || !$profile->is_profile_complete) {
            return response()->json(['status' => 'error', 'message' => 'Lengkapi profil dulu!'], 403);
        }

        if (!$profile->test_started_at) {
            $profile->update(['test_started_at' => now()]);
        }

        return response()->json(['status' => 'success', 'test_started_at' => $profile->test_started_at]);
    }

    /**
     * Submit Jawaban Tes (Review Kualitatif Admin)
     */
    public function submitPreTest(Request $request)
    {
        $request->validate([
            'answers' => 'required|array',
            'answers.*.question' => 'required|string',
            'answers.*.selected_option' => 'required|string',
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

        $profile->update([
            'test_finished_at' => now(),
            'pretest_score' => null 
        ]);

        return response()->json(['status' => 'success', 'message' => 'Tes selesai! Admin akan mereview jawaban Anda.']);
    }

    /**
     * Melamar Pekerjaan (Langkah 3)
     */
    public function applyJob(Request $request)
    {
        $request->validate([
            'job_id' => 'required|integer',
            'motivation' => 'required|string'
        ]);

        $user = Auth::user();
        $profile = InternProfile::where('user_id', $user->user_id)->first();

        if (!$profile->is_profile_complete || !$profile->test_finished_at) {
            return response()->json(['status' => 'error', 'message' => 'Selesaikan profil dan tes dulu!'], 403);
        }

        JobApplication::create([
            'user_id' => $user->user_id,
            'job_id'  => $request->job_id,
            'motivation' => $request->motivation,
            'status'  => 'Sedang Diproses'
        ]);

        return response()->json(['status' => 'success', 'message' => 'Kamu berhasil mendaftar!']);
    }

    /**
     * Riwayat Lamaran
     */
    public function getMyApplications()
    {
        $data = JobApplication::with('job')->where('user_id', Auth::id())->get();
        return response()->json(['status' => 'success', 'data' => $data]);
    }
}