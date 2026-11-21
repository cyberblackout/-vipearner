# Deployment Guide - VIP Earner GH

## Architecture Overview

- **Frontend:** Ionic/React app (static files) in `frontend/`
- **Backend:** Supabase Edge Functions in `backend/functions/`
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth

## Prerequisites

- Supabase project created
- Supabase CLI installed
- Node.js 18+

## Step 1: Database Setup

1. Go to Supabase Dashboard -> SQL Editor
2. Run the migration file: `backend/migrations/20260711234737_init.sql`
3. Verify all 12 tables are created:
   - `vip_levels`, `profiles`, `tasks`, `task_sessions`, `task_logs`
   - `transactions`, `withdrawals`, `referrals`, `announcements`
   - `notifications`, `audit_log`, `otp_cache`

## Step 2: Edge Functions Deployment

### Install and authenticate Supabase CLI

```bash
npm install -g supabase
supabase login
```

### Link to your project

```bash
cd backend
supabase link --project-ref your-project-ref
```

### Deploy all functions

```bash
cd backend
supabase functions deploy
```

### Set Environment Secrets

```bash
supabase secrets set PAYSTACK_SECRET_KEY=sk_test_xxxx
supabase secrets set PAYSTACK_WEBHOOK_SECRET=whsec_xxxx
supabase secrets set TERMII_API_KEY=your_termii_api_key
supabase secrets set TERMII_SENDER_ID=VIPEarner
```

## Step 3: Frontend Build

### Set environment variables

Create `frontend/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Build for production

```bash
cd frontend
npm install
npm run build
```

The built files will be in `frontend/dist/`

## Step 4: Deploy Frontend

### Option A: Netlify

1. Connect your GitHub repository
2. Set base directory: `frontend`
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Deploy

### Option B: Vercel

1. Import repository
2. Set framework preset: Vite
3. Set root directory: `frontend`
4. Deploy

### Option C: Static Hosting (cPanel, AWS S3, etc.)

1. Upload contents of `frontend/dist/` to your hosting
2. Configure URL rewriting for SPA (all routes -> `index.html`)

## Step 5: Paystack Webhook Configuration

1. Go to Paystack Dashboard -> Settings -> Webhooks
2. Set webhook URL to:
   ```
   https://your-project.supabase.co/functions/v1/paystack-webhook
   ```
3. Select events:
   - `charge.success`
   - `transfer.success`
   - `transfer.failed`

## Step 6: pg_cron Setup (Scheduled Tasks)

In the Supabase SQL Editor, run:

```sql
-- Reset daily revenue at midnight UTC
SELECT cron.schedule('reset-daily-revenue', '0 0 * * *', 'SELECT reset_all_daily_revenue()');

-- Reset monthly revenue on 1st of month
SELECT cron.schedule('reset-monthly-revenue', '0 0 1 * *', 'SELECT reset_all_monthly_revenue()');
```

## Step 7: Domain & SSL

1. Configure custom domain on your hosting provider
2. Enable SSL/HTTPS
3. Update Supabase Edge Function URLs if needed

## Post-Deployment Checklist

- [ ] Supabase migration executed
- [ ] Edge Functions deployed
- [ ] pg_cron jobs configured
- [ ] Paystack webhook configured
- [ ] Secrets stored in Supabase
- [ ] Test user registration
- [ ] Test user login
- [ ] Test OTP verification
- [ ] Test task completion
- [ ] Test deposit flow
- [ ] Test withdrawal request
- [ ] Test VIP upgrade
- [ ] Test daily check-in
- [ ] Test lucky bag claim
- [ ] Test admin dashboard

## Rollback

If issues occur:

1. Check Supabase Edge Function logs in dashboard
2. Verify environment secrets are set correctly
3. Check browser console for frontend errors
4. Verify database migration ran successfully
