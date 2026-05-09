<!DOCTYPE html>
<html lang="en-GH">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#1D4ED8">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>{{ config('app.name') }} - Login</title>
    <link rel="manifest" href="/manifest.json">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-bg">
    <div class="auth-container">
        <!-- Top Blue Card -->
        <div style="background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #06B6D4 100%); border-radius: 24px; padding: 32px 24px; margin-bottom: -20px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -30px; left: -30px; width: 80px; height: 80px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
            
            <div style="position: relative; z-index: 1;">
                <div class="auth-logo" style="width: 72px; height: 72px; background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 8px 24px rgba(245, 158, 11, 0.5);">
                    <span style="font-size: 36px;">💰</span>
                </div>
                <h1 class="text-2xl font-display font-bold" style="color: white;">VIP Earner GH</h1>
                <p class="text-sm" style="color: rgba(255,255,255,0.8); margin-top: 4px;">Earn GHS by completing tasks</p>
            </div>
        </div>

        <!-- Login Card -->
        <div class="auth-card" style="position: relative; z-index: 2;">
            <h2 class="text-xl font-bold mb-1" style="color: #0F172A;">Welcome Back</h2>
            <p class="text-sm mb-6" style="color: #6B7280;">Login to continue earning</p>
            
            <div x-data="authFlow()">
                <div>
                    <label class="block text-sm font-semibold mb-2" style="color: #374151;">Phone Number</label>
                    <input type="tel" x-model="phone" placeholder="+233 123 456 789" 
                        class="input" 
                        style="width: 100%; padding: 14px 16px; border: 2px solid #E5E7EB; border-radius: 12px; font-size: 16px; background: #F9FAFB; margin-bottom: 16px;">
                    
                    <label class="block text-sm font-semibold mb-2" style="color: #374151;">Password</label>
                    <input type="password" x-model="password" placeholder="Enter your password" 
                        class="input" 
                        style="width: 100%; padding: 14px 16px; border: 2px solid #E5E7EB; border-radius: 12px; font-size: 16px; background: #F9FAFB; margin-bottom: 16px;">
                    
                    <div class="flex items-center justify-between mb-6">
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" x-model="remember" 
                                style="width: 18px; height: 18px; accent-color: #1D4ED8; margin-right: 8px;">
                            <span class="text-sm" style="color: #6B7280;">Remember me</span>
                        </label>
                        <a href="#" class="text-sm" style="color: #1D4ED8; font-weight: 500;">Forgot password?</a>
                    </div>
                    
                    <button @click="login" 
                        style="width: 100%; padding: 16px; background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%); color: white; font-weight: 600; font-size: 16px; border: none; border-radius: 12px; cursor: pointer;">
                        <span x-show="!loading">Login</span>
                        <span x-show="loading">Logging in...</span>
                    </button>
                    <p x-show="error" x-text="error" class="text-sm mt-3" style="color: #DC2626; text-align: center;"></p>
                </div>
            </div>
        </div>

        <div class="text-center mt-6" style="color: #6B7280;">
            Don't have an account? 
            <a href="/register" class="auth-footer-link">Register</a>
        </div>

        <!-- Legal Links -->
        <div class="text-center mt-6" style="padding: 0 16px;">
            <p class="text-xs" style="color: #9CA3AF; line-height: 1.8;">
                By continuing, you agree to our 
                <a href="#" class="font-semibold" style="color: #1D4ED8;">Terms of Service</a> and 
                <a href="#" class="font-semibold" style="color: #1D4ED8;">Privacy Policy</a>
            </p>
            <div class="flex flex-wrap justify-center gap-3 mt-4" style="gap: 12px; flex-wrap: wrap;">
                <a href="#" class="text-xs" style="color: #6B7280; text-decoration: none;">Business Licence</a>
                <span style="color: #D1D5DB;">|</span>
                <a href="#" class="text-xs" style="color: #6B7280; text-decoration: none;">Account Security</a>
                <span style="color: #D1D5DB;">|</span>
                <a href="#" class="text-xs" style="color: #6B7280; text-decoration: none;">Privacy Policy</a>
                <span style="color: #D1D5DB;">|</span>
                <a href="#" class="text-xs" style="color: #6B7280; text-decoration: none;">Electronic Contract</a>
                <span style="color: #D1D5DB;">|</span>
                <a href="#" class="text-xs" style="color: #6B7280; text-decoration: none;">App Download</a>
                <span style="color: #D1D5DB;">|</span>
                <a href="#" class="text-xs" style="color: #6B7280; text-decoration: none;">Employee Benefits</a>
                <span style="color: #D1D5DB;">|</span>
                <a href="#" class="text-xs" style="color: #6B7280; text-decoration: none;">User Manual</a>
                <span style="color: #D1D5DB;">|</span>
                <a href="#" class="text-xs" style="color: #6B7280; text-decoration: none;">Promotional Brochure</a>
            </div>
        </div>
    </div>

    <script>
        function authFlow() {
            return {
                phone: '',
                password: '',
                remember: false,
                loading: false,
                error: '',

                init() {
                    const savedRemember = localStorage.getItem('remember_me');
                    const savedPhone = localStorage.getItem('remember_phone');
                    const savedPass = localStorage.getItem('remember_password');
                    if (savedRemember === 'true' && savedPhone && savedPass) {
                        this.phone = savedPhone;
                        this.password = savedPass;
                        this.remember = true;
                        this.login();
                    }
                },

                async login() {
                    if (!this.phone || !this.password) return;
                    this.loading = true;
                    this.error = '';

                    try {
                        const res = await api.post('/api/auth/login', {
                            phone: this.phone,
                            password: this.password
                        });

                        if (this.remember) {
                            localStorage.setItem('remember_phone', this.phone);
                            localStorage.setItem('remember_password', this.password);
                            localStorage.setItem('remember_me', 'true');
                        } else {
                            localStorage.removeItem('remember_phone');
                            localStorage.removeItem('remember_password');
                            localStorage.removeItem('remember_me');
                        }

                        localStorage.setItem('token', res.token);
                        window.location.href = '/';
                    } catch (e) {
                        this.error = e.response?.data?.error || 'Invalid phone or password';
                    } finally {
                        this.loading = false;
                    }
                }
            }
        }
    </script>
</body>
</html>