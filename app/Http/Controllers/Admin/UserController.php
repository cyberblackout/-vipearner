<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::with('vipLevel')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($users);
    }

    public function show(Request $request, string $id)
    {
        $user = User::with('vipLevel')->findOrFail($id);
        return response()->json($user);
    }

    public function adjustBalance(Request $request, string $id)
    {
        $request->validate([
            'amount' => 'required|numeric|min:-99999|max:99999',
            'reason' => 'required|string|max:500',
        ]);

        $user = User::findOrFail($id);
        $amount = (float) $request->amount;

        DB::transaction(function () use ($user, $amount, $request) {
            $direction = $amount >= 0 ? '+' : '-';
            $absAmount = abs($amount);

            if ($direction === '+') {
                $user->increment('balance', $absAmount);
                $user->increment('total_income', $absAmount);
            } else {
                $user->decrement('balance', $absAmount);
            }

            $transaction = \App\Models\Transaction::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $user->id,
                'amount' => $absAmount,
                'direction' => $direction,
                'type' => 'admin_adjustment',
                'status' => 'success',
                'admin_id' => $request->user()->id,
                'metadata' => ['reason' => $request->reason],
            ]);

            AuditLog::create([
                'id' => Str::uuid()->toString(),
                'admin_id' => $request->user()->id,
                'target_id' => $user->id,
                'action' => 'balance_adjustment',
                'new_value' => ['amount' => $amount, 'reason' => $request->reason],
            ]);
        });

        return response()->json(['success' => true, 'new_balance' => $user->fresh()->balance]);
    }

    public function ban(Request $request, string $id)
    {
        $request->validate(['reason' => 'required|string']);

        $user = User::findOrFail($id);

        DB::transaction(function () use ($user, $request) {
            $user->update([
                'is_banned' => true,
                'ban_reason' => $request->reason,
            ]);

            AuditLog::create([
                'id' => Str::uuid()->toString(),
                'admin_id' => $request->user()->id,
                'target_id' => $user->id,
                'action' => 'user_banned',
                'new_value' => ['reason' => $request->reason],
            ]);
        });

        return response()->json(['success' => true]);
    }

    public function unban(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        DB::transaction(function () use ($user, $request) {
            $user->update([
                'is_banned' => false,
                'ban_reason' => null,
            ]);

            AuditLog::create([
                'id' => Str::uuid()->toString(),
                'admin_id' => $request->user()->id,
                'target_id' => $user->id,
                'action' => 'user_unbanned',
            ]);
        });

        return response()->json(['success' => true]);
    }
}