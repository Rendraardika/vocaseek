<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\InternProfile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Cek apakah user sudah ada, jika belum buat baru
            $user = User::firstOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'nama'     => $googleUser->getName(),
                    'password' => Hash::make(Str::random(24)),
                    'role'     => 'intern', 
                    'notelp'   => null,
                ]
            );

InternProfile::firstOrCreate(['user_id' => $user->user_id]);

            Auth::login($user);

            return redirect()->intended('/dashboard'); 

        } catch (\Exception $e) {
            return redirect('/login')->with('error', 'Gagal login Google: ' . $e->getMessage());
        }
    }
}