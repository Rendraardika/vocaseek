<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CompanyProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AdminVerificationController extends Controller
{
    /**
     * 1. LIST PENGAJUAN (POV Staff & Super Admin)
     */
    public function index()
    {
        // Sesuaikan dengan kolom 'status_mitra' yang kita pakai sebelumnya
        $stats = [
            'total_pending'  => CompanyProfile::where('status_mitra', 'pending')->count(),
            'total_reviewed' => CompanyProfile::where('status_mitra', 'reviewed')->count(),
            'total_active'   => CompanyProfile::where('status_mitra', 'active')->count(),
        ];

        // Daftar Pengajuan yang belum Active/Rejected
        $submissions = CompanyProfile::with('user')
            ->whereIn('status_mitra', ['pending', 'reviewed'])
            ->latest()
            ->paginate(10);

        return response()->json([
            'status' => 'success',
            'stats'  => $stats,
            'data'   => $submissions->getCollection()->map(fn($item) => [
                'id'                => $item->id,
                'id_perusahaan'     => 'CMP-' . str_pad($item->id, 3, '0', STR_PAD_LEFT),
                'nama_perusahaan'   => $item->nama_perusahaan,
                'industri'          => $item->industri ?? 'N/A', // Pakai kolom industri yang baru kita buat
                'tanggal_pengajuan' => $item->created_at->format('d M Y'),
                'status_mitra'      => $item->status_mitra, 
            ])
        ]);
    }

    /**
     * 2. UBAH STATUS REVIEW (Biasanya dilakukan Staff)
     */
    public function updateReviewStatus(Request $request, $id)
    {
        // Hanya Staff Admin atau Super Admin
        $request->validate(['status' => 'required|in:pending,reviewed']);
        
        $company = CompanyProfile::findOrFail($id);
        $company->update(['status_mitra' => $request->status]);

        return response()->json(['message' => 'Dokumen ditandai sebagai: ' . $request->status]);
    }

    /**
     * 3. DETAIL DOKUMEN LEGALITAS
     */
    public function show($id)
    {
        $company = CompanyProfile::with('user')->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => [
                'perusahaan' => $company,
                'dokumen' => [
                    ['id' => 1, 'nama' => 'NIB', 'file' => $company->nib ? asset('storage/'.$company->nib) : null],
                    ['id' => 2, 'nama' => 'Letter of Agreement (LoA)', 'file' => $company->loa_pdf ? asset('storage/'.$profile->loa_pdf) : null],
                    ['id' => 3, 'nama' => 'Akta Perusahaan', 'file' => $company->akta_pdf ? asset('storage/'.$company->akta_pdf) : null],
                ]
            ]
        ]);
    }

    /**
     * 4. SETUJUI ATAU TOLAK FINAL (HANYA SUPER ADMIN)
     */
    public function finalVerification(Request $request, $id)
    {
        // Proteksi tambahan di level Code
        if (Auth::user()->role !== 'super_admin') {
            return response()->json(['message' => 'Hanya Super Admin yang bisa melakukan verifikasi final'], 403);
        }

        $request->validate(['action' => 'required|in:approve,reject']);
        $company = CompanyProfile::findOrFail($id);

        if ($request->action === 'approve') {
            DB::transaction(function () use ($company) {
                // Update tabel profile
                $company->update(['status_mitra' => 'active']);
                
                // Update tabel users agar statusnya 'active'
                $company->user->update(['status' => 'active']);
            });

            return response()->json(['status' => 'success', 'message' => 'Mitra Resmi Aktif!']);
        }

        // Jika Reject
        DB::transaction(function () use ($company) {
            $company->update(['status_mitra' => 'rejected']);
            $company->user->update(['status' => 'rejected']);
        });

        return response()->json(['message' => 'Pendaftaran Mitra ditolak']);
    }
}