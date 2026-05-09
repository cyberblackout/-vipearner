<!DOCTYPE html>
<html lang="en-GH">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#1D4ED8">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>Page Not Found - VIP Earner GH</title>
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
        .orb-1 { width: 400px; height: 400px; background: #F59E0B; top: -100px; left: -100px; animation: orbFloat 8s ease-in-out infinite; }
        .orb-2 { width: 300px; height: 300px; background: #2563EB; bottom: -80px; right: -80px; animation: orbFloat 10s ease-in-out infinite reverse; }
        .orb-3 { width: 200px; height: 200px; background: #06B6D4; top: 40%; right: 10%; animation: orbFloat 6s ease-in-out infinite 2s; }
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
            animation: bounce 3s ease-in-out infinite;
            position: relative;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
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
        .icon-links {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 32px;
        }
        .icon-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 20px 12px;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        .icon-link:hover {
            background: rgba(255, 255, 255, 0.12);
            transform: translateY(-3px);
        }
        .icon-link svg {
            width: 40px;
            height: 40px;
        }
        .icon-link span {
            font-size: 13px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.9);
        }
        .btn-home {
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
        .btn-home:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 16px 40px rgba(245, 158, 11, 0.5);
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
        .divider {
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, #F59E0B, #FBBF24);
            border-radius: 2px;
            margin: 0 auto 24px;
            opacity: 0.6;
        }
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
        @media (max-width: 480px) {
            .card { padding: 36px 24px; border-radius: 24px; }
            .error-code { font-size: 80px; }
            .error-title { font-size: 26px; }
            .logo-wrapper { width: 100px; height: 100px; border-radius: 24px; }
            .logo-icon { width: 52px; height: 52px; }
            .icon-links { grid-template-columns: 1fr; }
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
                    <circle cx="50" cy="50" r="40" stroke="rgba(15,23,42,0.3)" stroke-width="4"/>
                    <line x1="35" y1="35" x2="65" y2="65" stroke="#0F172A" stroke-width="6" stroke-linecap="round"/>
                    <line x1="65" y1="35" x2="35" y2="65" stroke="#0F172A" stroke-width="6" stroke-linecap="round"/>
                    <line x1="50" y1="20" x2="50" y2="80" stroke="rgba(15,23,42,0.1)" stroke-width="3" stroke-dasharray="4 4"/>
                    <line x1="20" y1="50" x2="80" y2="50" stroke="rgba(15,23,42,0.1)" stroke-width="3" stroke-dasharray="4 4"/>
                </svg>
            </div>

            <h1 class="error-code">404</h1>
            <div class="divider"></div>
            <h2 class="error-title">Page Not Found</h2>
            <p class="error-message">
                Oops! The page you're looking for doesn't exist or has been moved. It might have been deleted, the URL changed, or you may have typed the address incorrectly. Let's get you back on track!
            </p>

            <div class="icon-links">
                <a href="/" class="icon-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <span>Go to Home</span>
                </a>
                <a href="/messages" class="icon-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>Contact Support</span>
                </a>
            </div>

            <a href="/" class="btn-home">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Back to Home
            </a>

            <p class="footer-text">
                Still can't find what you need?<br>
                Email us at <a href="mailto:support@vipearnergh.com">support@vipearnergh.com</a>
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
        })();
    </script>
</body>
</html>
