<!DOCTYPE html>
<html lang="en-GH">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#1D4ED8">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>{{ config('app.name') }}</title>
    <link rel="manifest" href="/manifest.json">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-bg">
    <div class="max-w-[450px] mx-auto bg-bg min-h-screen relative">
        <!-- Header -->
        <header class="bg-header-gradient text-white p-4 pb-6 pt-8 rounded-b-3xl shadow-float">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-xl font-display font-bold">{{ config('app.name') }}</h1>
                    <p class="text-white/70 text-sm">Welcome back!</p>
                </div>
                <div class="avatar bg-white/20">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>
            </div>
            <div class="balance-card">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-white/70 text-sm">Total Balance</span>
                    <button x-data @click="$refs.balance.classList.toggle('hidden')" class="text-white/70 cursor-pointer">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                    </button>
                </div>
                <div class="text-3xl font-mono font-bold" x-ref="balance">GHS {{ number_format(Auth::user()?->balance ?? 0, 2) }}</div>
                <div class="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div>
                        <div class="text-xs text-white/70">Today</div>
                        <div class="font-mono text-sm">GHS {{ number_format(Auth::user()?->daily_revenue ?? 0, 2) }}</div>
                    </div>
                    <div>
                        <div class="text-xs text-white/70">Monthly</div>
                        <div class="font-mono text-sm">GHS {{ number_format(Auth::user()?->monthly_revenue ?? 0, 2) }}</div>
                    </div>
                    <div>
                        <div class="text-xs text-white/70">VIP</div>
                        <div class="font-mono text-sm">{{ Auth::user()?->vip_level ?? 'Intern' }}</div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="p-4 pb-24">
            @yield('content')
        </main>

        <!-- Bottom Navigation -->
        <nav class="bottom-nav">
            <div class="flex justify-around items-center">
                <a href="/" class="nav-item active">
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                    <span>Home</span>
                </a>
                <a href="/tasks" class="nav-item">
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                    <span>Tasks</span>
                </a>
                <a href="/messages" class="nav-item">
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                    <span>Messages</span>
                </a>
                <a href="/vip" class="nav-item">
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    <span>VIP</span>
                </a>
                <a href="/mine" class="nav-item">
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    <span>Mine</span>
                </a>
            </div>
        </nav>
    </div>

    <script>
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
        }
    </script>
</body>
</html>