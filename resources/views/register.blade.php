<!DOCTYPE html>
<html lang="en-GH">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#1D4ED8">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>{{ config('app.name') }} - Register</title>
    <link rel="manifest" href="/manifest.json">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-bg">
    <div class="auth-container" style="padding-top: 0;">
        <!-- Top Blue Card -->
        <div style="background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #06B6D4 100%); border-radius: 24px; padding: 32px 24px; margin-bottom: -20px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -30px; left: -30px; width: 80px; height: 80px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
            
            <div style="position: relative; z-index: 1;">
                <div style="width: 72px; height: 72px; background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 8px 24px rgba(245, 158, 11, 0.5);">
                    <span style="font-size: 36px;">💰</span>
                </div>
                <h1 class="text-2xl font-display font-bold" style="color: white;">VIP Earner GH</h1>
                <p class="text-sm" style="color: rgba(255,255,255,0.8); margin-top: 4px;">Join and start earning</p>
            </div>
        </div>

        <!-- Register Card -->
        <div class="auth-card" style="position: relative; z-index: 2;">
            <h2 class="text-xl font-bold mb-1" style="color: #0F172A;">Create Account</h2>
            <p class="text-sm mb-6" style="color: #6B7280;">Fill in your details to get started</p>
            
            <div x-data="registerFlow()">
                <div>
                    <label class="block text-sm font-semibold mb-2" style="color: #374151;">Display Name</label>
                    <input type="text" x-model="displayName" placeholder="Your name" 
                        style="width: 100%; padding: 14px 16px; border: 2px solid #E5E7EB; border-radius: 12px; font-size: 16px; background: #F9FAFB; margin-bottom: 16px; box-sizing: border-box;">
                    
                    <label class="block text-sm font-semibold mb-2" style="color: #374151;">Phone Number</label>
                    <input type="tel" x-model="phone" placeholder="+233 123 456 789" 
                        style="width: 100%; padding: 14px 16px; border: 2px solid #E5E7EB; border-radius: 12px; font-size: 16px; background: #F9FAFB; margin-bottom: 16px; box-sizing: border-box;">
                    
                    <label class="block text-sm font-semibold mb-2" style="color: #374151;">Password</label>
                    <input type="password" x-model="password" placeholder="Create password" 
                        style="width: 100%; padding: 14px 16px; border: 2px solid #E5E7EB; border-radius: 12px; font-size: 16px; background: #F9FAFB; margin-bottom: 16px; box-sizing: border-box;">
                    
                    <label class="block text-sm font-semibold mb-2" style="color: #374151;">Confirm Password</label>
                    <input type="password" x-model="confirmPassword" placeholder="Confirm password" 
                        style="width: 100%; padding: 14px 16px; border: 2px solid #E5E7EB; border-radius: 12px; font-size: 16px; background: #F9FAFB; margin-bottom: 16px; box-sizing: border-box;">
                    
                    <label class="block text-sm font-semibold mb-2" style="color: #374151;">Referral Code (Optional)</label>
                    <input type="text" x-model="referrerCode" placeholder="Enter referral code" 
                        style="width: 100%; padding: 14px 16px; border: 2px solid #E5E7EB; border-radius: 12px; font-size: 16px; background: #F9FAFB; margin-bottom: 24px; box-sizing: border-box;">
                    
                    <button @click="register" 
                        style="width: 100%; padding: 16px; background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%); color: white; font-weight: 600; font-size: 16px; border: none; border-radius: 12px; cursor: pointer;">
                        <span x-show="!loading">Create Account</span>
                        <span x-show="loading">Creating...</span>
                    </button>
                    <p x-show="error" x-text="error" class="text-sm mt-3" style="color: #DC2626; text-align: center;"></p>
                </div>
            </div>
        </div>

        <div class="text-center mt-6" style="color: #6B7280;">
            Already have an account? 
            <a href="/auth" class="auth-footer-link">Login</a>
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
        function registerFlow() {
            return {
                phone: '',
                password: '',
                confirmPassword: '',
                displayName: '',
                referrerCode: '',
                loading: false,
                error: '',

                async register() {
                    if (!this.phone || !this.password || !this.displayName) {
                        this.error = 'Please fill all required fields';
                        return;
                    }
                    if (this.password !== this.confirmPassword) {
                        this.error = 'Passwords do not match';
                        return;
                    }
                    this.loading = true;
                    this.error = '';

                    try {
                        await api.post('/api/auth/register', {
                            phone: this.phone,
                            password: this.password,
                            display_name: this.displayName,
                            referrer_code: this.referrerCode
                        });
                        const res = await api.post('/api/auth/login', {
                            phone: this.phone,
                            password: this.password
                        });
                        localStorage.setItem('token', res.token);
                        window.location.href = '/';
                    } catch (e) {
                        this.error = e.response?.data?.error || 'Registration failed';
                    } finally {
                        this.loading = false;
                    }
                }
            }
        }
    </script>
</body>
</html>