<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\InternController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\TalentController;

/*
|--------------------------------------------------------------------------
| Public Routes (Akses Tanpa Login / Tanpa Token)
|--------------------------------------------------------------------------
*/

// 1. Data Landing Page (Gambar 1)
// Menggunakan fungsi khusus agar pelamar bisa lihat tanpa login
Route::get('/landing-stats', [CompanyController::class, 'getPublicStats']);
Route::get('/popular-vacancies', [CompanyController::class, 'getPublicJobs']);

// 2. Auth Manual & Socialite
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

// 3. Fitur Lupa Password
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);

// Testing Koneksi API
Route::get('/test', function () {
    return response()->json(['message' => 'API Vokaseek Aktif & Terhubung']);
});

/*
|--------------------------------------------------------------------------
| Protected Routes (Wajib Login / Membawa Bearer Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // Logout Universal
    Route::post('/logout', [AuthController::class, 'logout']);
    
    /* |--------------------------------------------------------------------------
    | --- FITUR INTERN (POV PELAMAR) ---
    |--------------------------------------------------------------------------
    */
    Route::prefix('intern')->group(function () {
        Route::get('/profile', [InternController::class, 'getProfile']);
        Route::put('/update-profile', [InternController::class, 'updateProfile']);
        Route::post('/start-test', [InternController::class, 'startTest']);
        Route::post('/submit-test', [InternController::class, 'submitPreTest']);
        Route::post('/apply', [InternController::class, 'applyJob']);
        Route::get('/applications', [InternController::class, 'getMyApplications']);
    });

    /* |--------------------------------------------------------------------------
    | --- FITUR COMPANY (POV MITRA / HRD) ---
    |--------------------------------------------------------------------------
    */
    Route::prefix('company')->group(function () {
        
        // 1. Dashboard (Statistik Utama & Recent Applicants - Gambar 1 Dashboard)
        Route::get('/dashboard', [CompanyController::class, 'getDashboardData']);

        // 2. Manajemen Lowongan (CRUD Lowongan - Gambar 1 s/d 5)
        Route::get('/jobs', [CompanyController::class, 'getJobPostings']);
        Route::post('/jobs', [CompanyController::class, 'storeJob']);
        Route::put('/jobs/{id}', [CompanyController::class, 'updateJob']); 
        Route::delete('/jobs/{id}', [CompanyController::class, 'destroyJob']);

        // 3. Manajemen Talent (Seleksi Pelamar - Gambar 1 s/d 7 Talent)
        // Menu Semua Kandidat & Filter
        Route::get('/talent/candidates', [TalentController::class, 'getAllCandidates']);
        // api.php di dalam grup company/talent
Route::get('/talent/candidates/{id}/detail', [TalentController::class, 'getCandidateDetail']);
        
        // Tambah Kandidat Manual (Gambar 3)
        Route::post('/talent/candidates/manual', [TalentController::class, 'storeManualCandidate']);

        
        
        // Update Status & Kirim Email Otomatis (Popup Gambar 6)
        Route::put('/talent/candidates/{id}/status', [TalentController::class, 'updateCandidateStatus']);
        
        // Menu Kandidat Terpilih (Gambar 7)
        Route::get('/talent/selected', [TalentController::class, 'getSelectedCandidates']);
    });
});