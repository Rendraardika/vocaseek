<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Bagian User::factory di bawah ini dikomentari agar tidak error.
        // Hal ini karena Factory bawaan Laravel mencari kolom 'name', 
        // sedangkan tabel 'users' di database Vokasik menggunakan kolom 'nama'.
        
        // \App\Models\User::factory(10)->create();

        // Memanggil LandingPageSeeder untuk mengisi data Kategori dan Job Listings
        $this->call([
            LandingPageSeeder::class,
        ]);
    }
}