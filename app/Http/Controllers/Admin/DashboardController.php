<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $stats = [
            'total_users' => \App\Models\User::count(),
            'total_balance' => \App\Models\User::sum('balance'),
            'total_deposits' => \App\Models\Transaction::where('type', 'deposit')->where('status', 'success')->sum('amount'),
            'pending_withdrawals' => \App\Models\Withdrawal::where('status', 'pending')->count(),
            'today_tasks' => \App\Models\TaskLog::whereDate('completed_at', now()->toDateString())->count(),
            'today_revenue' => \App\Models\User::sum('daily_revenue'),
        ];

        return response()->json($stats);
    }
}