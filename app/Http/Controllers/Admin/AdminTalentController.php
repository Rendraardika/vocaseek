<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TestAnswer;
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
                        $sq->where('universitas', 'like', "%$search%")
                            ->orWhere('jurusan', 'like', "%$search%");
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
                'foto' => $user->internProfile?->foto ? asset('storage/'.$user->internProfile->foto) : null,
                'nama_talenta' => [
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'foto' => $user->internProfile?->foto ? asset('storage/'.$user->internProfile->foto) : null,
                ],
                'universitas' => $user->internProfile?->universitas ?? '-',
                'jurusan' => $user->internProfile?->jurusan ?? '-',
                'tanggal_daftar' => optional($user->created_at)->format('M d, Y') ?? 'N/A',
                'status' => $user->applications->first()->status ?? 'PENDING',
                'tentang_saya' => $user->internProfile?->tentang_saya,
                'jenis_kelamin' => $user->internProfile?->jenis_kelamin,
                'tempat_lahir' => $user->internProfile?->tempat_lahir,
                'tanggal_lahir' => optional($user->internProfile?->tanggal_lahir)->format('Y-m-d'),
                'notelp' => $user->internProfile?->notelp ?? $user->notelp,
                'provinsi' => $user->internProfile?->provinsi,
                'kabupaten' => $user->internProfile?->kabupaten,
                'detail_alamat' => $user->internProfile?->detail_alamat,
                'linkedin' => $user->internProfile?->linkedin,
                'instagram' => $user->internProfile?->instagram,
                'cv_pdf' => $user->internProfile?->cv_pdf ? asset('storage/'.$user->internProfile->cv_pdf) : null,
                'portofolio_pdf' => $user->internProfile?->portofolio_pdf ? asset('storage/'.$user->internProfile->portofolio_pdf) : null,
                'skor_pretest' => $user->internProfile?->skor_pretest ?? 0,
                'test_started_at' => optional($user->internProfile?->test_started_at)->toDateTimeString(),
                'test_finished_at' => optional($user->internProfile?->test_finished_at)->toDateTimeString(),
                'is_profile_complete' => (bool) ($user->internProfile?->is_profile_complete ?? false),
                'pretest_answers_count' => TestAnswer::where('user_id', $user->user_id)->count(),
                'pretest_answers' => TestAnswer::where('user_id', $user->user_id)
                    ->orderBy('id')
                    ->get(['question_text', 'user_answer'])
                    ->map(fn ($answer) => [
                        'question_text' => $answer->question_text,
                        'user_answer' => $answer->user_answer,
                    ])
                    ->values(),
                'profile' => [
                    'foto' => $user->internProfile?->foto ? asset('storage/'.$user->internProfile->foto) : null,
                    'tentang_saya' => $user->internProfile?->tentang_saya,
                    'jenis_kelamin' => $user->internProfile?->jenis_kelamin,
                    'tempat_lahir' => $user->internProfile?->tempat_lahir,
                    'tanggal_lahir' => optional($user->internProfile?->tanggal_lahir)->format('Y-m-d'),
                    'notelp' => $user->internProfile?->notelp ?? $user->notelp,
                    'provinsi' => $user->internProfile?->provinsi,
                    'kabupaten' => $user->internProfile?->kabupaten,
                    'detail_alamat' => $user->internProfile?->detail_alamat,
                    'universitas' => $user->internProfile?->universitas,
                    'jurusan' => $user->internProfile?->jurusan,
                    'jenjang' => $user->internProfile?->jenjang,
                    'ipk' => $user->internProfile?->ipk,
                    'tahun_masuk' => $user->internProfile?->tahun_masuk,
                    'tahun_lulus' => $user->internProfile?->tahun_lulus,
                    'linkedin' => $user->internProfile?->linkedin,
                    'instagram' => $user->internProfile?->instagram,
                    'cv_pdf' => $user->internProfile?->cv_pdf ? asset('storage/'.$user->internProfile->cv_pdf) : null,
                    'portofolio_pdf' => $user->internProfile?->portofolio_pdf ? asset('storage/'.$user->internProfile->portofolio_pdf) : null,
                    'skor_pretest' => $user->internProfile?->skor_pretest ?? 0,
                    'test_started_at' => optional($user->internProfile?->test_started_at)->toDateTimeString(),
                    'test_finished_at' => optional($user->internProfile?->test_finished_at)->toDateTimeString(),
                    'is_profile_complete' => (bool) ($user->internProfile?->is_profile_complete ?? false),
                ],
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
