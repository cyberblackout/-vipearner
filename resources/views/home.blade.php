@extends('layouts.app')

@section('content')
<div class="stats-grid mb-4">
    <div class="stat-card">
        <div class="text-xs text-muted">Total Income</div>
        <div class="font-mono font-bold text-lg text-success">GHS {{ number_format(Auth::user()?->total_income ?? 0, 2) }}</div>
    </div>
    <div class="stat-card">
        <div class="text-xs text-muted">Total Profit</div>
        <div class="font-mono font-bold text-lg text-success">GHS {{ number_format(Auth::user()?->total_profit ?? 0, 2) }}</div>
    </div>
    <div class="stat-card">
        <div class="text-xs text-muted">Withdrawals</div>
        <div class="font-mono font-bold text-lg">GHS {{ number_format(Auth::user()?->total_withdrawals ?? 0, 2) }}</div>
    </div>
    <div class="stat-card">
        <div class="text-xs text-muted">Work Deposit</div>
        <div class="font-mono font-bold text-lg text-primary">GHS {{ number_format(Auth::user()?->work_deposit ?? 0, 2) }}</div>
    </div>
</div>

<div class="card mb-4">
    <h2 class="font-display font-semibold mb-3">Quick Actions</h2>
    <div class="action-grid">
        <a href="/deposit" class="action-item">
            <svg class="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.35 3.86 3.93V23h3v-2.05c1.95-.41 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
            <span class="text-xs mt-1">Deposit</span>
        </a>
        <a href="/withdraw" class="action-item">
            <svg class="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16h6v6h4v-6h6z"/></svg>
            <span class="text-xs mt-1">Withdraw</span>
        </a>
        <a href="/referral" class="action-item">
            <svg class="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c0 0-.67.64-1.61.64-.87 0-1.51-.56-1.51-1.37 0-.71.55-1.34 1.42-1.34.88 0 1.45.72 1.45 1.53 0 .86-.59 1.15-1.39 1.54l-.35.14c-.83.32-1.42.74-1.42 1.55 0 1.01 1.06 1.66 2.27 1.66 1.28 0 2.15-.77 2.15-1.71 0-.94-.77-1.28-1.48-1.57l.34-.13c.35-.13.67-.33.67-.73 0-.45-.37-.81-.96-.81-.65 0-1.07.43-1.07.94 0 .38.26.62.71.84l.3.1c.46.15.76.43.76.93 0 .79-.93 1.27-2.11 1.27-1.28 0-2.2-.67-2.2-1.73 0-.92.82-1.26 1.52-1.49l.34-.14c.59-.24.98-.56.98-1.19 0-.87-.75-1.38-2.04-1.38-1.24 0-2.16.59-2.16 1.58 0 .87.63 1.19 1.42 1.41"/></svg>
            <span class="text-xs mt-1">Invite</span>
        </a>
        <a href="/checkin" class="action-item">
            <svg class="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            <span class="text-xs mt-1">Check-In</span>
        </a>
    </div>
</div>

<div class="card mb-4">
    <div class="flex items-center justify-between mb-3">
        <h2 class="font-display font-semibold">Lucky Bag</h2>
        <a href="/lucky-bag" class="text-sm text-primary">View All →</a>
    </div>
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <div class="lucky-bag animate-bounce">🎁</div>
            <div>
                <div class="font-semibold">Win GHS 0.10 - 1.00</div>
                <div class="text-xs text-muted">Claim your daily reward!</div>
            </div>
        </div>
        <button class="btn btn-primary">Claim</button>
    </div>
</div>

<div class="card">
    <div class="flex items-center justify-between mb-3">
        <h2 class="font-display font-semibold">Daily Tasks</h2>
        <span class="text-xs bg-primary text-white px-2 py-1 rounded-full">5 remaining</span>
    </div>
    <p class="text-sm text-muted">Complete Facebook engagement tasks to earn GHS rewards.</p>
    <a href="/tasks" class="btn btn-primary mt-3">View Tasks</a>
</div>
@endsection