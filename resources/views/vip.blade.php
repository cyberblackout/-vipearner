@extends('layouts.app')

@section('content')
<header class="bg-header-gradient text-white p-4 pb-6 pt-8 rounded-b-3xl shadow-float">
    <h1 class="text-xl font-bold">VIP Tiers</h1>
    <p class="text-white/70 text-sm mt-1">Upgrade for more rewards</p>
</header>

<div class="p-4">
    <div class="vip-scroll">
        <div class="vip-card current">
            <div class="flex items-center justify-between mb-2">
                <span class="vip-badge">Current</span>
            </div>
            <h3 class="font-bold text-lg">{{ Auth::user()?->vip_level ?? 'Intern' }}</h3>
            <p class="text-sm text-muted">{{ Auth::user()?->vipLevel?->daily_task_limit ?? 5 }} tasks per day</p>
            <div class="mt-3">
                <div class="font-mono text-2xl font-bold text-muted">GHS {{ number_format(Auth::user()?->vipLevel?->task_reward_multiplier ?? 0.20, 2) }}</div>
                <p class="text-xs text-muted">per task</p>
            </div>
            <p class="text-xs text-muted mt-2">Upgrade: GHS {{ number_format(Auth::user()?->vipLevel?->upgrade_cost ?? 10.00, 2) }}</p>
        </div>

        <div class="vip-card">
            <h3 class="font-bold text-lg">VIP 1</h3>
            <p class="text-sm text-muted">10 tasks per day</p>
            <div class="mt-3">
                <div class="font-mono text-2xl font-bold">GHS 0.50</div>
                <p class="text-xs text-muted">per task</p>
            </div>
            <button class="btn btn-primary mt-3 w-full">Upgrade - GHS 10</button>
        </div>

        <div class="vip-card">
            <h3 class="font-bold text-lg">VIP 2</h3>
            <p class="text-sm text-muted">20 tasks per day</p>
            <div class="mt-3">
                <div class="font-mono text-2xl font-bold">GHS 1.00</div>
                <p class="text-xs text-muted">per task</p>
            </div>
            <button class="btn btn-primary mt-3 w-full">Upgrade - GHS 25</button>
        </div>

        <div class="vip-card">
            <h3 class="font-bold text-lg">VIP 3</h3>
            <p class="text-sm text-muted">35 tasks per day</p>
            <div class="mt-3">
                <div class="font-mono text-2xl font-bold">GHS 1.80</div>
                <p class="text-xs text-muted">per task</p>
            </div>
            <button class="btn btn-primary mt-3 w-full">Upgrade - GHS 50</button>
        </div>

        <div class="vip-card">
            <h3 class="font-bold text-lg">VIP 4</h3>
            <p class="text-sm text-muted">55 tasks per day</p>
            <div class="mt-3">
                <div class="font-mono text-2xl font-bold">GHS 2.80</div>
                <p class="text-xs text-muted">per task</p>
            </div>
            <button class="btn btn-primary mt-3 w-full">Upgrade - GHS 100</button>
        </div>

        <div class="vip-card">
            <h3 class="font-bold text-lg">VIP 5</h3>
            <p class="text-sm text-muted">80 tasks per day</p>
            <div class="mt-3">
                <div class="font-mono text-2xl font-bold text-gold">GHS 4.00</div>
                <p class="text-xs text-muted">per task</p>
            </div>
            <button class="btn btn-primary mt-3 w-full">Upgrade - GHS 200</button>
        </div>
    </div>

    <div class="card mt-4">
        <h3 class="font-semibold mb-3">VIP Benefits</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Tier</th>
                    <th>Daily Tasks</th>
                    <th>Per Task</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>Intern</td><td>5</td><td>GHS 0.20</td></tr>
                <tr><td>VIP 1</td><td>10</td><td>GHS 0.50</td></tr>
                <tr><td>VIP 2</td><td>20</td><td>GHS 1.00</td></tr>
                <tr><td>VIP 3</td><td>35</td><td>GHS 1.80</td></tr>
                <tr><td>VIP 4</td><td>55</td><td>GHS 2.80</td></tr>
                <tr><td>VIP 5</td><td>80</td><td>GHS 4.00</td></tr>
            </tbody>
        </table>
    </div>
</div>
@endsection