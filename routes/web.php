<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\LandingPageController;

// Landing Page Dinamis
Route::get('/', [LandingPageController::class, 'index'])->name('home');

// Auth Google
Route::get('/auth/google', [SocialiteController::class, 'redirect'])->name('google.login');
Route::get('/auth/google/callback', [SocialiteController::class, 'callback']);