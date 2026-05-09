<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\LuckyBagService;

class LuckyBagController extends Controller
{
    public function __construct(
        private LuckyBagService $luckyBagService
    ) {}

    public function index(Request $request)
    {
        $status = $this->luckyBagService->getClaimStatus($request->user());
        return response()->json($status);
    }

    public function claim(Request $request)
    {
        $result = $this->luckyBagService->claim($request->user());
        return response()->json($result);
    }
}