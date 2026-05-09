@extends('layouts.app')

@section('content')
<header class="bg-header-gradient text-white p-4 pb-6 pt-8 rounded-b-3xl shadow-float">
    <h1 class="text-xl font-bold">Messages</h1>
    <p class="text-white/70 text-sm mt-1">Stay updated</p>
</header>

<div class="p-4">
    <div class="card">
        <div class="flex items-center gap-3 p-3 border-b">
            <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.96.71 2.21 1.18 3.84 1.18 3.02 0 5.5-2.47 5.5-5.5s-2.48-5.5-5.5-5.5-5.5 2.47-5.5 5.5c0 .34.04.67.11L1.84 7.02C1.47 7.58 1.23 8.26 1.23 9c0 3.64 2.95 6.6 6.6 6.6s6.6-2.95 6.6-6.6-3.05-6.6-6.6-6.6z"/></svg>
            </div>
            <div class="flex-1">
                <p class="font-semibold">Welcome to VIP Earner GH!</p>
                <p class="text-sm text-muted">Complete tasks to earn GHS rewards</p>
            </div>
            <span class="text-xs text-muted">Now</span>
        </div>

        <div class="flex items-center gap-3 p-3 border-b opacity-60">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            </div>
            <div class="flex-1">
                <p class="font-semibold">Daily Check-in Available</p>
                <p class="text-sm text-muted">Check in daily to earn rewards</p>
            </div>
            <span class="text-xs text-muted">1h ago</span>
        </div>

        <div class="flex items-center gap-3 p-3 border-b opacity-60">
            <div class="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 24 24"><path d="M11 16.17L4.83 12l-1.42 1.41L11 19 21 9l-1.41-1.41z"/></svg>
            </div>
            <div class="flex-1">
                <p class="font-semibold">Profile Created</p>
                <p class="text-sm text-muted">Your account is ready</p>
            </div>
            <span class="text-xs text-muted">2h ago</span>
        </div>
    </div>

    <p class="text-xs text-muted text-center mt-4">No more notifications</p>
</div>
@endsection