<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\CheckinService;

class CheckinController extends Controller
{
    public function __construct(
        private CheckinService $checkinService
    ) {}

    public function index(Request $request)
    {
        $info = $this->checkinService->getStreakInfo($request->user());
        return response()->json($info);
    }

    public function checkin(Request $request)
    {
        $result = $this->checkinService->checkin($request->user());
        return response()->json($result);
    }
}