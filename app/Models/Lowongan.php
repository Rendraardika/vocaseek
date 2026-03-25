<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lowongan extends Model
{
    use HasFactory;

    protected $table = 'lowongan'; // Karena nama tabel kita 'lowongan'

   protected $fillable = [
    'company_profile_id', 'judul_pekerjaan', 'kategori_pekerjaan', 
    'tipe_pekerjaan', 'lokasi', 'pengaturan_kerja', 'gaji_min', 
    'gaji_max', 'deskripsi_pekerjaan', 'persyaratan', 
    'tgl_tutup_lamaran', 'tgl_mulai_kerja', 'status'
];
}