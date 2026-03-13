<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('intern_profiles', function (Blueprint $table) {
            // Menghapus kolom 'tentang' yang bernilai NULL tersebut
            $table->dropColumn('tentang');
        });
    }

    public function down()
    {
        Schema::table('intern_profiles', function (Blueprint $table) {
            // Fungsi rollback jika kamu ingin mengembalikan kolomnya
            $table->text('tentang')->nullable();
        });
    }
};