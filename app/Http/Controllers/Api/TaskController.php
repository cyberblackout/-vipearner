<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TaskService;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(
        private TaskService $taskService
    ) {}

    public function index(Request $request)
    {
        $data = $this->taskService->getAvailableTasks($request->user());
        return response()->json($data);
    }

    public function start(Request $request, string $taskId)
    {
        $session = $this->taskService->startTask($request->user(), $taskId);
        return response()->json($session);
    }

    public function complete(Request $request, string $sessionId)
    {
        $result = $this->taskService->completeTask($request->user(), $sessionId);
        return response()->json($result);
    }
}