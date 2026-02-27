<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('intern_profiles', function (Blueprint $table) {
            $table->id('profile_id'); 
            $table->foreignId('user_id')->constrained('users', 'user_id')->onDelete('cascade');
            $table->string('status_mahasiswa')->default('AKTIF');
            
           
            $table->string('foto')->nullable();
            $table->text('tentang')->nullable();
            $table->string('jenis_kelamin')->nullable();
            $table->string('tempat_lahir')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('provinsi')->nullable();
            $table->string('kabupaten')->nullable();
            $table->text('detail_alamat')->nullable();
            $table->string('linkedin')->nullable();
            $table->string('github')->nullable();
            $table->string('universitas')->nullable();
            $table->string('jenjang')->nullable();
            $table->string('jurusan')->nullable();
            $table->string('ipk')->nullable();
            $table->year('tahun_masuk')->nullable();
            $table->year('tahun_lulus')->nullable();
            
            
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('intern_profiles');
    }
};