<?php

namespace App\Services;

use App\Models\User;
use App\Models\Withdrawal;
use App\Models\Transaction;
use App\Models\Notification;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WithdrawalService
{
    public function request(User $user, array $data): Withdrawal
    {
        $amount = $data['amount'];
        $minWithdrawal = config('app.min_withdrawal_ghs', 5);

        if ($amount < $minWithdrawal) {
            throw new \Exception("Minimum withdrawal is GHS {$minWithdrawal}");
        }

        if ($user->balance < $amount) {
            throw new \Exception('Insufficient balance');
        }

        $pending = $user->withdrawals()->where('status', 'pending')->exists();
        if ($pending) {
            throw new \Exception('You have a pending withdrawal');
        }

        return DB::transaction(function () use ($user, $amount, $data) {
            $user->decrement('balance', $amount);

            $withdrawal = Withdrawal::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $user->id,
                'amount' => $amount,
                'channel' => $data['channel'],
                'details' => $data['details'],
                'status' => 'pending',
            ]);

            Transaction::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $user->id,
                'amount' => $amount,
                'direction' => '-',
                'type' => 'withdrawal',
                'status' => 'pending',
                'metadata' => ['withdrawal_id' => $withdrawal->id],
            ]);

            Notification::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $user->id,
                'type' => 'withdrawal_update',
                'title' => 'Withdrawal Requested',
                'body' => "Your withdrawal of GHS {$amount} is being processed",
                'metadata' => ['amount' => $amount, 'channel' => $data['channel']],
            ]);

            return $withdrawal;
        });
    }

    public function approve(Withdrawal $withdrawal, User $admin, ?string $note = null): void
    {
        DB::transaction(function () use ($withdrawal, $admin, $note) {
            $withdrawal->update([
                'status' => 'approved',
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
                'admin_note' => $note,
            ]);

            $withdrawal->transaction?->update(['status' => 'success']);

            $withdrawal->user->increment('total_withdrawals', $withdrawal->amount);

            AuditLog::create([
                'id' => Str::uuid()->toString(),
                'admin_id' => $admin->id,
                'target_id' => $withdrawal->user_id,
                'action' => 'withdrawal_approved',
                'new_value' => ['amount' => $withdrawal->amount, 'note' => $note],
            ]);

            Notification::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $withdrawal->user_id,
                'type' => 'withdrawal_update',
                'title' => 'Withdrawal Approved',
                'body' => "Your withdrawal of GHS {$withdrawal->amount} has been approved",
            ]);
        });
    }

    public function reject(Withdrawal $withdrawal, User $admin, string $reason): void
    {
        DB::transaction(function () use ($withdrawal, $admin, $reason) {
            $amount = $withdrawal->amount;

            $withdrawal->update([
                'status' => 'rejected',
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
                'admin_note' => $reason,
            ]);

            $withdrawal->user->increment('balance', $amount);

            $withdrawal->transaction?->update(['status' => 'failed']);

            AuditLog::create([
                'id' => Str::uuid()->toString(),
                'admin_id' => $admin->id,
                'target_id' => $withdrawal->user_id,
                'action' => 'withdrawal_rejected',
                'new_value' => ['amount' => $amount, 'reason' => $reason],
            ]);

            Notification::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $withdrawal->user_id,
                'type' => 'withdrawal_update',
                'title' => 'Withdrawal Rejected',
                'body' => "Your withdrawal of GHS {$amount} was rejected. Reason: {$reason}",
            ]);
        });
    }
}