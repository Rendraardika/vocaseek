<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Nama tabel yang terkait dengan model.
     */
    protected $table = 'users';

    /**
     * Nama kolom Primary Key yang digunakan di database (HeidiSQL).
     */
    protected $primaryKey = 'user_id';

    /**
     * Menonaktifkan timestamps otomatis jika tabel tidak punya created_at/updated_at.
     */
    public $timestamps = false;

    /**
     * Atribut yang dapat diisi secara massal (Mass Assignment).
     * PENTING: google_id harus ada agar login Google tidak error.
     */
    protected $fillable = [
        'nama',
        'email',
        'password',
        'role',
        'notelp',
        'google_id', 
    ];

    /**
     * Atribut yang disembunyikan saat data dikonversi ke JSON.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Pengaturan casting tipe data.
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * Relasi ke profil Intern (Pencari Kerja).
     */
    public function internProfile()
    {
        return $this->hasOne(InternProfile::class, 'user_id', 'user_id');
    }

    /**
     * Relasi ke profil Company (Perusahaan).
     */
    public function companyProfile()
    {
        return $this->hasOne(CompanyProfile::class, 'user_id', 'user_id');
    }
}