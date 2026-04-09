<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Buat Super Admin
        User::create([
            'nama' => 'Super Admin Vocaseek',
            'email' => 'admin@vocaseek.com',
            'password' => Hash::make('admin123'), // Passwordnya: admin123
            'role' => 'super_admin',
            'status' => 'active',
        ]);

        // Buat Staff Admin
        User::create([
            'nama' => 'Staff Verifikasi',
            'email' => 'staff@vocaseek.com',
            'password' => Hash::make('staff123'), // Passwordnya: staff123
            'role' => 'staff_admin',
            'status' => 'active',
        ]);
    }
}