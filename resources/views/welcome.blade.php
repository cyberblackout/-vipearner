<!DOCTYPE html>
<html lang="en-GH">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#1D4ED8">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>VIP Earner GH - Earn GHS by Completing Tasks</title>
    <link rel="manifest" href="/manifest.json">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; min-height: 100vh; background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 40%, #EFF6FF 40%); }
        .container { max-width: 480px; margin: 0 auto; padding: 24px; }
        .hero-section { text-align: center; padding: 60px 24px 40px; }
        .hero-logo { width: 100px; height: 100px; background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #FCD34D 100%); border-radius: 28px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; box-shadow: 0 12px 40px rgba(245, 158, 11, 0.4); animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .hero-logo span { font-size: 52px; }
        .hero-title { font-size: 32px; font-weight: 800; color: white; font-family: 'Plus Jakarta Sans', sans-serif; margin-bottom: 8px; }
        .hero-subtitle { font-size: 16px; color: rgba(255,255,255,0.8); margin-bottom: 32px; }
        .hero-buttons { display: flex; flex-direction: column; gap: 12px; }
        .btn-primary { display: block; width: 100%; padding: 16px; background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%); color: #0F172A; font-weight: 700; font-size: 16px; border: none; border-radius: 14px; text-align: center; text-decoration: none; box-shadow: 0 8px 30px rgba(245, 158, 11, 0.4); transition: all 0.2s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(245, 158, 11, 0.5); }
        .btn-secondary { display: block; width: 100%; padding: 16px; background: rgba(255,255,255,0.15); color: white; font-weight: 600; font-size: 16px; border: 2px solid rgba(255,255,255,0.3); border-radius: 14px; text-align: center; text-decoration: none; backdrop-filter: blur(10px); transition: all 0.2s; }
        .btn-secondary:hover { background: rgba(255,255,255,0.25); }
        .features-section { padding: 32px 24px; }
        .section-title { font-size: 20px; font-weight: 700; color: #0F172A; margin-bottom: 20px; text-align: center; }
        .feature-card { background: white; border-radius: 16px; padding: 20px; margin-bottom: 12px; box-shadow: 0 4px 24px rgba(30,64,175,0.08); display: flex; align-items: center; gap: 16px; }
        .feature-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }
        .feature-icon.gold { background: rgba(245, 158, 11, 0.12); }
        .feature-icon.blue { background: rgba(37, 99, 235, 0.12); }
        .feature-icon.green { background: rgba(5, 150, 105, 0.12); }
        .feature-title { font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 4px; }
        .feature-desc { font-size: 13px; color: #64748B; line-height: 1.5; }
        .stats-section { padding: 0 24px 32px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .stat-box { background: white; border-radius: 16px; padding: 16px 8px; text-align: center; box-shadow: 0 4px 24px rgba(30,64,175,0.08); }
        .stat-value { font-size: 22px; font-weight: 800; color: #0F172A; font-family: 'JetBrains Mono', monospace; }
        .stat-label { font-size: 11px; color: #64748B; margin-top: 4px; }
        .cta-section { padding: 0 24px 48px; text-align: center; }
        .cta-title { font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 12px; }
        .cta-text { font-size: 14px; color: #64748B; margin-bottom: 16px; line-height: 1.6; }
        .trust-badges { display: flex; justify-content: center; gap: 16px; margin-top: 24px; }
        .trust-badge { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748B; }
        .trust-badge svg { width: 16px; height: 16px; }
        .footer { padding: 24px; text-align: center; border-top: 1px solid #f3f4f6; }
        .footer-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 16px; margin-bottom: 12px; }
        .footer-links a { font-size: 12px; color: #64748B; text-decoration: none; }
        .footer-links a:hover { color: #1D4ED8; }
        .footer-copy { font-size: 11px; color: #94a3b8; }
        .app-section { background: white; border-radius: 24px 24px 0 0; padding: 40px 24px; box-shadow: 0 -8px 40px rgba(30, 64, 175, 0.1); }
        .trust-card { background: #EFF6FF; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center; }
        .trust-card-icon { font-size: 40px; margin-bottom: 8px; }
        .trust-card-title { font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 4px; }
        .trust-card-text { font-size: 13px; color: #64748B; }
    </style>
</head>
<body>
    <div class="container">
        <section class="hero-section">
            <div class="hero-logo">
                <span>💰</span>
            </div>
            <h1 class="hero-title">VIP Earner GH</h1>
            <p class="hero-subtitle">Earn GHS by completing simple social media tasks. Withdraw directly to your Mobile Money account.</p>
            <div class="hero-buttons">
                <a href="/register" class="btn-primary">Get Started Free</a>
                <a href="/auth" class="btn-secondary">I Already Have an Account</a>
            </div>
        </section>

        <div class="stats-section">
            <div class="stat-box">
                <div class="stat-value">10K+</div>
                <div class="stat-label">Active Users</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">GHS 50K+</div>
                <div class="stat-label">Paid Out</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">4.8★</div>
                <div class="stat-label">Rating</div>
            </div>
        </div>

        <section class="features-section">
            <h2 class="section-title">How It Works</h2>

            <div class="feature-card">
                <div class="feature-icon gold">📱</div>
                <div>
                    <div class="feature-title">Create Free Account</div>
                    <div class="feature-desc">Register with your Ghana phone number. No deposit required to start.</div>
                </div>
            </div>

            <div class="feature-card">
                <div class="feature-icon blue">📋</div>
                <div>
                    <div class="feature-title">Complete Tasks</div>
                    <div class="feature-desc">Like, share, and comment on Facebook posts to earn GHS rewards instantly.</div>
                </div>
            </div>

            <div class="feature-card">
                <div class="feature-icon green">💸</div>
                <div>
                    <div class="feature-title">Withdraw to MoMo</div>
                    <div class="feature-desc">Cash out your earnings directly to MTN, Vodafone, or AirtelTigo Mobile Money.</div>
                </div>
            </div>

            <div class="feature-card">
                <div class="feature-icon gold">⭐</div>
                <div>
                    <div class="feature-title">Upgrade Your VIP</div>
                    <div class="feature-desc">Higher VIP levels = more tasks and better rewards per task.</div>
                </div>
            </div>

            <div class="feature-card">
                <div class="feature-icon blue">👥</div>
                <div>
                    <div class="feature-title">Invite & Earn</div>
                    <div class="feature-desc">Share your referral code with friends and earn bonus GHS for every active referral.</div>
                </div>
            </div>
        </section>

        <section class="cta-section">
            <div class="cta-title">Ready to Start Earning?</div>
            <p class="cta-text">Join thousands of Ghanaians earning extra income from their phones. Free to join, no hidden fees.</p>
            <a href="/register" class="btn-primary">Create Free Account</a>
            <div class="trust-badges">
                <div class="trust-badge">
                    <svg fill="none" stroke="#059669" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    Secure Platform
                </div>
                <div class="trust-badge">
                    <svg fill="none" stroke="#059669" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Instant Payouts
                </div>
                <div class="trust-badge">
                    <svg fill="none" stroke="#059669" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    MoMo Support
                </div>
            </div>
        </section>
    </div>

    <div class="app-section">
        <div class="trust-card">
            <div class="trust-card-icon">🏆</div>
            <div class="trust-card-title">Trusted by Over 10,000 Members</div>
            <div class="trust-card-text">Join Ghana's fastest growing task-based earning platform</div>
        </div>

        <a href="/register" class="btn-primary">Join VIP Earner GH — It's Free</a>

        <div class="footer">
            <div class="footer-links">
                <a href="#">Terms of Service</a>
                <a href="#">Privacy Policy</a>
                <a href="#">Business Licence</a>
                <a href="#">Account Security</a>
                <a href="#">Contact Support</a>
            </div>
            <div class="footer-copy">© 2025 VIP Earner GH. All rights reserved.</div>
        </div>
    </div>
</body>
</html>
