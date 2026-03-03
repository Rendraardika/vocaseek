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
    protected $primaryKey = 'user_id';

    // Aktifkan true jika kamu sudah menjalankan ALTER TABLE sebelumnya untuk created_at/updated_at
    // Jika masih belum ada kolomnya di HeidiSQL, biarkan false
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

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * Relasi ke profil Intern
     */
    public function internProfile()
    {
        return $this->hasOne(InternProfile::class, 'user_id', 'user_id');
    }

    /**
     * Relasi ke profil Company
     */
    public function companyProfile()
    {
        return $this->hasOne(CompanyProfile::class, 'user_id', 'user_id');
    }
}