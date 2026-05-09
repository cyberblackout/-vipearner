<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\WithdrawalService;
use Illuminate\Http\Request;

class WithdrawalController extends Controller
{
    public function __construct(
        private WithdrawalService $withdrawalService
    ) {}

    public function request(Request $request)
    {
        $validated = $request->validate([
            'amount'  => 'required|numeric|min:5',
            'channel' => 'required|in:mobile_money,bank',
            'details' => 'required|array',
            'details.account_name'   => 'required|string|max:100',
            'details.account_number' => 'required|string|max:30',
            'details.bank_name'      => 'required_if:channel,bank|string|max:100',
            'details.network'        => 'required_if:channel,mobile_money|string|max:30',
        ]);

        $result = $this->withdrawalService->request(
            $request->user(),
            $validated
        );

        return response()->json($result);
    }
}