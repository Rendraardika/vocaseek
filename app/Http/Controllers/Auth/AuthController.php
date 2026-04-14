<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\InternProfile;
use App\Models\CompanyProfile;

class AuthController extends Controller
{
    // 1. FUNGSI LOGIN
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::check()) {
            Auth::logout();
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Email atau Password salah'], 401);
        }

        $request->session()->regenerate();

        $user = Auth::user();

        if ($user->role === 'company') {
            $companyProfile = $user->companyProfile;

            if (!$companyProfile || $companyProfile->status_mitra !== 'active') {
                Auth::logout();

                return response()->json([
                    'status' => 'error',
                    'message' => __('messages.auth.company_not_approved'),
                ], 403);
            }
        }

        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'token' => $token,
            'role' => $user->role, 
            'user' => $user->nama,
            'user_data' => [
                'user_id' => $user->user_id,
                'nama' => $user->nama,
                'email' => $user->email,
                'role' => $user->role,
                'notelp' => $user->notelp,
            ],
            'locale' => $user->preferred_locale ?? app()->getLocale(),
        ]);
    }

    // 2. FUNGSI REGISTER
    public function register(Request $request)
    {
        // Validasi dasar untuk semua role
        $rules = [
            'nama'     => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'notelp'   => 'required|string|max:20',
            'role'     => 'required|in:intern,company,super_admin,staff_admin',
        ];

        // Validasi tambahan khusus Company (Sesuai gambar UI Partner With Us)
        if ($request->role === 'company') {
            $rules['nama_perusahaan'] = 'required|string|max:255';
            $rules['nib']      = 'required|string|max:50';
            $rules['loa_pdf']  = 'required|mimes:pdf|max:5120'; // Sesuai UI max 5MB
            $rules['akta_pdf'] = 'required|mimes:pdf|max:5120';
        }

        $request->validate($rules);

        try {
            $user = DB::transaction(function () use ($request) {
                // Simpan ke tabel users
                $user = User::create([
                    'nama'     => $request->nama,
                    'email'    => $request->email,
                    'password' => $request->password,
                    'role'     => $request->role,
                    'notelp'   => $request->notelp,
                    'preferred_locale' => app()->getLocale(),
                ]);

                if ($request->role === 'company') {
                    // Simpan file ke storage/public/company/documents
                    $loaPath  = $request->file('loa_pdf')->store('company/documents', 'public');
                    $aktaPath = $request->file('akta_pdf')->store('company/documents', 'public');

                    // Simpan ke tabel company_profile sesuai screenshot HeidiSQL
                    CompanyProfile::create([
                        'user_id'         => $user->user_id, 
                        'nama_perusahaan' => $request->nama_perusahaan,
                        'notelp'          => $request->notelp,
                        'nib'             => $request->nib,
                        'loa_pdf'         => $loaPath,
                        'akta_pdf'        => $aktaPath,
                        'status_mitra'    => 'pending', // Sesuai kolom di DB Abang
                    ]);
                } elseif ($request->role === 'intern') {
                    // Buat profil intern kosong
                    InternProfile::create([
                        'user_id' => $user->user_id,
                        'is_profile_complete' => 0 // Sesuai tipe TINYINT di DB
                    ]);
                }

                return $user;
            });

            if ($user->role === 'company') {
                return response()->json([
                    'status'  => 'success',
                    'message' => __('messages.auth.company_register_pending'),
                    'user'    => $user->nama,
                    'role'    => $user->role,
                    'locale'  => $user->preferred_locale ?? app()->getLocale(),
                ], 201);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status'  => 'success',
                'message' => 'Registrasi Berhasil!',
                'token'   => $token,
                'user'    => $user->nama,
                'role'    => $user->role,
                'locale'  => $user->preferred_locale ?? app()->getLocale(),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal registrasi: ' . $e->getMessage()
            ], 500);
        }
    }

    // 3. FUNGSI LOGOUT
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Berhasil Logout!'
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized',
            ], 401);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'user_id' => $user->user_id,
                'nama' => $user->nama,
                'email' => $user->email,
                'role' => $user->role,
                'notelp' => $user->notelp,
                'preferred_locale' => $user->preferred_locale ?? app()->getLocale(),
                'google_id' => $user->google_id,
            ],
        ]);
    }
}
