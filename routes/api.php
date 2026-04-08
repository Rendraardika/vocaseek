<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\ForgotPasswordController;

// --- APP CONTROLLERS ---
use App\Http\Controllers\InternController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\TalentController;

// --- ADMIN CONTROLLERS ---
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminTalentController;
use App\Http\Controllers\Auth\AdminPartnerController;
use App\Http\Controllers\Auth\AdminUserController;
use App\Http\Controllers\Auth\AdminVerificationController;
use App\Http\Controllers\Auth\AdminProfileController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/landing-stats', [CompanyController::class, 'getPublicStats']);
Route::get('/popular-vacancies', [CompanyController::class, 'getPublicJobs']);

// Auth Utama
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');

// Social Auth & Passwords
Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);

// Test Connection
Route::get('/test', function () {
    return response()->json(['message' => 'API Vokaseek Aktif & Terhubung']);
});

/*
|--------------------------------------------------------------------------
| Protected Routes (Wajib Login dengan Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // --- POV INTERN (Pelamar) ---
    Route::prefix('intern')->group(function () {
        Route::get('/profile', [InternController::class, 'getProfile']);
        Route::put('/update-profile', [InternController::class, 'updateProfile']);
        Route::post('/start-test', [InternController::class, 'startTest']);
        Route::post('/submit-test', [InternController::class, 'submitPreTest']);
        Route::post('/apply', [InternController::class, 'applyJob']);
        Route::get('/applications', [InternController::class, 'getMyApplications']);
    });

    // --- POV COMPANY (Mitra Perusahaan) ---
    Route::prefix('company')->group(function () {
        Route::get('/profile', [CompanyController::class, 'getCompanyProfile']); 
        Route::get('/dashboard', [CompanyController::class, 'getDashboardData']);
        
        // Fitur Seleksi Pelamar
        Route::get('/jobs/{jobId}/applicants', [CompanyController::class, 'getApplicantsByJob']);
        Route::put('/applications/{id}/status', [CompanyController::class, 'updateApplicationStatus']);

        // CRUD Lowongan
        Route::get('/jobs', [CompanyController::class, 'getJobPostings']);
        Route::post('/jobs', [CompanyController::class, 'storeJob']);
        Route::put('/jobs/{id}', [CompanyController::class, 'updateJob']); 
        Route::delete('/jobs/{id}', [CompanyController::class, 'destroyJob']);

        // Management Talent (Database Kandidat)
        Route::get('/talent/candidates', [TalentController::class, 'getAllCandidates']);
        Route::get('/talent/candidates/{id}/detail', [TalentController::class, 'getCandidateDetail']);
        Route::post('/talent/candidates/manual', [TalentController::class, 'storeManualCandidate']);
        Route::put('/talent/candidates/{id}/status', [TalentController::class, 'updateCandidateStatus']);
        Route::get('/talent/selected', [TalentController::class, 'getSelectedCandidates']);
    });

    // --- POV ADMIN (Super Admin & Staff) ---
    Route::prefix('admin')->group(function () {
        
        // AREA BERSAMA (Admin & Staff)
        Route::middleware(['role:super_admin,staff_admin'])->group(function () {
            
            Route::prefix('profile')->group(function () {
                Route::get('/', [AdminProfileController::class, 'show']);
                Route::post('/update', [AdminProfileController::class, 'update']);
                Route::put('/change-password', [AdminProfileController::class, 'changePassword']);
            });

            Route::get('/overview', [AdminDashboardController::class, 'getOverview']);
            Route::get('/talents', [AdminTalentController::class, 'index']);
            Route::get('/partners', [AdminPartnerController::class, 'index']);
            Route::get('/partners/{id}', [AdminPartnerController::class, 'show']); 
            
            Route::prefix('verification')->group(function () {
                Route::get('/', [AdminVerificationController::class, 'index']); 
                Route::put('/{id}/review-status', [AdminVerificationController::class, 'updateReviewStatus']); 
                Route::get('/{id}/detail', [AdminVerificationController::class, 'show']);
            });
        });

        // AREA KHUSUS (Hanya Super Admin)
        Route::middleware(['role:super_admin'])->group(function () {
            Route::prefix('users-management')->group(function () {
                Route::get('/', [AdminUserController::class, 'index']);      
                Route::post('/', [AdminUserController::class, 'store']);
                Route::put('/{id}/status', [AdminUserController::class, 'updateStatus']); 
                Route::delete('/{id}', [AdminUserController::class, 'destroy']);
            });

            Route::post('/partners', [AdminPartnerController::class, 'store']); 
            Route::delete('/partners/{id}', [AdminPartnerController::class, 'destroy']);
            Route::delete('/talents/{id}', [AdminTalentController::class, 'destroy']);
            Route::post('/verification/{id}/final', [AdminVerificationController::class, 'finalVerification']);
        });
    });
});