<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';
    
    // Karena kamu pakai user_id, pastikan ini konsisten di semua tabel relasi
    protected $primaryKey = 'user_id';

    public $timestamps = false; 

    protected $fillable = [
        'nama',
        'email',
        'password',
        'role',
        'notelp',
        'google_id', 
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casting password agar otomatis di-hash
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    // --- RELASI ---

    /**
     * Relasi ke profil Intern
     */
    public function internProfile()
    {
        // Parameter: (Model, Foreign Key di tabel tujuan, Local Key di tabel users)
        return $this->hasOne(InternProfile::class, 'user_id', 'user_id');
    }

    /**
     * Relasi ke profil Company (Penting untuk Dashboard Mitra)
     */
    public function companyProfile()
    {
        return $this->hasOne(CompanyProfile::class, 'user_id', 'user_id');
    }
}