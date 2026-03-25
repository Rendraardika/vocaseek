<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CompanyController; // Tambahkan ini
use App\Http\Controllers\InternController;  // Tambahkan ini
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 1. Landing Page
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// 2. Dashboard General (Bawaan Breeze)
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// 3. Grup Middleware AUTH (Wajib Login)
Route::middleware('auth')->group(function () {
    
    // Profile Management (Bawaan Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // --- FITUR COMPANY / MITRA (SESUAI GAMBAR 1) ---
    Route::prefix('company')->group(function () {
        // Dashboard Stats & Recent Applicants
        Route::get('/dashboard', [CompanyController::class, 'getDashboardData'])
            ->name('company.dashboard');
            
        // Manajemen Lowongan
        Route::get('/jobs', [CompanyController::class, 'getJobs'])
            ->name('company.jobs');
        Route::post('/jobs', [CompanyController::class, 'storeJob'])
            ->name('company.jobs.store');
    });

    // --- FITUR INTERN / PELAMAR ---
    Route::prefix('intern')->group(function () {
        Route::get('/applications', [InternController::class, 'getMyApplications'])
            ->name('intern.applications');
    });
});

require __DIR__.'/auth.php';