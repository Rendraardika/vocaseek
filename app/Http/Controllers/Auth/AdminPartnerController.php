<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminPartnerController extends Controller
{
    /**
     * 1. LIST PARTNER (Gambar 1)
     */
    public function index(Request $request)
    {
        $query = CompanyProfile::with(['user']);

        // Search bar
        if ($request->has('search')) {
            $query->where('nama_perusahaan', 'like', '%' . $request->search . '%');
        }

        $partners = $query->latest()->paginate(10);

        return response()->json([
            'status' => 'success',
            'stats' => [
                'total_partner' => CompanyProfile::count(),
                'kolaborasi_aktif' => CompanyProfile::where('status_mitra', 'active')->count(),
                'butuh_review' => CompanyProfile::whereIn('status_mitra', ['pending', 'reviewed'])->count(),
            ],
            'data' => $partners->map(fn($item) => [
                'id' => $item->id,
                'id_perusahaan' => 'CMP-' . str_pad($item->id, 3, '0', STR_PAD_LEFT),
                'nama_perusahaan' => [
                    'nama' => $item->nama_perusahaan,
                    'lokasi' => $item->alamat_kantor_pusat ?? 'N/A',
                ],
                'tipe_bisnis' => $item->industri ?? 'N/A',
                'tanggal_pengajuan' => optional($item->created_at)->format('d M Y') ?? 'N/A',
                'status_verifikasi' => $this->formatStatus($item->status_mitra),
            ]),
            'pagination' => [
                'total' => $partners->total(),
                'current_page' => $partners->currentPage(),
            ]
        ]);
    }

    /**
     * 2. DETAIL MITRA (Gambar 2 & 6)
     */
    public function show($id)
    {
        $partner = CompanyProfile::with(['user', 'lowongans'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => [
                'perusahaan' => $partner,
                'pic' => [
                    'nama' => $partner->nama_pic ?? 'N/A',
                    'jabatan' => $partner->jabatan_pic ?? 'N/A',
                    'email' => $partner->user->email,
                    'phone' => $partner->user->notelp
                ],
                // Simulasi Riwayat Aktivitas (Gambar 6)
                'aktivitas' => [
                    ['tgl' => now()->format('d M Y'), 'pesan' => 'Membuka lowongan baru'],
                    ['tgl' => $partner->updated_at->format('d M Y'), 'pesan' => 'Dokumen MOU diverifikasi'],
                ],
                // Dokumen Kerjasama (Gambar 2/6)
                'dokumen' => [
                    ['nama' => 'MOU_Vokaseek.pdf', 'status' => 'Terverifikasi'],
                    ['nama' => 'SIUP_License.jpg', 'status' => 'Terverifikasi'],
                ]
            ]
        ]);
    }

    /**
     * 3. TAMBAH MITRA BARU (Gambar 3, 4, 5)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_perusahaan' => 'required|string',
            'industri' => 'required',
            'website' => 'nullable|url',
            'deskripsi' => 'nullable|max:500',
            'nama_pic' => 'required',
            'jabatan_pic' => 'required',
            'email' => 'required|email|unique:users,email',
            'notelp' => 'required',
            'alamat_lengkap' => 'required',
            'kota' => 'required',
            'provinsi' => 'required',
            'kode_pos' => 'required',
        ]);

        $partner = DB::transaction(function () use ($validated) {
            // Create User Account
            $user = User::create([
                'nama' => $validated['nama_pic'],
                'email' => $validated['email'],
                'password' => Str::random(12),
                'role' => 'company',
                'notelp' => $validated['notelp']
            ]);

            // Create Profile
            return CompanyProfile::create([
                'user_id' => $user->user_id,
                'nama_perusahaan' => $validated['nama_perusahaan'],
                'industri' => $validated['industri'],
                'website_url' => $validated['website'] ?? null,
                'deskripsi' => $validated['deskripsi'] ?? null,
                'notelp' => $validated['notelp'],
                'alamat_kantor_pusat' => $validated['alamat_lengkap'] . ', ' . $validated['kota'] . ', ' . $validated['provinsi'] . ' ' . $validated['kode_pos'],
                'status_mitra' => 'active',
            ]);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Perusahaan Berhasil Ditambahkan!',
            'data' => $partner
        ]);
    }

    private function formatStatus(?string $statusMitra): string
    {
        return match ($statusMitra) {
            'active' => 'Active',
            'reviewed' => 'Reviewed',
            'rejected' => 'Rejected',
            default => 'Pending',
        };
    }
}
