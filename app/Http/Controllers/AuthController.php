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
    /**
     * Handle Registrasi User
     */
    public function register(Request $request)
    {
        // 1. Validasi Input
        $request->validate([
            'nama'     => 'required|string|max:100',
            'email'    => 'required|string|email|max:100|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role'     => 'required|in:intern,company',
            'notelp'   => 'nullable|string|max:20',
        ]);

        // 2. Gunakan Database Transaction agar data konsisten
        DB::beginTransaction();

        try {
            // Simpan ke tabel users
            $user = User::create([
                'nama'     => $request->nama,
                'email'    => $request->email,
                'password' => Hash::make($request->password), // Password wajib di-hash
                'role'     => $request->role,
                'notelp'   => $request->notelp,
            ]);

            // 3. Buat profil kosong sesuai role
            if ($user->role === 'intern') {
                InternProfile::create([
                    'user_id' => $user->user_id,
                    'status_mahasiswa' => 'AKTIF' // default value
                ]);
            } elseif ($user->role === 'company') {
                CompanyProfile::create([
                    'user_id' => $user->user_id,
                    'nama_perusahaan' => $request->nama // gunakan nama user sebagai nama awal perusahaan
                ]);
            }

            DB::commit();

            return response()->json(['message' => 'Registrasi berhasil!'], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Registrasi gagal: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Handle Login User
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            
            $user = Auth::user();
            return response()->json([
                'message' => 'Login berhasil',
                'user'    => $user
            ], 200);
        }

        return response()->json(['message' => 'Email atau password salah.'], 401);
    }

    /**
     * Handle Logout
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Berhasil logout']);
    }
}