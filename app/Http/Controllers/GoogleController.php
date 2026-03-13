<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\InternProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class GoogleController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            DB::beginTransaction();

            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                $user = User::create([
                    'nama'      => $googleUser->getName(),
                    'email'     => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'role'      => 'intern', 
                    'password'  => bcrypt(Str::random(16)),
                    'notelp'    => '-', 
                ]);

                InternProfile::create([
                    'user_id' => $user->user_id,
                    'is_profile_complete' => false
                ]);
            }

            DB::commit();

            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect ke React
            return redirect('http://localhost:3000/login-success?token=' . $token);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}