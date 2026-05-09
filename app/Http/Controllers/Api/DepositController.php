<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\DepositService;
use Illuminate\Http\Request;

class DepositController extends Controller
{
    public function __construct(
        private DepositService $depositService
    ) {}

    public function initiate(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1|max:10000',
        ]);

        $result = $this->depositService->initiate(
            $request->user(),
            (float) $request->amount
        );

        return response()->json($result);
    }
}