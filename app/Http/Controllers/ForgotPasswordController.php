<?php

namespace App\Http\Controllers;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ForgotPasswordController extends Controller
{
    public function sendResetLink(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if ($user) {
            $plainToken = Str::random(64);
            $hashedToken = hash('sha256', $plainToken);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                [
                    'token' => $hashedToken,
                    'created_at' => now(),
                ]
            );

            $frontendUrl = rtrim(config('app.frontend_url'), '/');
            $resetLink = $frontendUrl.'/reset-password?token='.$plainToken.'&email='.urlencode($user->email);

            try {
                Mail::send('emails.reset-password', [
                    'name' => $user->nama,
                    'resetLink' => $resetLink,
                    'expiresInMinutes' => $this->resetTokenExpiresInMinutes(),
                ], function ($message) use ($user) {
                    $message->to($user->email)
                        ->subject('Reset Password Vocaseek');
                });
            } catch (\Throwable $exception) {
                DB::table('password_reset_tokens')->where('email', $user->email)->delete();

                Log::error('Gagal mengirim email reset password.', [
                    'email' => $user->email,
                    'message' => $exception->getMessage(),
                ]);

                return response()->json([
                    'status' => 'error',
                    'message' => 'Email reset password gagal dikirim. Periksa konfigurasi mail server.',
                ], 500);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Jika email terdaftar, tautan reset kata sandi telah dikirim.'
        ]);
    }

    public function validateResetToken(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
        ]);

        $resetToken = DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->first();

        if (!$this->isValidResetToken($resetToken, $validated['token'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token tidak valid atau sudah kadaluarsa.',
            ], 400);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Token valid.',
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        $resetToken = DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->first();

        if (!$this->isValidResetToken($resetToken, $validated['token'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token tidak valid atau sudah kadaluarsa.'
            ], 400);
        }

        $user = User::where('email', $validated['email'])->first();
        $user->update([
            'password' => Hash::make($validated['password'])
        ]);

        DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();
        $user->tokens()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Kata sandi berhasil diperbarui.'
        ]);
    }

    private function isValidResetToken(?object $resetToken, string $plainToken): bool
    {
        if (!$resetToken) {
            return false;
        }

        $expiresAt = Carbon::parse($resetToken->created_at)->addMinutes($this->resetTokenExpiresInMinutes());

        if (now()->greaterThan($expiresAt)) {
            return false;
        }

        return hash_equals($resetToken->token, hash('sha256', $plainToken));
    }

    private function resetTokenExpiresInMinutes(): int
    {
        return (int) env('PASSWORD_RESET_TOKEN_EXPIRES', 60);
    }
}
