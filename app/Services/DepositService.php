<?php

namespace App\Services;

use App\Models\User;
use App\Models\Transaction;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class DepositService
{
    public function initiate(User $user, float $amount): array
    {
        $minDeposit = config('app.min_deposit_ghs', 1);
        $maxDeposit = config('app.min_deposit_ghs', 10000);

        if ($amount < $minDeposit || $amount > $maxDeposit) {
            throw new \Exception("Amount must be between GHS {$minDeposit} and GHS {$maxDeposit}");
        }

        $paystackSecret = config('paystack.secret_key');
        $callbackUrl = config('app.url') . '/deposit/callback';

        $response = Http::withToken($paystackSecret)
            ->post('https://api.paystack.co/transaction/initialize', [
                'email' => $user->phone . '@vipearner.gh',
                'amount' => $amount * 100,
                'currency' => 'GHS',
                'channels' => ['mobile_money', 'card'],
                'metadata' => [
                    'user_id' => $user->id,
                    'type' => 'deposit',
                ],
                'callback_url' => $callbackUrl,
            ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to initiate payment');
        }

        $data = $response->json('data');

        $transaction = Transaction::create([
            'id' => Str::uuid()->toString(),
            'user_id' => $user->id,
            'amount' => $amount,
            'direction' => '+',
            'type' => 'deposit',
            'status' => 'pending',
            'paystack_reference' => $data['reference'],
        ]);

        return [
            'authorization_url' => $data['authorization_url'],
            'reference' => $data['reference'],
        ];
    }

    public function processCallback(string $reference, float $amount): void
    {
        $transaction = Transaction::where('paystack_reference', $reference)
            ->where('status', 'pending')
            ->firstOrFail();

        $user = $transaction->user;

        DB::transaction(function () use ($user, $transaction, $amount) {
            $transaction->update(['status' => 'success']);

            $user->increment('balance', $amount);
            $user->increment('work_deposit', $amount);

            Notification::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $user->id,
                'type' => 'deposit',
                'title' => 'Deposit Successful',
                'body' => "Your deposit of GHS {$amount} was successful",
                'metadata' => ['amount' => $amount],
            ]);
        });
    }
}