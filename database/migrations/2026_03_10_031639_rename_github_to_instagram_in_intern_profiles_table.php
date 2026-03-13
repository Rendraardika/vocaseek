<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('intern_profiles', function (Blueprint $table) {
            // Mengganti nama kolom github menjadi instagram
            $table->renameColumn('github', 'instagram');
        });
    }

    public function down()
    {
        Schema::table('intern_profiles', function (Blueprint $table) {
            // Mengembalikan nama jika di-rollback
            $table->renameColumn('instagram', 'github');
        });
    }
};