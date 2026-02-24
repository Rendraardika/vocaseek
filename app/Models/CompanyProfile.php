<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompanyProfile extends Model
{
    protected $table = 'company_profile';
    protected $primaryKey = 'company_id';
    
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'nama_perusahaan', 'bidang', 'lokasi', 'deskripsi', 'website'
    ];

    /**
     * Relasi balik ke User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * Relasi ke Lowongan (Satu perusahaan punya banyak lowongan)
     */
    public function lowongan(): HasMany
    {
        return $this->hasMany(Lowongan::class, 'company_id', 'company_id');
    }
}