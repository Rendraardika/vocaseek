<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('job_applications', function (Blueprint $table) {
        $table->id('application_id');
        $table->unsignedBigInteger('user_id');
        $table->unsignedBigInteger('job_id'); 
        $table->string('status')->default('Sedang Diproses'); // Sesuai UI Gambar 5
        $table->timestamps();

        $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
