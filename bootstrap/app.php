<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // WAJIB: Agar Sanctum bisa handle session/cookie antara React & Laravel
        $middleware->statefulApi();

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Perbaikan: Tambahkan prefix 'api/' agar sesuai dengan route yang kita buat
        $middleware->validateCsrfTokens(except: [
            'api/register',
            'api/login',
            'api/forgot-password',
            'api/reset-password',
            'api/auth/google',
            'api/auth/google/callback',
            'api/company/jobs', // Tambahkan ini jika nanti testing POST lowongan tanpa CSRF
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();