<?php

namespace App\Services;

use App\Models\User;
use App\Models\VipLevel;
use App\Models\Transaction;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VipService
{
    public function upgrade(User $user): array
    {
        $currentLevel = $user->vipLevel;
        $nextLevel = $currentLevel?->getNextLevel();

        if (!$nextLevel) {
            throw new Exception('No upgrade available');
        }

        $cost = $nextLevel->upgrade_cost;

        if ($user->balance < $cost) {
            throw new Exception('Insufficient balance for upgrade');
        }

        return DB::transaction(function () use ($user, $currentLevel, $nextLevel, $cost) {
            $user->decrement('balance', $cost);
            $user->update([
                'vip_level' => $nextLevel->name,
                'vip_upgraded_at' => now(),
            ]);

            Transaction::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $user->id,
                'amount' => $cost,
                'direction' => '-',
                'type' => 'vip_upgrade',
                'status' => 'success',
            ]);

            Notification::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $user->id,
                'type' => 'vip_upgrade',
                'title' => 'VIP Upgraded!',
                'body' => "Congratulations! You are now {$nextLevel->name}",
                'metadata' => ['new_level' => $nextLevel->name],
            ]);

            return [
                'new_level' => $nextLevel->name,
                'cost' => $cost,
                'new_balance' => $user->fresh()->balance,
            ];
        });
    }
}