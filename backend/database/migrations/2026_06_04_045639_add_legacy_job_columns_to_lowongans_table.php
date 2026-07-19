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
        Schema::table('lowongans', function (Blueprint $table) {
            if (! Schema::hasColumn('lowongans', 'judul_pekerjaan')) {
                $table->string('judul_pekerjaan')->nullable()->after('judul_posisi');
            }

            if (! Schema::hasColumn('lowongans', 'tgl_tutup_lamaran')) {
                $table->date('tgl_tutup_lamaran')->nullable()->after('tanggal_mulai_kerja');
            }

            if (! Schema::hasColumn('lowongans', 'tgl_mulai_kerja')) {
                $table->date('tgl_mulai_kerja')->nullable()->after('tgl_tutup_lamaran');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lowongans', function (Blueprint $table) {
            if (Schema::hasColumn('lowongans', 'tgl_mulai_kerja')) {
                $table->dropColumn('tgl_mulai_kerja');
            }

            if (Schema::hasColumn('lowongans', 'tgl_tutup_lamaran')) {
                $table->dropColumn('tgl_tutup_lamaran');
            }

            if (Schema::hasColumn('lowongans', 'judul_pekerjaan')) {
                $table->dropColumn('judul_pekerjaan');
            }
        });
    }
};
