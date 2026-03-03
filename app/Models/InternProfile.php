<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InternProfile extends Model
{
    protected $table = 'intern_profiles';
    protected $primaryKey = 'profile_id';

    protected $fillable = [
        'user_id',
        'foto',
        'tentang_saya',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'provinsi',
        'kabupaten',
        'detail_alamat',
        'universitas',
        'jurusan',
        'cv_pdf',
        'portofolio_pdf',
        'pretest_score',
        'test_started_at',
        'test_finished_at',
        'is_profile_complete'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}