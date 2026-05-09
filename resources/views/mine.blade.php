@extends('layouts.app')

@section('content')
<div class="p-4">
    <!-- Quick Stats -->
    <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="bg-white rounded-xl p-4 shadow-card">
            <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">💰</span>
                <span class="text-xs text-muted">Total Income</span>
            </div>
            <div class="font-mono text-xl font-bold text-success">GHS {{ number_format(Auth::user()?->total_income ?? 0, 2) }}</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-card">
            <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">📈</span>
                <span class="text-xs text-muted">Total Profit</span>
            </div>
            <div class="font-mono text-xl font-bold text-success">GHS {{ number_format(Auth::user()?->total_profit ?? 0, 2) }}</div>
        </div>
    </div>

    <!-- Action Buttons Grid -->
    <div class="grid grid-cols-4 gap-2 mb-4">
        <a href="/deposit" class="action-btn">
            <div class="action-btn-icon bg-success">💳</div>
            <span class="text-xs mt-1">Deposit</span>
        </a>
        <a href="/withdraw" class="action-btn">
            <div class="action-btn-icon bg-primary">💸</div>
            <span class="text-xs mt-1">Withdraw</span>
        </a>
        <a href="/referral" class="action-btn">
            <div class="action-btn-icon bg-gold">👥</div>
            <span class="text-xs mt-1">Invite</span>
        </a>
        <button class="action-btn" onclick="checkin()">
            <div class="action-btn-icon bg-success">✅</div>
            <span class="text-xs mt-1">Check-in</span>
        </button>
    </div>

    <!-- Action Cards Grid -->
    <div class="grid grid-cols-2 gap-3 mb-24">
        <a href="/mine/financials" class="app-card">
            <div class="app-card-icon">💰</div>
            <div class="app-card-content">
                <span class="font-semibold">Financials</span>
                <p class="text-xs text-muted">Income, deposits & withdrawals</p>
            </div>
        </a>

        <a href="/mine/team" class="app-card">
            <div class="app-card-icon">👥</div>
            <div class="app-card-content">
                <span class="font-semibold">My Team</span>
                <p class="text-xs text-muted">Referrals & earnings</p>
            </div>
        </a>

        <a href="/deposit" class="app-card">
            <div class="app-card-icon">💳</div>
            <div class="app-card-content">
                <span class="font-semibold">Deposit</span>
                <p class="text-xs text-muted">Add funds to your wallet</p>
            </div>
        </a>

        <a href="/withdraw" class="app-card">
            <div class="app-card-icon">💸</div>
            <div class="app-card-content">
                <span class="font-semibold">Withdraw</span>
                <p class="text-xs text-muted">Transfer to mobile money</p>
            </div>
        </a>

        <a href="/referral" class="app-card">
            <div class="app-card-icon">🎁</div>
            <div class="app-card-content">
                <span class="font-semibold">Referral</span>
                <p class="text-xs text-muted">Invite friends & earn bonus</p>
            </div>
        </a>

        <button class="app-card" onclick="checkin()">
            <div class="app-card-icon">📅</div>
            <div class="app-card-content">
                <span class="font-semibold">Daily Check-in</span>
                <p class="text-xs text-muted">Earn rewards daily</p>
            </div>
        </button>

        <a href="/lucky-bag" class="app-card">
            <div class="app-card-icon">🎁</div>
            <div class="app-card-content">
                <span class="font-semibold">Lucky Bag</span>
                <p class="text-xs text-muted">Win up to GHS 1.00 daily</p>
            </div>
        </a>

        <button class="app-card logout-card" onclick="logout()">
            <div class="app-card-icon">🚪</div>
            <div class="app-card-content">
                <span class="font-semibold text-danger">Logout</span>
                <p class="text-xs text-muted">Sign out of your account</p>
            </div>
        </button>

        <a href="#" class="app-card">
            <div class="app-card-icon">📜</div>
            <div class="app-card-content">
                <span class="font-semibold">Business Licence</span>
                <p class="text-xs text-muted">View business license</p>
            </div>
        </a>

        <a href="#" class="app-card">
            <div class="app-card-icon">🔒</div>
            <div class="app-card-content">
                <span class="font-semibold">Account Security</span>
                <p class="text-xs text-muted">Security settings</p>
            </div>
        </a>

        <a href="#" class="app-card">
            <div class="app-card-icon">📄</div>
            <div class="app-card-content">
                <span class="font-semibold">Privacy Policy</span>
                <p class="text-xs text-muted">How we protect data</p>
            </div>
        </a>

        <a href="#" class="app-card">
            <div class="app-card-icon">📝</div>
            <div class="app-card-content">
                <span class="font-semibold">Electronic Contract</span>
                <p class="text-xs text-muted">E-signature terms</p>
            </div>
        </a>
    </div>
</div>

<script>
    function logout() {
        if(confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            window.location.href = '/';
        }
    }

    async function checkin() {
        try {
            const res = await api.post('/api/checkin');
            alert('Check-in successful! You earned GHS ' + res.data?.reward);
        } catch (e) {
            alert(e.response?.data?.error || 'Check-in failed');
        }
    }
</script>
@endsection