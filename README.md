# VIP Earner GH

A mobile-first web application for earning rewards through completing tasks, built with Ionic 8, React 19, Capacitor, and Supabase.

## Tech Stack

- **Frontend:** Ionic 8 + React 19 + Capacitor 6
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions)
- **Build Tool:** Vite 5 + TypeScript 5
- **State Management:** Zustand + React Query
- **Styling:** Ionic CSS variables

## Features

- User authentication (phone + OTP)
- Daily tasks with rewards
- VIP tier system (6 levels)
- Deposits and withdrawals (Paystack integration)
- Referral system
- Lucky bag daily rewards
- Daily check-in streaks
- Admin dashboard

## Project Structure

```
├── frontend/               # Ionic/React/Capacitor app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── lib/            # Utilities and Supabase client
│   │   ├── pages/          # Page components (auth, main, financial, engagement, admin)
│   │   ├── stores/         # Zustand state stores
│   │   └── theme/          # Ionic theme variables
│   ├── capacitor.config.ts # Capacitor configuration
│   └── vite.config.ts      # Vite configuration
├── backend/                # Supabase Edge Functions + migrations
│   ├── functions/          # 30 Edge Functions (auth, tasks, payments, admin)
│   └── migrations/         # Database migrations
└── README.md
```

## Prerequisites

- Node.js 18+
- npm
- Supabase account
- Supabase CLI (for deploying Edge Functions)
- Paystack account (for payments)
- Termii account (for SMS/OTP)

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd vipearner-app
```

### 2. Set up the frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Configure `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set up the backend

1. Create a new Supabase project at https://supabase.com
2. Link your project:
   ```bash
   cd backend
   supabase link --project-ref your-project-ref
   ```
3. Run the migration:
   ```bash
   supabase db push
   ```
4. Set Edge Function secrets:
   ```bash
   supabase secrets set PAYSTACK_SECRET_KEY=sk_test_xxxx
   supabase secrets set PAYSTACK_WEBHOOK_SECRET=whsec_xxxx
   supabase secrets set TERMII_API_KEY=your_termii_api_key
   supabase secrets set TERMII_SENDER_ID=VIPEarner
   ```
5. Deploy Edge Functions:
   ```bash
   supabase functions deploy
   ```

## Development

### Frontend

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`

### Backend

```bash
cd backend
supabase functions serve
```

## Building for Production

### Web

```bash
cd frontend
npm run build
```

### Android

```bash
cd frontend
npm run cap:build:android
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions covering:
- Netlify / Vercel / static hosting
- Supabase Edge Functions
- Paystack webhook configuration

## License

MIT
