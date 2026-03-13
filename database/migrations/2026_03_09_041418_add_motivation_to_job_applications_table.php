<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('intern_profiles', function (Blueprint $table) {
            // Menambahkan kembali kolom 'tentang' setelah 'tentang_saya'
            $table->text('tentang')->nullable()->after('tentang_saya');
        });
    }

    public function down()
    {
        Schema::table('intern_profiles', function (Blueprint $table) {
            $table->dropColumn('tentang');
        });
    }
};