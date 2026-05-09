@extends('layouts.app')

@section('content')
<div class="stats-grid mb-4">
    <div class="stat-card">
        <div class="text-xs text-muted">Tasks Today</div>
        <div class="font-mono font-bold text-lg text-primary">{{ Auth::user()?->today_task_count ?? 0 }}</div>
    </div>
    <div class="stat-card">
        <div class="text-xs text-muted">Per Task</div>
        <div class="font-mono font-bold text-lg text-success">GHS {{ number_format(Auth::user()?->vipLevel?->task_reward_multiplier ?? 0.20, 2) }}</div>
    </div>
    <div class="stat-card">
        <div class="text-xs text-muted">Daily Limit</div>
        <div class="font-mono font-bold text-lg">{{ Auth::user()?->vipLevel?->daily_task_limit ?? 5 }}</div>
    </div>
    <div class="stat-card">
        <div class="text-xs text-muted">VIP Level</div>
        <div class="font-mono font-bold text-lg text-gold">{{ Auth::user()?->vip_level ?? 'Intern' }}</div>
    </div>
</div>

<div class="card mb-4">
    <div class="flex items-center justify-between mb-3">
        <h2 class="font-display font-semibold">Daily Tasks</h2>
        <span class="text-xs bg-primary text-white px-3 py-1 rounded-full">{{ max(0, (Auth::user()?->vipLevel?->daily_task_limit ?? 5) - (Auth::user()?->today_task_count ?? 0)) }} remaining</span>
    </div>
    <p class="text-sm text-muted">Complete Facebook engagement tasks to earn GHS rewards. Higher VIP = Higher rewards!</p>
</div>

<div class="task-card">
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.96.71 2.21 1.18 3.84 1.18 3.02 0 5.5-2.47 5.5-5.5s-2.48-5.5-5.5-5.5-5.5 2.47-5.5 5.5c0 .34.04.67.11L1.84 7.02C1.47 7.58 1.23 8.26 1.23 9c0 3.64 2.95 6.6 6.6 6.6s6.6-2.95 6.6-6.6-3.05-6.6-6.6-6.6z"/></svg>
        </div>
        <div class="flex-1">
            <h3 class="font-semibold">Like Facebook Post</h3>
            <p class="text-sm text-muted">Earn GHS {{ number_format(Auth::user()?->vipLevel?->task_reward_multiplier ?? 0.20, 2) }}</p>
        </div>
        <button class="btn btn-primary text-sm py-2 px-4">Start</button>
    </div>
</div>

<div class="task-card">
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.96.71 2.21 1.18 3.84 1.18 3.02 0 5.5-2.47 5.5-5.5s-2.48-5.5-5.5-5.5-5.5 2.47-5.5 5.5c0 .34.04.67.11L1.84 7.02C1.47 7.58 1.23 8.26 1.23 9c0 3.64 2.95 6.6 6.6 6.6s6.6-2.95 6.6-6.6-3.05-6.6-6.6-6.6z"/></svg>
        </div>
        <div class="flex-1">
            <h3 class="font-semibold">Share Post</h3>
            <p class="text-sm text-muted">Earn GHS {{ number_format((Auth::user()?->vipLevel?->task_reward_multiplier ?? 0.20) * 1.5, 2) }}</p>
        </div>
        <button class="btn btn-primary text-sm py-2 px-4">Start</button>
    </div>
</div>

<div class="task-card">
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/></svg>
        </div>
        <div class="flex-1">
            <h3 class="font-semibold">Comment on Post</h3>
            <p class="text-sm text-muted">Earn GHS {{ number_format((Auth::user()?->vipLevel?->task_reward_multiplier ?? 0.20) * 2, 2) }}</p>
        </div>
        <button class="btn btn-primary text-sm py-2 px-4">Start</button>
    </div>
</div>

<div class="task-card">
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
        </div>
        <div class="flex-1">
            <h3 class="font-semibold">Follow Facebook Page</h3>
            <p class="text-sm text-muted">Earn GHS {{ number_format((Auth::user()?->vipLevel?->task_reward_multiplier ?? 0.20) * 0.5, 2) }}</p>
        </div>
        <button class="btn btn-primary text-sm py-2 px-4">Start</button>
    </div>
</div>

<div class="task-card">
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
        </div>
        <div class="flex-1">
            <h3 class="font-semibold">Watch Video Ad</h3>
            <p class="text-sm text-muted">Earn GHS {{ number_format((Auth::user()?->vipLevel?->task_reward_multiplier ?? 0.20) * 0.75, 2) }}</p>
        </div>
        <button class="btn btn-primary text-sm py-2 px-4">Start</button>
    </div>
</div>

<div class="empty-state">
    <div class="empty-icon">🎉</div>
    <p class="font-semibold">All tasks completed today!</p>
    <p class="text-sm text-muted">Come back tomorrow for more tasks. Upgrade VIP for more daily tasks.</p>
    <a href="/vip" class="btn btn-primary mt-3">Upgrade VIP</a>
</div>
@endsection