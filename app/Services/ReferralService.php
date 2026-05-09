<?php

namespace App\Services;

use App\Models\User;
use App\Models\Referral;
use App\Jobs\ProcessReferralBonus;
use Illuminate\Support\Str;

class ReferralService
{
    public function link(User $referrer, string $referralCode): Referral
    {
        $referredUser = User::where('referral_code', $referralCode)->firstOrFail();

        if ($referredUser->referred_by) {
            throw new \Exception('User already has a referrer');
        }

        if ($referredUser->id === $referrer->id) {
            throw new \Exception('Cannot refer yourself');
        }

        return Referral::create([
            'id' => Str::uuid()->toString(),
            'referrer_id' => $referrer->id,
            'referred_id' => $referredUser->id,
        ]);
    }

    public function getReferralStats(User $user): array
    {
        $referrals = $user->referrals()
            ->with('referred')
            ->get();

        $total = $referrals->count();
        $rewarded = $referrals->where('reward_paid', true)->count();
        $pending = $referrals->where('reward_paid', false)->count();
        $totalEarned = $referrals->where('reward_paid', true)->sum('reward_amount');

        return [
            'total' => $total,
            'rewarded' => $rewarded,
            'pending' => $pending,
            'total_earned' => $totalEarned,
            'referrals' => $referrals,
        ];
    }

    public function processBonus(User $referred, float $depositAmount): void
    {
        $triggerAmount = config('app.referral_trigger_deposit', 10);

        if ($depositAmount < $triggerAmount) {
            return;
        }

        ProcessReferralBonus::dispatch($referred->id);
    }
}