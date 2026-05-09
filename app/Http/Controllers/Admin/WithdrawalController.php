<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\WithdrawalService;
use Illuminate\Http\Request;

class WithdrawalController extends Controller
{
    public function __construct(
        private WithdrawalService $withdrawalService
    ) {}

    public function index(Request $request)
    {
        $withdrawals = \App\Models\Withdrawal::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($withdrawals);
    }

    public function approve(Request $request, string $id)
    {
        $validated = $request->validate([
            'note' => 'nullable|string|max:500',
        ]);

        $withdrawal = \App\Models\Withdrawal::findOrFail($id);
        $admin      = $request->user();

        $this->withdrawalService->approve($withdrawal, $admin, $validated['note'] ?? null);

        return response()->json(['success' => true]);
    }

    public function reject(Request $request, string $id)
    {
        $request->validate(['reason' => 'required']);

        $withdrawal = \App\Models\Withdrawal::findOrFail($id);
        $admin = $request->user();

        $this->withdrawalService->reject($withdrawal, $admin, $request->reason);

        return response()->json(['success' => true]);
    }
}