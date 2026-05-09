<?php

namespace App\Services;

use App\Models\User;
use App\Models\Transaction;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;

class CheckinService
{
    public function checkin(User $user): array
    {
        $today = now()->timezone('Africa/Accra')->toDateString();

        if ($user->last_checkin === $today) {
            throw new \Exception('Already checked in today');
        }

        $yesterday = now()->timezone('Africa/Accra')->subDay()->toDateString();
        $currentStreak = ($user->last_checkin === $yesterday) ? $user->checkin_streak : 0;
        $newStreak = min($currentStreak + 1, 7);

        $reward = 0.10 * $newStreak;

        return DB::transaction(function () use ($user, $today, $newStreak, $reward) {
            $user->increment('balance', $reward);
            $user->increment('total_income', $reward);
            $user->increment('daily_revenue', $reward);
            $user->increment('monthly_revenue', $reward);
            $user->update([
                'last_checkin' => $today,
                'checkin_streak' => $newStreak,
            ]);

            Transaction::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $user->id,
                'amount' => $reward,
                'direction' => '+',
                'type' => 'daily_checkin',
                'status' => 'success',
            ]);

            Notification::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $user->id,
                'type' => 'daily_checkin',
                'title' => 'Daily Check-in!',
                'body' => "You earned GHS {$reward} for checking in. Streak: {$newStreak} days",
                'metadata' => ['streak' => $newStreak, 'reward' => $reward],
            ]);

            return [
                'reward' => $reward,
                'streak' => $newStreak,
                'new_balance' => $user->fresh()->balance,
            ];
        });
    }

    public function getStreakInfo(User $user): array
    {
        $today = now()->timezone('Africa/Accra')->toDateString();
        $yesterday = now()->timezone('Africa/Accra')->subDay()->toDateString();

        $canCheckin = $user->last_checkin !== $today;
        $streak = $user->checkin_streak ?? 0;

        if ($user->last_checkin !== $yesterday && $user->last_checkin !== $today) {
            $streak = 0;
        }

        $rewards = [];
        for ($i = 1; $i <= 7; $i++) {
            $rewards[$i] = 0.10 * $i;
        }

        return [
            'current_streak' => $streak,
            'can_checkin' => $canCheckin,
            'rewards' => $rewards,
            'today_reward' => 0.10 * ($streak + 1),
        ];
    }
}