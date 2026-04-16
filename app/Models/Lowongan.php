<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lowongan extends Model
{
    use HasFactory;

    protected $table = 'lowongan'; // Karena nama tabel kita 'lowongan'

    protected $appends = [
        'tanggal_penutupan_lamaran',
        'tanggal_mulai_kerja',
    ];

    protected $fillable = [
        'company_profile_id',
        'judul_posisi',
        'deskripsi_pekerjaan',
        'persyaratan',
        'lokasi',
        'tipe_magang',
        'gaji_per_bulan',
        'tgl_tutup_lamaran',
        'tgl_mulai_kerja',
        'status'
    ];

    protected $casts = [
        'tgl_tutup_lamaran' => 'date:Y-m-d',
        'tgl_mulai_kerja' => 'date:Y-m-d',
    ];

    public function getTanggalPenutupanLamaranAttribute(): ?string
    {
        return $this->tgl_tutup_lamaran?->format('Y-m-d');
    }

    public function getTanggalMulaiKerjaAttribute(): ?string
    {
        return $this->tgl_mulai_kerja?->format('Y-m-d');
    }

    public function companyProfile()
    {
        return $this->belongsTo(CompanyProfile::class, 'company_profile_id', 'id');
    }
}
