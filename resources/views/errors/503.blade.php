<!DOCTYPE html>
<html lang="en-GH">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#1D4ED8">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>Under Maintenance - VIP Earner GH</title>
    <link rel="manifest" href="/manifest.json">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        .bg-wrapper {
            position: fixed;
            inset: 0;
            background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 30%, #1E40AF 50%, #0369A1 70%, #0E7490 100%);
            background-size: 400% 400%;
            animation: gradientShift 10s ease infinite;
        }
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(60px);
            opacity: 0.4;
        }
        .orb-1 { width: 400px; height: 400px; background: #F59E0B; top: -100px; right: -100px; animation: orbFloat 8s ease-in-out infinite; }
        .orb-2 { width: 300px; height: 300px; background: #2563EB; bottom: -80px; left: -80px; animation: orbFloat 10s ease-in-out infinite reverse; }
        .orb-3 { width: 200px; height: 200px; background: #06B6D4; top: 40%; left: 10%; animation: orbFloat 6s ease-in-out infinite 2s; }
        @keyframes orbFloat {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -30px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .container {
            position: relative;
            z-index: 10;
            max-width: 480px;
            width: 100%;
            padding: 20px;
            animation: slideUp 0.8s ease-out;
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(60px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .card {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(30px);
            -webkit-backdrop-filter: blur(30px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 32px;
            padding: 48px 32px;
            text-align: center;
        }
        .logo-wrapper {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #FCD34D 100%);
            border-radius: 28px;
            box-shadow: 0 20px 60px rgba(245, 158, 11, 0.5), inset 0 2px 0 rgba(255,255,255,0.3);
            margin-bottom: 32px;
            animation: floatLogo 4s ease-in-out infinite;
            position: relative;
        }
        .logo-wrapper::before {
            content: '';
            position: absolute;
            inset: -4px;
            border-radius: 32px;
            border: 2px solid rgba(245, 158, 11, 0.3);
            animation: pulseRing 2s ease-out infinite;
        }
        @keyframes floatLogo {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-12px) rotate(3deg); }
        }
        @keyframes pulseRing {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.3); opacity: 0; }
        }
        .logo-icon {
            width: 64px;
            height: 64px;
        }
        .error-code {
            font-size: 100px;
            font-weight: 900;
            line-height: 1;
            background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #FEF3C7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 4px 30px rgba(245, 158, 11, 0.3);
            margin-bottom: 8px;
            letter-spacing: -4px;
        }
        .error-title {
            font-size: 32px;
            font-weight: 700;
            color: #FFFFFF;
            margin-bottom: 16px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .error-message {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.75);
            line-height: 1.7;
            margin-bottom: 32px;
            max-width: 360px;
            margin-left: auto;
            margin-right: auto;
        }
        .info-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 32px;
        }
        .info-card {
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 16px 8px;
            transition: all 0.3s ease;
        }
        .info-card:hover {
            background: rgba(255, 255, 255, 0.12);
            transform: translateY(-2px);
        }
        .info-icon {
            width: 36px;
            height: 36px;
            margin: 0 auto 8px;
        }
        .info-text {
            font-size: 12px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.9);
        }
        .progress-section {
            margin-bottom: 32px;
        }
        .progress-label {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.5);
            margin-bottom: 10px;
            font-weight: 500;
        }
        .progress-track {
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .progress-fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #F59E0B, #FBBF24, #FCD34D, #F59E0B);
            background-size: 300% 100%;
            border-radius: 10px;
            animation: shimmer 2.5s linear infinite;
        }
        @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -100% 0; }
        }
        .btn-refresh {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
            color: #0F172A;
            font-size: 16px;
            font-weight: 700;
            padding: 16px 40px;
            border-radius: 16px;
            border: none;
            cursor: pointer;
            box-shadow: 0 8px 30px rgba(245, 158, 11, 0.4);
            transition: all 0.3s ease;
            text-decoration: none;
        }
        .btn-refresh:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 16px 40px rgba(245, 158, 11, 0.5);
        }
        .btn-refresh svg {
            width: 20px;
            height: 20px;
            animation: spinIcon 3s linear infinite;
        }
        @keyframes spinIcon {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .footer-text {
            margin-top: 24px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.4);
        }
        .footer-text a {
            color: #F59E0B;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s;
        }
        .footer-text a:hover { color: #FBBF24; }
        .stars {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 1;
        }
        .star {
            position: absolute;
            background: white;
            border-radius: 50%;
            animation: twinkle var(--duration, 2s) ease-in-out infinite;
        }
        @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
        }
        .divider {
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, #F59E0B, #FBBF24);
            border-radius: 2px;
            margin: 0 auto 24px;
            opacity: 0.6;
        }
        .brand-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(245, 158, 11, 0.15);
            border: 1px solid rgba(245, 158, 11, 0.25);
            border-radius: 100px;
            padding: 6px 14px;
            margin-bottom: 20px;
        }
        .brand-badge span {
            font-size: 12px;
            font-weight: 600;
            color: #FBBF24;
            letter-spacing: 0.5px;
        }
        @media (max-width: 480px) {
            .card { padding: 36px 24px; border-radius: 24px; }
            .error-code { font-size: 80px; }
            .error-title { font-size: 26px; }
            .info-cards { gap: 8px; }
            .info-card { padding: 12px 6px; border-radius: 16px; }
            .logo-wrapper { width: 100px; height: 100px; border-radius: 24px; }
            .logo-icon { width: 52px; height: 52px; }
        }
    </style>
</head>
<body>
    <div class="bg-wrapper">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
    </div>
    <div class="stars" id="stars"></div>

    <div class="container">
        <div class="card">
            <div class="brand-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <span>VIP EARNER GH</span>
            </div>

            <div class="logo-wrapper">
                <svg class="logo-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="44" stroke="rgba(15,23,42,0.3)" stroke-width="4" stroke-dasharray="10 5"/>
                    <circle cx="50" cy="50" r="30" stroke="rgba(15,23,42,0.4)" stroke-width="3" stroke-dasharray="6 3"/>
                    <circle cx="50" cy="50" r="18" fill="#0F172A" opacity="0.2"/>
                    <path d="M50 30 C50 30 38 45 38 55 C38 60 43 65 50 65 C57 65 62 60 62 55 C62 45 50 30 50 30Z" fill="#0F172A"/>
                    <text x="50" y="56" text-anchor="middle" font-size="18" font-weight="900" fill="#FBBF24">$</text>
                </svg>
            </div>

            <h1 class="error-code">503</h1>
            <div class="divider"></div>
            <h2 class="error-title">Under Maintenance</h2>
            <p class="error-message">
                We're currently performing scheduled maintenance and upgrades on our platform. Our technical team is working hard to bring you an improved and more secure experience. Thank you for your patience!
            </p>

            <div class="info-cards">
                <div class="info-card">
                    <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <div class="info-text">Coming Soon</div>
                </div>
                <div class="info-card">
                    <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                    </svg>
                    <div class="info-text">Better Rewards</div>
                </div>
                <div class="info-card">
                    <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="#FCD34D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <div class="info-text">More Secure</div>
                </div>
            </div>

            <div class="progress-section">
                <div class="progress-label">System Restoration Progress</div>
                <div class="progress-track">
                    <div class="progress-fill" id="progressBar"></div>
                </div>
            </div>

            <button class="btn-refresh" onclick="location.reload()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4v5h.582M20 20v-5h-.581M4.582 9A8.001 8.001 0 0111 4.5 8 8 0 0120 12.5 8 8 0 0111 20.5 8 8 0 015 20.5"/>
                </svg>
                Refresh Page
            </button>

            <p class="footer-text">
                Need immediate assistance?<br>
                Contact us at <a href="mailto:support@vipearnergh.com">support@vipearnergh.com</a>
            </p>
        </div>
    </div>

    <script>
        (function() {
            const starsContainer = document.getElementById('stars');
            for (let i = 0; i < 60; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.cssText = [
                    'left:' + (Math.random() * 100) + '%',
                    'top:' + (Math.random() * 100) + '%',
                    'width:' + (Math.random() * 3 + 1) + 'px',
                    'height:' + (Math.random() * 3 + 1) + 'px',
                    '--duration:' + (Math.random() * 2 + 1.5) + 's',
                    'animation-delay:' + (Math.random() * 3) + 's'
                ].join(';');
                starsContainer.appendChild(star);
            }
            let progress = 0;
            const progressBar = document.getElementById('progressBar');
            function animateProgress() {
                progress += 0.5;
                if (progress > 100) progress = 0;
                progressBar.style.width = progress + '%';
            }
            setInterval(animateProgress, 50);
        })();
    </script>
</body>
</html>
