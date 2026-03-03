<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InternProfile extends Model
{
   protected $table = 'intern_profiles'; 
    protected $primaryKey = 'profile_id';
    
    
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'foto', 'tentang', 'jenis_kelamin', 'tempat_lahir', 
        'tanggal_lahir', 'provinsi', 'kabupaten', 'detail_alamat', 
        'linkedin', 'github', 'universitas', 'jenjang', 'jurusan', 
        'ipk', 'tahun_masuk', 'tahun_lulus', 'status_mahasiswa'
    ];

    /**
     * Relasi balik ke User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}