-- ========================================================================
-- VIP EARNER GH - Add Payment Addresses Table & Fund PIN
-- Migration: 20261119000002_add_payment_addresses_and_fund_pin.sql
-- ========================================================================

-- 1. Add fund_pin_hash to profiles for secure server-side Fund PIN validation
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS fund_pin_hash text;

-- 2. Create persistent table for saved Mobile Money payment addresses
CREATE TABLE IF NOT EXISTS public.payment_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  network varchar(20) NOT NULL CHECK (network IN ('MTN', 'Telecel', 'AirtelTigo')),
  account_number varchar(20) NOT NULL,
  account_name varchar(100) NOT NULL,
  remark varchar(100),
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_payment_addresses_user_id ON public.payment_addresses(user_id);

-- Enable RLS
ALTER TABLE public.payment_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own payment addresses" ON public.payment_addresses;
CREATE POLICY "Users can view own payment addresses"
  ON public.payment_addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own payment addresses" ON public.payment_addresses;
CREATE POLICY "Users can insert own payment addresses"
  ON public.payment_addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own payment addresses" ON public.payment_addresses;
CREATE POLICY "Users can update own payment addresses"
  ON public.payment_addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own payment addresses" ON public.payment_addresses;
CREATE POLICY "Users can delete own payment addresses"
  ON public.payment_addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Track migration in schema_migrations
INSERT INTO supabase_migrations.schema_migrations (version, statements)
VALUES ('20261119000002', ARRAY['Add payment_addresses table and fund_pin_hash to profiles'])
ON CONFLICT (version) DO NOTHING;
