<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\InternController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\GoogleController; // SUDAH DIPERBAIKI (Tanpa \Auth)

/*
|--------------------------------------------------------------------------
| Public Routes (Bisa diakses tanpa login)
|--------------------------------------------------------------------------
*/

// Auth Manual
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');

// Auth Google
Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

// Fitur Lupa Password
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);

// Testing Koneksi
Route::get('/test', function () {
    return response()->json(['message' => 'API Vokaseek Aktif']);
});

/*
|--------------------------------------------------------------------------
| Protected Routes (Wajib Login/Pakai Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Profile Management
    Route::get('/intern/profile', [InternController::class, 'getProfile']);
    Route::put('/intern/update-profile', [InternController::class, 'updateProfile']);
    
    // Alur Pre-test
    Route::post('/intern/start-test', [InternController::class, 'startTest']);
    Route::post('/intern/submit-test', [InternController::class, 'submitPreTest']);

    // Alur Lamaran
    Route::post('/intern/apply', [InternController::class, 'applyJob']);
    Route::get('/intern/applications', [InternController::class, 'getMyApplications']);
});