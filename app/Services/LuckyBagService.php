<?php

namespace App\Services;

use App\Models\User;
use App\Models\Transaction;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LuckyBagService
{
    public function claim(User $user): array
    {
        $lastClaim = $user->last_lucky_bag;
        $minBag = config('app.lucky_bag_min', 0.10);
        $maxBag = config('app.lucky_bag_max', 1.00);

        if ($lastClaim && $lastClaim->diffInHours() < 24) {
            $nextClaim = $lastClaim->addHours(24);
            throw new \Exception('You can claim again at ' . $nextClaim->format('H:i'));
        }

        $reward = rand($minBag * 100, $maxBag * 100) / 100;

        return DB::transaction(function () use ($user, $reward) {
            $user->increment('balance', $reward);
            $user->increment('total_income', $reward);

            $user->update(['last_lucky_bag' => now()]);

            Transaction::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $user->id,
                'amount' => $reward,
                'direction' => '+',
                'type' => 'lucky_bag',
                'status' => 'success',
            ]);

            Notification::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $user->id,
                'type' => 'lucky_bag',
                'title' => 'Lucky Bag!',
                'body' => "You won GHS {$reward} from the lucky bag!",
                'metadata' => ['reward' => $reward],
            ]);

            return [
                'reward' => $reward,
                'new_balance' => $user->fresh()->balance,
            ];
        });
    }

    public function getClaimStatus(User $user): array
    {
        $lastClaim = $user->last_lucky_bag;
        $canClaim = !$lastClaim || $lastClaim->diffInHours() >= 24;

        $minBag = config('app.lucky_bag_min', 0.10);
        $maxBag = config('app.lucky_bag_max', 1.00);

        if (!$canClaim) {
            $nextClaim = $lastClaim->addHours(24);
            $hoursRemaining = now()->diffInHours($nextClaim, false);
            $minutesRemaining = now()->diffInMinutes($nextClaim, false) % 60;
        }

        return [
            'can_claim' => $canClaim,
            'reward_min' => $minBag,
            'reward_max' => $maxBag,
            'next_claim_time' => $canClaim ? null : $nextClaim->format('H:i'),
        ];
    }
}