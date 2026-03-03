<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\InternProfile;
use App\Models\CompanyProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // 1. Validasi Lengkap sesuai kebutuhan Intern & Company
        $request->validate([
            'nama'     => 'required|string|max:100',
            'email'    => 'required|string|email|max:100|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role'     => 'required|in:intern,company',
            'notelp'   => 'required|string|max:20',
            'nib'      => 'required_if:role,company|string',
            'loa_pdf'  => 'required_if:role,company|mimes:pdf|max:2048',
            'akta_pdf' => 'required_if:role,company|mimes:pdf|max:2048',
        ]);

        DB::beginTransaction();
        try {
            // 2. Simpan Data User Utama
            $user = User::create([
                'nama'     => $request->nama,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => $request->role,
                'notelp'   => $request->notelp,
            ]);

            // 3. Logika Pembuatan Profil berdasarkan Role
            if ($user->role === 'intern') {
                InternProfile::create([
                    'user_id' => $user->user_id,
                    // Pastikan kolom ini ada di database atau hapus jika tidak digunakan
                    'is_profile_complete' => false 
                ]);
            } elseif ($user->role === 'company') {
                $loaPath  = $request->file('loa_pdf')->store('documents/loa', 'public');
                $aktaPath = $request->file('akta_pdf')->store('documents/akta', 'public');

                CompanyProfile::create([
                    'user_id'         => $user->user_id,
                    'nama_perusahaan' => $request->nama_perusahaan ?? $request->nama,
                    'notelp'          => $request->notelp,
                    'nib'             => $request->nib,
                    'loa_pdf'         => $loaPath,
                    'akta_pdf'        => $aktaPath,
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Registrasi berhasil!'], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Gagal: ' . $e->getMessage()], 500);
        }
    }

    public function login(Request $request)
    {
        // 1. Validasi Input Login
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        // 2. Cek Kredensial
        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            
            // 3. PEMBUATAN TOKEN SANCTUM (Penting agar bisa akses update-profile)
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login berhasil',
                'token'   => $token,
                'user'    => $user
            ], 200);
        }

        return response()->json(['message' => 'Email atau password salah.'], 401);
    }

    public function logout(Request $request)
    {
        // Menghapus token saat ini
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Berhasil logout'], 200);
    }
}