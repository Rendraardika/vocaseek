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
        $company = CompanyProfile::findOrFail($id);
        $normalizedStatus = $this->normalizeVerificationInput(
            $request->input('status', $request->input('action'))
        );

        if (!$normalizedStatus) {
            return response()->json([
                'message' => 'The selected status is invalid.',
                'allowed_status' => ['pending', 'reviewed', 'approve', 'reject', 'active', 'rejected'],
            ], 422);
        }

        if (in_array($normalizedStatus, ['active', 'rejected'], true) && Auth::user()->role !== 'super_admin') {
            return response()->json([
                'message' => __('messages.verification.super_admin_only'),
            ], 403);
        }

        $company->update(['status_mitra' => $normalizedStatus]);

        if ($company->user && in_array($normalizedStatus, ['active', 'rejected'], true)) {
            $company->user->update(['status' => $normalizedStatus]);
        }

        return response()->json([
            'status' => 'success',
            'message' => __('messages.verification.marked_as', ['status' => $normalizedStatus]),
            'data' => [
                'company_id' => $company->id,
                'status_mitra' => $company->status_mitra,
            ],
        ]);
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
                    ['id' => 2, 'nama' => 'Letter of Agreement (LoA)', 'file' => $company->loa_pdf ? asset('storage/'.$company->loa_pdf) : null],
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
            return response()->json(['message' => __('messages.verification.super_admin_only')], 403);
        }

        $company = CompanyProfile::findOrFail($id);
        $normalizedStatus = $this->normalizeVerificationInput(
            $request->input('action', $request->input('status'))
        );

        if (!in_array($normalizedStatus, ['active', 'rejected'], true)) {
            return response()->json([
                'message' => 'The selected action is invalid.',
                'allowed_action' => ['approve', 'reject'],
            ], 422);
        }

        if ($normalizedStatus === 'active') {
            DB::transaction(function () use ($company) {
                // Update tabel profile
                $company->update(['status_mitra' => 'active']);
                
                // Update tabel users agar statusnya 'active'
                $company->user->update(['status' => 'active']);
            });

            return response()->json(['status' => 'success', 'message' => __('messages.verification.company_approved')]);
        }

        // Jika Reject
        DB::transaction(function () use ($company) {
            $company->update(['status_mitra' => 'rejected']);
            $company->user->update(['status' => 'rejected']);
        });

        return response()->json(['status' => 'success', 'message' => __('messages.verification.company_rejected')]);
    }

    private function normalizeVerificationInput(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        return match (strtolower(trim($value))) {
            'pending' => 'pending',
            'reviewed', 'review' => 'reviewed',
            'approve', 'approved', 'active' => 'active',
            'reject', 'rejected' => 'rejected',
            default => null,
        };
    }
}
