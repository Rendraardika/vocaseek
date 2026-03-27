<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\InternController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\TalentController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminTalentController;
use App\Http\Controllers\Auth\AdminPartnerController;
use App\Http\Controllers\Auth\AdminUserController;
use App\Http\Controllers\Auth\AdminVerificationController;
use App\Http\Controllers\Auth\AdminProfileController;


Route::get('/landing-stats', [CompanyController::class, 'getPublicStats']);
Route::get('/popular-vacancies', [CompanyController::class, 'getPublicJobs']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);

Route::get('/test', function () {
    return response()->json(['message' => 'API Vokaseek Aktif & Terhubung']);
});


Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // --- POV INTERN 
    Route::prefix('intern')->group(function () {
        Route::get('/profile', [InternController::class, 'getProfile']);
        Route::put('/update-profile', [InternController::class, 'updateProfile']);
        Route::post('/start-test', [InternController::class, 'startTest']);
        Route::post('/submit-test', [InternController::class, 'submitPreTest']);
        Route::post('/apply', [InternController::class, 'applyJob']);
        Route::get('/applications', [InternController::class, 'getMyApplications']);
    });

    // --- POV COMPANY 
    Route::prefix('company')->group(function () {
        Route::get('/dashboard', [CompanyController::class, 'getDashboardData']);
        Route::get('/jobs', [CompanyController::class, 'getJobPostings']);
        Route::post('/jobs', [CompanyController::class, 'storeJob']);
        Route::put('/jobs/{id}', [CompanyController::class, 'updateJob']); 
        Route::delete('/jobs/{id}', [CompanyController::class, 'destroyJob']);

        Route::get('/talent/candidates', [TalentController::class, 'getAllCandidates']);
        Route::get('/talent/candidates/{id}/detail', [TalentController::class, 'getCandidateDetail']);
        Route::post('/talent/candidates/manual', [TalentController::class, 'storeManualCandidate']);
        Route::put('/talent/candidates/{id}/status', [TalentController::class, 'updateCandidateStatus']);
        Route::get('/talent/selected', [TalentController::class, 'getSelectedCandidates']);
    });

    // --- POV ADMIN 
    Route::prefix('admin')->group(function () {
        
        // 1. AREA BERSAMA 
        Route::middleware(['role:super_admin,staff_admin'])->group(function () {
            
            // Profil Admin 
            Route::prefix('profile')->group(function () {
                Route::get('/', [AdminProfileController::class, 'show']);
                Route::post('/update', [AdminProfileController::class, 'update']);
                Route::put('/change-password', [AdminProfileController::class, 'changePassword']);
            });

            // Dashboard & Talent
            Route::get('/overview', [AdminDashboardController::class, 'getOverview']);
            Route::get('/talents', [AdminTalentController::class, 'index']);
            
            // Partner Management 
            Route::get('/partners', [AdminPartnerController::class, 'index']);
            Route::get('/partners/{id}', [AdminPartnerController::class, 'show']); 
            
            // Verification Review
            Route::prefix('verification')->group(function () {
                Route::get('/', [AdminVerificationController::class, 'index']); 
                Route::put('/{id}/review-status', [AdminVerificationController::class, 'updateReviewStatus']); 
                Route::get('/{id}/detail', [AdminVerificationController::class, 'show']);
            });
        });

        // 2. AREA KHUSUS 
        Route::middleware(['role:super_admin'])->group(function () {
            
            // User Management 
            Route::prefix('users-management')->group(function () {
                Route::get('/', [AdminUserController::class, 'index']);      
                Route::post('/', [AdminUserController::class, 'store']);
                Route::put('/{id}/status', [AdminUserController::class, 'updateStatus']); 
                Route::delete('/{id}', [AdminUserController::class, 'destroy']);
            });

            // Aksi Eksekutif
            Route::post('/partners', [AdminPartnerController::class, 'store']); 
            Route::delete('/partners/{id}', [AdminPartnerController::class, 'destroy']);
            Route::delete('/talents/{id}', [AdminTalentController::class, 'destroy']);
            Route::post('/verification/{id}/final', [AdminVerificationController::class, 'finalVerification']);
        });
    });
});