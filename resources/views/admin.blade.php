<!DOCTYPE html>
<html lang="en-GH">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#7C3AED">
    <title>Admin - {{ config('app.name') }}</title>
    <link rel="manifest" href="/manifest.json">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <style>
        .bg-header-gradient { background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); }
        .bg-bg { background: #0F172A; }
        .text-white\/70 { color: rgba(255,255,255,0.7); }
        .text-white\/60 { color: rgba(255,255,255,0.6); }
        .bg-card { background: #1E293B; }
        .border-card { border-color: #334155; }
        .status-pending { color: #F59E0B; }
        .status-approved { color: #10B981; }
        .status-rejected { color: #EF4444; }
    </style>
</head>
<body class="bg-bg text-white">
    <div class="max-w-[450px] mx-auto min-h-screen pb-24">
        <header class="bg-header-gradient p-4 pb-6 pt-8 rounded-b-3xl">
            <h1 class="text-xl font-bold">Admin Dashboard</h1>
            <p class="text-white/70 text-sm">Manage your platform</p>
        </header>
        
        <main class="p-4">
            <!-- Stats Cards -->
            <div class="grid grid-cols-2 gap-3 mb-6">
                <div class="bg-card p-4 rounded-xl border border-card">
                    <div class="text-white/60 text-xs">Total Users</div>
                    <div class="text-2xl font-bold" id="totalUsers">-</div>
                </div>
                <div class="bg-card p-4 rounded-xl border border-card">
                    <div class="text-white/60 text-xs">Total Balance</div>
                    <div class="text-2xl font-bold" id="totalBalance">-</div>
                </div>
                <div class="bg-card p-4 rounded-xl border border-card">
                    <div class="text-white/60 text-xs">Pending Withdrawals</div>
                    <div class="text-2xl font-bold status-pending" id="pendingWithdrawals">-</div>
                </div>
                <div class="bg-card p-4 rounded-xl border border-card">
                    <div class="text-white/60 text-xs">Banned Users</div>
                    <div class="text-2xl font-bold text-red-500" id="bannedUsers">-</div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="bg-card rounded-xl border border-card p-4 mb-6">
                <h2 class="font-bold mb-3">Quick Actions</h2>
                <div class="flex gap-2">
                    <button onclick="loadUsers()" class="flex-1 bg-blue-600 py-2 rounded-lg text-sm">Users</button>
                    <button onclick="loadWithdrawals()" class="flex-1 bg-purple-600 py-2 rounded-lg text-sm">Withdrawals</button>
                </div>
            </div>
            
            <!-- Users List -->
            <div id="usersSection" class="hidden">
                <h2 class="font-bold mb-3">Users</h2>
                <div id="usersList" class="space-y-2"></div>
            </div>
            
            <!-- Withdrawals List -->
            <div id="withdrawalsSection" class="hidden">
                <h2 class="font-bold mb-3">Pending Withdrawals</h2>
                <div id="withdrawalsList" class="space-y-2"></div>
            </div>
        </main>
        
        <!-- Logout -->
        <div class="fixed bottom-4 right-4">
            <button onclick="logout()" class="bg-red-600 text-white px-4 py-2 rounded-full">Logout</button>
        </div>
    </div>
    
    <script>
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(reg => {
                if (reg) reg.unregister();
            });
        }
        
        const API_URL = '/api';
        let token = localStorage.getItem('admin_token');
        
        if (!token) {
            const urlParams = new URLSearchParams(window.location.search);
            token = urlParams.get('token');
            if (token) {
                localStorage.setItem('admin_token', token);
                window.location.href = '/admin';
            }
        }
        
        if (!token) {
            document.body.innerHTML = `<div class="p-4">
                <h1 class="text-xl font-bold mb-4">Admin Login</h1>
                <div id="error" class="text-red-500 text-sm mb-2 hidden"></div>
                <form id="loginForm" class="space-y-3">
                    <input type="text" id="phone" placeholder="Admin Phone" class="w-full p-3 bg-card rounded-xl border border-card">
                    <input type="password" id="password" placeholder="Password" class="w-full p-3 bg-card rounded-xl border border-card">
                    <button type="submit" class="w-full bg-purple-600 py-3 rounded-xl font-bold">Login</button>
                </form>
            </div>`;
            document.getElementById('loginForm').onsubmit = async (e) => {
                e.preventDefault();
                const phone = document.getElementById('phone').value;
                const password = document.getElementById('password').value;
                try {
                    const res = await fetch(API_URL + '/auth/login', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
                        body: JSON.stringify({phone, password})
                    });
                    const data = await res.json();
                    console.log('Login response:', data);
                    if (data.token) {
                        localStorage.setItem('admin_token', data.token);
                        window.location.href = '/admin';
                    } else {
                        const err = document.getElementById('error');
                        err.textContent = data.error || data.message || 'Login failed - is server running?';
                        err.classList.remove('hidden');
                    }
                } catch(err) {
                    console.error(err);
                    const e = document.getElementById('error');
                    e.textContent = 'Cannot connect to server. Make sure php artisan serve is running.';
                    e.classList.remove('hidden');
                }
            };
        }
        
        async function apiCall(endpoint, options = {}) {
            options.headers = {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json',
                ...options.headers
            };
            const res = await fetch(API_URL + endpoint, options);
            return res.json();
        }
        
        async function loadStats() {
            try {
                const stats = await apiCall('/admin/stats');
                document.getElementById('totalUsers').textContent = stats.total_users ?? 0;
                document.getElementById('totalBalance').textContent = 'GHS ' + (parseFloat(stats.total_balance || 0).toFixed(2));
                document.getElementById('pendingWithdrawals').textContent = stats.pending_withdrawals ?? 0;
                document.getElementById('bannedUsers').textContent = stats.banned_users ?? 0;
            } catch(e) {
                console.error(e);
            }
        }
        
        async function loadUsers() {
            document.getElementById('usersSection').classList.remove('hidden');
            document.getElementById('withdrawalsSection').classList.add('hidden');
            const users = await apiCall('/admin/users');
            const list = document.getElementById('usersList');
            list.innerHTML = (users.data || []).map(u => `
                <div class="bg-card p-3 rounded-xl border border-card flex justify-between items-center">
                    <div>
                        <div class="font-medium">${u.display_name || 'N/A'}</div>
                        <div class="text-white/60 text-xs">${u.phone}</div>
                        <div class="text-xs">Balance: GHS ${parseFloat(u.balance || 0).toFixed(2)}</div>
                    </div>
                    <div class="flex gap-1">
                        ${u.is_banned ? 
                            `<button onclick="unbanUser('${u.id}')" class="bg-green-600 px-2 py-1 rounded text-xs">Unban</button>` :
                            `<button onclick="banUser('${u.id}')" class="bg-red-600 px-2 py-1 rounded text-xs">Ban</button>`
                        }
                    </div>
                </div>
            `).join('') || '<p class="text-white/60">No users found.</p>';
        }
        
        async function loadWithdrawals() {
            document.getElementById('withdrawalsSection').classList.remove('hidden');
            document.getElementById('usersSection').classList.add('hidden');
            const withdrawals = await apiCall('/admin/withdrawals');
            const list = document.getElementById('withdrawalsList');
            list.innerHTML = (withdrawals.data || []).map(w => `
                <div class="bg-card p-3 rounded-xl border border-card">
                    <div class="flex justify-between">
                        <div>
                            <div class="font-medium">${w.user?.phone || 'N/A'}</div>
                            <div class="text-white/60 text-xs">${w.bank_name} - ${w.account_number}</div>
                            <div class="text-sm font-bold">GHS ${parseFloat(w.amount || 0).toFixed(2)}</div>
                        </div>
                        <div class="flex gap-1">
                            <button onclick="approveWithdrawal('${w.id}')" class="bg-green-600 px-2 py-1 rounded text-xs">Approve</button>
                            <button onclick="rejectWithdrawal('${w.id}')" class="bg-red-600 px-2 py-1 rounded text-xs">Reject</button>
                        </div>
                    </div>
                </div>
            `).join('') || '<p class="text-white/60">No pending withdrawals.</p>';
        }
        
        async function banUser(id) {
            if(!confirm('Ban this user?')) return;
            await apiCall('/admin/users/' + id + '/ban', {method: 'POST'});
            loadUsers();
        }
        
        async function unbanUser(id) {
            if(!confirm('Unban this user?')) return;
            await apiCall('/admin/users/' + id + '/unban', {method: 'POST'});
            loadUsers();
        }
        
        async function approveWithdrawal(id) {
            if(!confirm('Approve this withdrawal?')) return;
            await apiCall('/admin/withdrawals/' + id + '/approve', {method: 'POST'});
            loadWithdrawals();
            loadStats();
        }
        
        async function rejectWithdrawal(id) {
            if(!confirm('Reject this withdrawal?')) return;
            await apiCall('/admin/withdrawals/' + id + '/reject', {method: 'POST'});
            loadWithdrawals();
            loadStats();
        }
        
        function logout() {
            localStorage.removeItem('admin_token');
            window.location.href = '/admin';
        }
        
        loadStats();
    </script>
</body>
</html>