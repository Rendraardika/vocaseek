<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    protected $table = 'job_applications';
    protected $primaryKey = 'application_id';
    protected $fillable = ['user_id', 'job_id', 'motivation', 'status'];

    // Relasi balik ke Job agar bisa ambil judul lowongan untuk menu "Status Lamaran"
    public function job()
    {
        return $this->belongsTo(Job::class, 'job_id');
    }
}