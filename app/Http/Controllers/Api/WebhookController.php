<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\DepositService;
use App\Services\ReferralService;
use App\Models\VipLevel;
use Illuminate\Http\Request;
use App\Http\Middleware\VerifyPaystackSignature;

class WebhookController extends Controller
{
    public function __construct(
        private DepositService $depositService,
        private ReferralService $referralService
    ) {}

    public function handle(Request $request)
    {
        $event = $request->input('event');

        if ($event !== 'charge.success') {
            return response()->json(['received' => true]);
        }

        $data      = $request->input('data', []);
        $reference = $data['reference'] ?? null;
        $amount    = isset($data['amount']) ? $data['amount'] / 100 : 0;

        if (!$reference) {
            return response()->json(['received' => true]);
        }

        $transaction = Transaction::where('paystack_reference', $reference)
            ->where('status', 'pending')
            ->first();

        if (!$transaction) {
            return response()->json(['received' => true]);
        }

        $metadata = $data['metadata'] ?? [];
        $userId   = $metadata['user_id'] ?? $transaction->user_id;

        if ($userId != $transaction->user_id) {
            return response()->json(['received' => true]);
        }

        $this->depositService->processCallback($reference, $amount);

        $triggerAmount = config('app.referral_trigger_deposit', 10);
        if ($amount >= $triggerAmount) {
            $this->referralService->processBonus($transaction->user, $amount);
        }

        return response()->json(['received' => true]);
    }
}