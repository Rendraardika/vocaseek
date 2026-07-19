<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('lowongans')) {
            return;
        }

        Schema::table('lowongans', function (Blueprint $table) {
            if (! Schema::hasColumn('lowongans', 'kategori_pekerjaan')) {
                $table->string('kategori_pekerjaan')->nullable()->after('judul_pekerjaan');
            }

            if (! Schema::hasColumn('lowongans', 'tipe_pekerjaan')) {
                $table->string('tipe_pekerjaan')->nullable()->after('kategori_pekerjaan');
            }

            if (! Schema::hasColumn('lowongans', 'deskripsi_pekerjaan')) {
                $table->text('deskripsi_pekerjaan')->nullable()->after('tipe_pekerjaan');
            }

            if (! Schema::hasColumn('lowongans', 'persyaratan')) {
                $table->text('persyaratan')->nullable()->after('deskripsi_pekerjaan');
            }

            if (! Schema::hasColumn('lowongans', 'lokasi')) {
                $table->string('lokasi')->nullable()->after('persyaratan');
            }

            if (! Schema::hasColumn('lowongans', 'pengaturan_kerja')) {
                $table->string('pengaturan_kerja')->nullable()->after('tipe_magang');
            }

            if (! Schema::hasColumn('lowongans', 'gaji_min')) {
                $table->bigInteger('gaji_min')->nullable()->after('gaji_per_bulan');
            }

            if (! Schema::hasColumn('lowongans', 'gaji_max')) {
                $table->bigInteger('gaji_max')->nullable()->after('gaji_min');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('lowongans')) {
            return;
        }

        Schema::table('lowongans', function (Blueprint $table) {
            foreach ([
                'gaji_max',
                'gaji_min',
                'pengaturan_kerja',
                'lokasi',
                'persyaratan',
                'deskripsi_pekerjaan',
                'tipe_pekerjaan',
                'kategori_pekerjaan',
            ] as $column) {
                if (Schema::hasColumn('lowongans', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
