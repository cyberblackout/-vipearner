<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\DepositController;
use App\Http\Controllers\Api\WithdrawalController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\VipController;
use App\Http\Controllers\Api\CheckinController;
use App\Http\Controllers\Api\LuckyBagController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\WithdrawalController as AdminWithdrawalController;
use App\Http\Controllers\Admin\UserController as AdminUserController;

Route::prefix('auth')->group(function () {
    Route::post('/send-otp', [AuthController::class, 'sendOtp'])->middleware('throttle:3,5')->name('auth.send-otp');
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])->name('auth.verify-otp');
    Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
});

Route::middleware(['auth:sanctum', 'ban'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::patch('/profile', [ProfileController::class, 'update']);

    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks/{taskId}/start', [TaskController::class, 'start']);
    Route::post('/tasks/{sessionId}/complete', [TaskController::class, 'complete']);

    Route::post('/deposit/initiate', [DepositController::class, 'initiate']);

    Route::post('/withdraw', [WithdrawalController::class, 'request']);

    Route::get('/vip', [VipController::class, 'index']);
    Route::post('/vip/upgrade', [VipController::class, 'upgrade']);

    Route::get('/checkin', [CheckinController::class, 'index']);
    Route::post('/checkin', [CheckinController::class, 'checkin']);

    Route::get('/lucky-bag', [LuckyBagController::class, 'index']);
    Route::post('/lucky-bag/claim', [LuckyBagController::class, 'claim']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);

    Route::get('/transactions', [TransactionController::class, 'index']);
});

Route::middleware('auth:sanctum', 'admin')->prefix('admin')->group(function () {
    Route::get('/stats', [DashboardController::class, 'index']);

    Route::get('/withdrawals', [AdminWithdrawalController::class, 'index']);
    Route::post('/withdrawals/{id}/approve', [AdminWithdrawalController::class, 'approve']);
    Route::post('/withdrawals/{id}/reject', [AdminWithdrawalController::class, 'reject']);

    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{id}', [AdminUserController::class, 'show']);
    Route::post('/users/{id}/adjust-balance', [AdminUserController::class, 'adjustBalance']);
    Route::post('/users/{id}/ban', [AdminUserController::class, 'ban']);
    Route::post('/users/{id}/unban', [AdminUserController::class, 'unban']);
});

Route::post('/webhook/paystack', [WebhookController::class, 'handle'])
    ->middleware('paystack_signature');