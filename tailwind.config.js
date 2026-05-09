/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./resources/**/*.{js,ts,jsx,tsx,blade.php,blade,html}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#1D4ED8',
                'primary-dark': '#1E3A8A',
                surface: '#FFFFFF',
                'bg': '#EFF6FF',
                success: '#059669',
                danger: '#DC2626',
                warning: '#D97706',
                gold: '#F59E0B',
                muted: '#64748B',
                text: '#0F172A',
            },
            fontFamily: {
                display: ['"Plus Jakarta Sans"', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            boxShadow: {
                'card': '0 4px 24px rgba(30,64,175,0.08)',
                'glow': '0 0 20px rgba(37,99,235,0.30)',
                'float': '0 8px 32px rgba(30,64,175,0.20)',
            },
            backgroundImage: {
                'header-gradient': 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #06B6D4 100%)',
                'gold-gradient': 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                'success-gradient': 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            },
        },
    },
    plugins: [],
};