<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lowongan extends Model
{
    use HasFactory;

    protected $table = 'lowongan'; // Karena nama tabel kita 'lowongan'

    protected $fillable = [
        'company_profile_id',
        'judul_posisi',
        'deskripsi_pekerjaan',
        'persyaratan',
        'lokasi',
        'tipe_magang',
        'gaji_per_bulan',
        'status'
    ];

    public function companyProfile()
    {
        return $this->belongsTo(CompanyProfile::class, 'company_profile_id', 'id');
    }
}
