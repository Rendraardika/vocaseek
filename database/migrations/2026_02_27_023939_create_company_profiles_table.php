<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
{
    Schema::create('company_profile', function (Blueprint $table) {
        $table->id();
        // Beritahu Laravel bahwa foreign key user_id merujuk ke kolom user_id di tabel users
        $table->foreignId('user_id')->constrained('users', 'user_id')->onDelete('cascade');
        
        $table->string('nama_perusahaan');
        $table->string('notelp')->nullable();
        $table->string('nib')->nullable();
        $table->string('loa_pdf')->nullable();
        $table->string('akta_pdf')->nullable();
        $table->timestamps();
    });
}

    public function down(): void
    {
        Schema::dropIfExists('company_profile');
    }
};