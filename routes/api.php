<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\InternController;

// 1. Route Publik (Tanpa Login)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// 2. Route Terproteksi (Harus Login)
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth & Profile
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/intern/update-profile', [InternController::class, 'updateProfile']);
    
    // Alur Pre-test (Timer & Skor)
    Route::post('/intern/start-test', [InternController::class, 'startTest']);
    Route::post('/intern/submit-test', [InternController::class, 'submitPreTest']);
});

// Testing
Route::get('/test', function () {
    return response()->json(['message' => 'API Vokaseek Aktif']);
});