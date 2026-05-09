<?php

namespace App\Jobs;

use App\Models\Referral;
use App\Models\User;
use App\Models\Transaction;
use App\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class ProcessReferralBonus implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $referredUserId
    ) {}

    public function handle(): void
    {
        $referral = Referral::where('referred_id', $this->referredUserId)
            ->where('reward_paid', false)
            ->first();

        if (!$referral) {
            return;
        }

        $referrer = User::find($referral->referrer_id);
        $reward = $referral->reward_amount;

        \Illuminate\Support\Facades\DB::transaction(function () use ($referrer, $referral, $reward) {
            $referrer->increment('balance', $reward);
            $referrer->increment('total_income', $reward);

            Transaction::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $referrer->id,
                'amount' => $reward,
                'direction' => '+',
                'type' => 'referral_bonus',
                'status' => 'success',
                'metadata' => ['referred_user' => $this->referredUserId],
            ]);

            $referral->update([
                'reward_paid' => true,
                'paid_at' => now(),
            ]);

            Notification::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $referrer->id,
                'type' => 'referral_bonus',
                'title' => 'Referral Bonus!',
                'body' => "You earned GHS {$reward} for referring a friend!",
                'metadata' => ['reward' => $reward],
            ]);
        });
    }
}