-- Migration: 20260922000002_add_payout_functions.sql
-- Description: Adds secure server-side functions for public verified withdrawal activity and user withdrawal history

-- 1. Public Verified Payout Activity (Fully Sanitized & Masked)
CREATE OR REPLACE FUNCTION public.get_public_recent_payouts(limit_count int DEFAULT 20)
RETURNS TABLE (
  id uuid,
  masked_name text,
  masked_phone text,
  amount numeric,
  channel text,
  network text,
  status text,
  created_at timestamptz,
  reviewed_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    w.id,
    CASE 
      WHEN p.display_name IS NOT NULL AND length(trim(p.display_name)) > 0 THEN
        CASE 
          WHEN position(' ' in trim(p.display_name)) > 0 THEN
            split_part(trim(p.display_name), ' ', 1) || ' ' || left(split_part(trim(p.display_name), ' ', 2), 1) || '.'
          ELSE
            left(trim(p.display_name), 2) || '***'
        END
      ELSE 'Member'
    END AS masked_name,
    CASE 
      WHEN p.phone IS NOT NULL AND length(p.phone) >= 10 THEN
        left(p.phone, 3) || '****' || right(p.phone, 3)
      ELSE '024****000'
    END AS masked_phone,
    w.amount,
    w.channel::text,
    COALESCE(w.details->>'network', w.details->>'bank_name', 'Mobile Money') AS network,
    w.status::text,
    w.created_at,
    w.reviewed_at
  FROM public.withdrawals w
  JOIN public.profiles p ON w.user_id = p.id
  WHERE w.status IN ('approved', 'pending')
  ORDER BY w.created_at DESC
  LIMIT limit_count;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_recent_payouts(int) TO anon, authenticated, service_role;

-- 2. User Personal Withdrawal History
CREATE OR REPLACE FUNCTION public.get_my_withdrawals(limit_count int DEFAULT 20)
RETURNS TABLE (
  id uuid,
  amount numeric,
  channel text,
  details jsonb,
  status text,
  admin_note text,
  reviewed_at timestamptz,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    w.id,
    w.amount,
    w.channel::text,
    w.details,
    w.status::text,
    w.admin_note,
    w.reviewed_at,
    w.created_at
  FROM public.withdrawals w
  WHERE w.user_id = auth.uid()
  ORDER BY w.created_at DESC
  LIMIT limit_count;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_withdrawals(int) TO authenticated, service_role;
