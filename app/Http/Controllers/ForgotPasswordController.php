<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ForgotPasswordController extends Controller
{
    /**
     * LOGIKA GAMBAR 2: Request Link Reset
     */
    public function sendResetLink(Request $request)
    {
        // Validasi: Email harus ada di tabel users
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ], [
            'email.exists' => 'Email tidak terdaftar di sistem kami.'
        ]);

        $token = Str::random(64);

        // Simpan atau update token di tabel password_reset_tokens
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => $token,
                'created_at' => now()
            ]
        );

        // Link ini yang akan dikirim ke email user
        // Nantinya di React, kamu harus punya route /reset-password
        $resetLink = "http://localhost:3000/reset-password?token=" . $token . "&email=" . $request->email;

        // Logika kirim email sederhana (Tanpa template dulu)
        Mail::raw("Halo! Klik link ini untuk reset password Vocaseek Anda: " . $resetLink, function ($message) use ($request) {
            $message->to($request->email)
                    ->subject('Reset Password Vocaseek');
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Tautan reset kata sandi telah dikirim ke email Anda.'
        ]);
    }

    /**
     * LOGIKA GAMBAR 3: Proses Reset Password Baru
     */
    public function resetPassword(Request $request)
    {
        // Validasi input dari Gambar 3
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required',
            'password' => 'required|min:8|confirmed', // Harus ada password_confirmation di request
        ]);

        // Cek apakah token dan email cocok di database
        $checkToken = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$checkToken) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token tidak valid atau sudah kadaluarsa.'
            ], 400);
        }

        // Update password user
        $user = User::where('email', $request->email)->first();
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Hapus token supaya tidak bisa dipakai lagi
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Respon ini akan mentrigger Gambar 4 (Sukses) di React
        return response()->json([
            'status' => 'success',
            'message' => 'Kata sandi berhasil diperbarui.'
        ]);
    }
}