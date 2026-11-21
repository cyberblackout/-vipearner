-- Atomic balance increment function to prevent race conditions
CREATE OR REPLACE FUNCTION public.increment_balance(
  p_user_id uuid,
  p_amount numeric
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance numeric;
BEGIN
  UPDATE public.profiles
  SET balance = balance + p_amount,
      total_income = total_income + p_amount,
      daily_revenue = daily_revenue + p_amount,
      monthly_revenue = monthly_revenue + p_amount,
      total_profit = total_profit + p_amount
  WHERE id = p_user_id
  RETURNING balance INTO new_balance;

  RETURN new_balance;
END;
$$;

-- Atomic balance deduction function
CREATE OR REPLACE FUNCTION public.deduct_balance(
  p_user_id uuid,
  p_amount numeric
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance numeric;
BEGIN
  UPDATE public.profiles
  SET balance = balance - p_amount
  WHERE id = p_user_id AND balance >= p_amount
  RETURNING balance INTO new_balance;

  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  RETURN new_balance;
END;
$$;

-- Atomic work deposit increment function
CREATE OR REPLACE FUNCTION public.increment_work_deposit(
  p_user_id uuid,
  p_amount numeric
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance numeric;
BEGIN
  UPDATE public.profiles
  SET balance = balance + p_amount,
      work_deposit = work_deposit + p_amount
  WHERE id = p_user_id
  RETURNING balance INTO new_balance;

  RETURN new_balance;
END;
$$;

-- Grant execute to service_role only
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM authenticated;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;
GRANT EXECUTE ON FUNCTION public.increment_balance(uuid, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.deduct_balance(uuid, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_work_deposit(uuid, numeric) TO service_role;

-- Database aggregation functions for admin stats
CREATE OR REPLACE FUNCTION public.get_total_balance()
RETURNS numeric
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(balance), 0) FROM public.profiles WHERE deleted_at IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.get_total_deposits()
RETURNS numeric
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE type = 'deposit' AND status = 'success';
$$;

CREATE OR REPLACE FUNCTION public.get_total_daily_revenue()
RETURNS numeric
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(daily_revenue), 0) FROM public.profiles WHERE deleted_at IS NULL;
$$;

GRANT EXECUTE ON FUNCTION public.get_total_balance() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_total_deposits() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_total_daily_revenue() TO service_role;
