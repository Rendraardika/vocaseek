<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\InternProfile;
use App\Models\CompanyProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        // 1. Validasi
        $rules = [
            'nama'     => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'notelp'   => 'required|string|max:20',
            'role'     => 'required|in:intern,company',
        ];

        if ($request->role === 'company') {
            $rules['nama_perusahaan'] = 'required|string|max:255';
            $rules['nib']  = 'required|string|max:50';
            $rules['loa_pdf']  = 'required|mimes:pdf|max:2048';
            $rules['akta_pdf'] = 'required|mimes:pdf|max:2048';
        }

        $request->validate($rules);

        return DB::transaction(function () use ($request) {

            // 2. Simpan ke tabel users
            $user = User::create([
                'nama'     => $request->nama,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => $request->role,
                'notelp'   => $request->notelp,
            ]);

            // 3. Jika role company
            if ($request->role === 'company') {

                $loaPath  = $request->file('loa_pdf')->store('documents/loa', 'public');
                $aktaPath = $request->file('akta_pdf')->store('documents/akta', 'public');

                CompanyProfile::create([
                    'user_id'         => $user->id, 
                    'nama_perusahaan' => $request->nama_perusahaan,
                    'notelp'          => $request->notelp,
                    'nib'             => $request->nib,
                    'loa_pdf'         => $loaPath,
                    'akta_pdf'        => $aktaPath,
                ]);
            }
            
            else {
                InternProfile::create([
                    'user_id' => $user->id,
                    'status_mahasiswa' => 'AKTIF'
                ]);
            }

            return response()->json([
                'status'  => 'success',
                'message' => 'Registrasi berhasil!',
                'role'    => $user->role
            ], 201);
        });
    }
}