<?php

namespace App\Services;

use App\Models\User;
use App\Models\Task;
use App\Models\TaskSession;
use App\Models\TaskLog;
use App\Models\Transaction;
use App\Models\Notification;
use App\Models\VipLevel;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TaskService
{
    public function startTask(User $user, string $taskId): TaskSession
    {
        $task = Task::findOrFail($taskId);

        if (!$task->is_active) {
            throw new \Exception('Task is not active');
        }

        $vipLevel = $user->vipLevel;
        if ($vipLevel->sort_order < $task->min_vip_sort) {
            throw new \Exception('VIP level requirement not met');
        }

        $today = now()->timezone('Africa/Accra')->toDateString();
        $todayCount = TaskLog::where('user_id', $user->id)
            ->whereDate('completed_at', $today)
            ->count();

        if ($todayCount >= $vipLevel->daily_tasks) {
            throw new \Exception('Daily task limit reached');
        }

        $existingSession = TaskSession::where('user_id', $user->id)
            ->where('task_id', $taskId)
            ->where('completed', false)
            ->where('expires_at', '>', now())
            ->first();

        if ($existingSession) {
            return $existingSession;
        }

        return TaskSession::create([
            'id' => Str::uuid()->toString(),
            'user_id' => $user->id,
            'task_id' => $taskId,
            'started_at' => now(),
            'expires_at' => now()->addHours(2),
        ]);
    }

    public function completeTask(User $user, string $sessionId): array
    {
        $session = TaskSession::where('id', $sessionId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        if ($session->completed) {
            throw new \Exception('Task already completed');
        }

        if ($session->isExpired()) {
            throw new \Exception('Session expired');
        }

        $task = $session->task;
        $elapsedSeconds = now()->diffInSeconds($session->started_at);

        if ($elapsedSeconds < $task->wait_seconds) {
            throw new \Exception('Task timer not complete');
        }

        $today = now()->timezone('Africa/Accra')->toDateString();
        $existsToday = TaskLog::where('user_id', $user->id)
            ->where('task_id', $task->id)
            ->whereDate('completed_at', $today)
            ->exists();

        if ($existsToday) {
            throw new \Exception('Task already completed today');
        }

        return DB::transaction(function () use ($user, $session, $task) {
            TaskLog::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $user->id,
                'task_id' => $task->id,
                'session_id' => $session->id,
                'reward_earned' => $task->reward,
                'completed_at' => now(),
            ]);

            $user->increment('balance', $task->reward);
            $user->increment('total_income', $task->reward);
            $user->increment('daily_revenue', $task->reward);
            $user->increment('monthly_revenue', $task->reward);
            $user->increment('total_profit', $task->reward);

            Transaction::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $user->id,
                'amount' => $task->reward,
                'direction' => '+',
                'type' => 'task_reward',
                'status' => 'success',
            ]);

            $session->update(['completed' => true]);

            Notification::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $user->id,
                'type' => 'task_reward',
                'title' => 'Task Completed!',
                'body' => "You earned GHS {$task->reward} for completing {$task->title}",
            ]);

            return [
                'new_balance' => $user->fresh()->balance,
                'reward' => $task->reward,
            ];
        });
    }

    public function getAvailableTasks(User $user): array
    {
        $vipSortOrder = $user->vipLevel?->sort_order ?? 0;
        $today = now()->timezone('Africa/Accra')->toDateString();

        $completedTaskIds = TaskLog::where('user_id', $user->id)
            ->whereDate('completed_at', $today)
            ->pluck('task_id');

        $tasks = Task::where('is_active', true)
            ->where('min_vip_sort', '<=', $vipSortOrder)
            ->whereNotIn('id', $completedTaskIds)
            ->orderBy('display_order')
            ->get();

        $todayCount = TaskLog::where('user_id', $user->id)
            ->whereDate('completed_at', $today)
            ->count();

        $dailyLimit = $user->vipLevel?->daily_tasks ?? 5;

        return [
            'tasks' => $tasks,
            'remaining' => $dailyLimit - $todayCount,
            'limit' => $dailyLimit,
        ];
    }
}