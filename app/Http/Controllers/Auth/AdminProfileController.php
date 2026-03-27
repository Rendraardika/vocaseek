<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class AdminProfileController extends Controller
{
    /**
     * 1. GET DATA PROFIL (Gambar Utama)
     */
    public function show()
    {
        $user = auth()->user();

        return response()->json([
            'status' => 'success',
            'data' => [
                'nama' => $user->nama,
                'email' => $user->email,
                'notelp' => $user->notelp,
                'id_karyawan' => 'VK-2024-' . str_pad($user->user_id, 3, '0', STR_PAD_LEFT),
                'role_name' => $user->role === 'super_admin' ? 'Master Admin Platform' : 'Staff Admin Platform',
                'foto' => $user->foto,
                'terdaftar_sejak' => $user->created_at->format('M Y'),
                'riwayat_aktivitas' => [
                    ['pesan' => 'Login Berhasil', 'waktu' => now()->format('H:i \W\I\B')],
                    ['pesan' => 'Memperbarui Pengguna: J. Doe', 'waktu' => 'Kemarin, 14:20 WIB'],
                ]
            ]
        ]);
    }

    /**
     * 2. GANTI PASSWORD (Hanya ini yang krusial untuk keamanan)
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'], // Cek sandi lama bener apa kagak
            'password' => ['required', 'confirmed', Rules\Password::defaults()], // Sandi baru + konfirmasi
        ]);

        auth()->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Kata sandi berhasil diperbarui!']);
    }

    /**
     * 3. UPDATE DATA INFORMASI AKUN (Nama & Telp)
     */
    public function update(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'notelp' => 'required|string',
        ]);

        $user->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Data profil berhasil disimpan!'
        ]);
    }
}