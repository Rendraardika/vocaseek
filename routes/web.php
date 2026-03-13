<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GoogleController; // GANTI INI
use App\Http\Controllers\LandingPageController;

// Landing Page Dinamis
Route::get('/', [LandingPageController::class, 'index'])->name('home');

// Auth Google - SEKARANG MANGGIL GOOGLE CONTROLLER
Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle'])->name('google.login');
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);