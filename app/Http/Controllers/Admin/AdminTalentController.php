<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminTalentController extends Controller
{
    public function index(Request $request)
    {
        $totalTalents = User::where('role', 'intern')->count();
        $activeTalents = User::where('role', 'intern')
            ->whereHas('applications', function ($q) {
                $q->whereIn('status', ['ACCEPTED', 'OFFER']);
            })->count();

        $newTalentsMonth = User::where('role', 'intern')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $query = User::where('role', 'intern')->with(['internProfile', 'applications']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%$search%")
                    ->orWhereHas('internProfile', function ($sq) use ($search) {
                        $sq->where('asal_kampus', 'like', "%$search%")
                            ->orWhere('prodi', 'like', "%$search%");
                    });
            });
        }

        $talents = $query->latest()->paginate(10);

        return response()->json([
            'status' => 'success',
            'stats' => [
                'total_talenta' => [
                    'value' => number_format($totalTalents),
                    'growth' => '+12.5%',
                ],
                'talenta_aktif' => [
                    'value' => number_format($activeTalents),
                    'growth' => '+5.2%',
                ],
                'talenta_baru' => [
                    'value' => number_format($newTalentsMonth),
                    'growth' => '-2.1%',
                ],
            ],
            'data' => $talents->map(fn ($user) => [
                'id' => $user->user_id,
                'user_id' => $user->user_id,
                'id_talenta' => 'TLA-'.str_pad($user->user_id, 3, '0', STR_PAD_LEFT),
                'nama' => $user->nama,
                'name' => $user->nama,
                'full_name' => $user->nama,
                'email' => $user->email,
                'email_address' => $user->email,
                'foto' => $user->foto,
                'nama_talenta' => [
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'foto' => $user->foto,
                ],
                'universitas' => $user->internProfile->asal_kampus ?? '-',
                'jurusan' => $user->internProfile->prodi ?? '-',
                'tanggal_daftar' => optional($user->created_at)->format('M d, Y') ?? 'N/A',
                'status' => $user->applications->first()->status ?? 'PENDING',
            ]),
            'pagination' => [
                'total' => $talents->total(),
                'current_page' => $talents->currentPage(),
                'last_page' => $talents->lastPage(),
            ],
        ]);
    }

    public function destroy($id)
    {
        User::findOrFail($id)->delete();

        return response()->json(['message' => 'Talenta berhasil dihapus dari sistem']);
    }
}
