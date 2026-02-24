<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php', // TAMBAHKAN INI
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
    ->withMiddleware(function (Middleware $middleware) {
        // Bagian ini untuk mematikan proteksi CSRF pada route tertentu
        // agar Postman bisa mengirim data tanpa token
        $middleware->validateCsrfTokens(except: [
            '/register',
            '/login',
            '/forgot-password',
            '/reset-password',
            '/auth/google',
            '/auth/google/callback'
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();