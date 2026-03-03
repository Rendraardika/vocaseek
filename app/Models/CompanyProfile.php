<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanyProfile extends Model
{
    protected $table = 'company_profile';
    protected $primaryKey = 'id';
    
    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'nama_perusahaan',
        'notelp',
        'nib',
        'loa_pdf',
        'akta_pdf'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}