<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\InternProfile;
use App\Models\CompanyProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        // 1. Validasi Dasar (Berlaku untuk semua)
        $rules = [
            'nama'     => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'notelp'   => 'required|string|max:20',
            'role'     => 'required|in:intern,company',
        ];

        // 2. Validasi Khusus Company (Sesuai Desain Figma kamu)
        if ($request->role === 'company') {
            $rules['nib']  = 'required|string|max:50';
            $rules['loa']  = 'required|mimes:pdf|max:2048'; // Max 2MB
            $rules['akta'] = 'required|mimes:pdf|max:2048';
        }

        $request->validate($rules);

        return DB::transaction(function () use ($request) {
            
            // 3. Simpan ke Tabel Users
            $user = User::create([
                'nama'     => $request->nama,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => $request->role,
                'notelp'   => $request->notelp,
            ]);

            // 4. Proses Jika Role adalah Company
            if ($request->role === 'company') {
                // Upload File PDF ke folder storage/app/public/documents
                $loaPath  = $request->file('loa')->store('documents/loa', 'public');
                $aktaPath = $request->file('akta')->store('documents/akta', 'public');

                CompanyProfile::create([
                    'user_id'         => $user->user_id,
                    'nama_perusahaan' => $request->nama,
                    'nib'             => $request->nib,
                    'loa_pdf'         => $loaPath,
                    'akta_pdf'        => $aktaPath,
                ]);
            } 
            
            // 5. Proses Jika Role adalah Intern
            else {
                InternProfile::create([
                    'user_id' => $user->user_id,
                    'status_mahasiswa' => 'AKTIF'
                ]);
            }

            return response()->json([
                'status'  => 'success',
                'message' => 'Registrasi berhasil! Silakan login.',
                'role'    => $user->role
            ], 201);
        });
    }
}