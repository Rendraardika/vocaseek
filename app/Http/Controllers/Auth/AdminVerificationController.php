<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CompanyProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminVerificationController extends Controller
{
    
    public function index()
    {
        // Statistik Card (Atas)
        $stats = [
            'total_pending' => CompanyProfile::where('is_verified', false)->count(),
            'total_approved' => CompanyProfile::where('is_verified', true)->count(),
            'total_rejected' => User::where('role', 'company')->where('status', 'REJECTED')->count(),
        ];

        // Daftar Pengajuan (Tabel)
        $submissions = CompanyProfile::with('user')
            ->where('is_verified', false)
            ->latest()
            ->paginate(10);

        return response()->json([
            'status' => 'success',
            'stats' => $stats,
            'data' => $submissions->map(fn($item) => [
                'id' => $item->id,
                'id_perusahaan' => 'CMP-' . str_pad($item->id, 3, '0', STR_PAD_LEFT),
                'nama_perusahaan' => $item->nama_perusahaan,
                'tipe_bisnis' => $item->sektor_industri ?? 'N/A',
                'tanggal_pengajuan' => $item->created_at->format('d M Y'),
                'status_verifikasi' => $item->status_review ?? 'Pending', // Label Kuning/Biru
            ])
        ]);
    }

    /**
     * 2. UBAH STATUS REVIEW (Gambar 3)
     */
    public function updateReviewStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:Pending,Under Review']);
        
        $company = CompanyProfile::findOrFail($id);
        $company->update(['status_review' => $request->status]);

        return response()->json(['message' => 'Status review berhasil diperbarui']);
    }

    /**
     * 3. DETAIL DOKUMEN LEGALITAS (Gambar 4 & 6)
     */
    public function show($id)
    {
        $company = CompanyProfile::with('user')->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => [
                'perusahaan' => $company,
                'dokumen' => [
                    ['id' => 1, 'nama' => 'Nomor Induk Berusaha (NIB)', 'file' => $company->nib_file, 'updated' => $company->updated_at->format('d M Y')],
                    ['id' => 2, 'nama' => 'NPWP Perusahaan', 'file' => $company->npwp_file, 'updated' => $company->updated_at->format('d M Y')],
                    ['id' => 3, 'nama' => 'Akta Pendirian Perusahaan', 'file' => $company->akta_file, 'updated' => $company->updated_at->format('d M Y')],
                    ['id' => 4, 'nama' => 'Company Profile', 'file' => $company->cp_file, 'updated' => $company->updated_at->format('d M Y')],
                ]
            ]
        ]);
    }

    /**
     * 4. VALIDASI PER DOKUMEN (Gambar 5 - Preview)
     */
    public function validateSingleDocument(Request $request, $id)
    {
        // Logic ini bisa disimpan di tabel terpisah atau kolom JSON
        // Contoh: status_nib = 'valid' atau 'invalid'
        return response()->json(['message' => 'Status dokumen diperbarui']);
    }

    /**
     * 5. SETUJUI ATAU TOLAK FINAL (Gambar 6)
     */
    public function finalVerification(Request $request, $id)
    {
        $company = CompanyProfile::findOrFail($id);
        $action = $request->action; // 'approve' atau 'reject'

        if ($action === 'approve') {
            DB::transaction(function () use ($company) {
                $company->update([
                    'is_verified' => true,
                    'status_review' => 'Verified'
                ]);
                
                // Ubah status di tabel users agar bisa login/aktif
                $company->user->update(['status' => 'Active']);
            });

            return response()->json(['status' => 'success', 'message' => 'Mitra Berhasil Disetujui & Aktif!']);
        }

        // Jika Reject
        $company->user->update(['status' => 'Rejected']);
        return response()->json(['message' => 'Pendaftaran Mitra ditolak']);
    }
}