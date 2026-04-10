<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('intern_profiles', function (Blueprint $table) {
            $table->timestamp('test_started_at')->nullable()->after('skor_pretest');
            $table->timestamp('test_finished_at')->nullable()->after('test_started_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('intern_profiles', function (Blueprint $table) {
            $table->dropColumn(['test_started_at', 'test_finished_at']);
        });
    }
};
