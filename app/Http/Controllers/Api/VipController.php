<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\VipLevel;
use App\Services\VipService;
use Illuminate\Http\Request;

class VipController extends Controller
{
    public function __construct(
        private VipService $vipService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $currentLevel = $user->vipLevel;
        $currentSort = $currentLevel?->sort_order ?? 0;

        $levels = VipLevel::orderBy('sort_order')->get();

        return response()->json([
            'levels' => $levels,
            'current_level' => $currentLevel,
            'balance' => $user->balance,
        ]);
    }

    public function upgrade(Request $request)
    {
        $result = $this->vipService->upgrade($request->user());
        return response()->json($result);
    }
}