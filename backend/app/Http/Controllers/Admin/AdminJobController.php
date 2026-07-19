<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lowongan;
use Illuminate\Http\Request;

class AdminJobController extends Controller
{
    public function index(Request $request)
    {
        $query = Lowongan::with('companyProfile')
            ->withCount('applications')
            ->latest();

        if ($request->filled('status')) {
            $status = strtoupper($request->string('status')->value());

            if ($status === 'OPEN') {
                $query->whereIn('status', ['ACTIVE', 'OPEN']);
            } elseif (in_array($status, ['ACTIVE', 'CLOSED', 'DRAFT'], true)) {
                $query->where('status', $status);
            }
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->value();

            $query->where(function ($q) use ($search) {
                $q->where('judul_posisi', 'like', "%{$search}%")
                    ->orWhere('judul_pekerjaan', 'like', "%{$search}%")
                    ->orWhere('kategori_pekerjaan', 'like', "%{$search}%")
                    ->orWhere('tipe_pekerjaan', 'like', "%{$search}%")
                    ->orWhere('lokasi', 'like', "%{$search}%")
                    ->orWhere('tipe_magang', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhereHas('companyProfile', function ($companyQuery) use ($search) {
                        $companyQuery->where('nama_perusahaan', 'like', "%{$search}%")
                            ->orWhere('industri', 'like', "%{$search}%")
                            ->orWhere('alamat_kantor_pusat', 'like', "%{$search}%");
                    });
            });
        }

        $jobs = $query->get();

        return response()->json([
            'status' => 'success',
            'summary' => [
                'total_jobs' => $jobs->count(),
                'active_jobs' => $jobs->whereIn('status', ['ACTIVE', 'OPEN'])->count(),
                'closed_jobs' => $jobs->where('status', 'CLOSED')->count(),
                'draft_jobs' => $jobs->where('status', 'DRAFT')->count(),
            ],
            'data' => $jobs,
            'jobs' => $jobs,
        ]);
    }
}
