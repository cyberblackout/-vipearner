-- Migration: 20261119000000_security_and_performance_audit_fixes.sql
-- Description: Production security lockdown of SECURITY DEFINER functions,
--              creation of refund_balance routine, search_path enforcement,
--              and covering indexes for foreign keys.

-- ============================================================================
-- 1. SECURITY DEFINER PRIVILEGE HARDENING
-- ============================================================================

-- Revoke remote execution on sensitive routines from unauthenticated and client roles
REVOKE EXECUTE ON FUNCTION public.increment_balance(uuid, numeric) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.deduct_balance(uuid, numeric) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_work_deposit(uuid, numeric) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_total_balance() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_total_deposits() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_total_daily_revenue() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reset_all_daily_revenue() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reset_all_monthly_revenue() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_my_withdrawals(integer) FROM anon, PUBLIC;

-- Grant execution strictly to service_role (used by Edge Functions)
GRANT EXECUTE ON FUNCTION public.increment_balance(uuid, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.deduct_balance(uuid, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_work_deposit(uuid, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_total_balance() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_total_deposits() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_total_daily_revenue() TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_all_daily_revenue() TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_all_monthly_revenue() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_my_withdrawals(integer) TO authenticated, service_role;

-- ============================================================================
-- 2. SEARCH_PATH HARDENING (PREVENTS SCHEMA SPOOFING)
-- ============================================================================

ALTER FUNCTION public.deduct_balance(uuid, numeric) SET search_path = public;
ALTER FUNCTION public.increment_balance(uuid, numeric) SET search_path = public;
ALTER FUNCTION public.increment_work_deposit(uuid, numeric) SET search_path = public;
ALTER FUNCTION public.get_total_balance() SET search_path = public;
ALTER FUNCTION public.get_total_deposits() SET search_path = public;
ALTER FUNCTION public.get_total_daily_revenue() SET search_path = public;
ALTER FUNCTION public.cleanup_expired_otps() SET search_path = public;
ALTER FUNCTION public.reset_all_daily_revenue() SET search_path = public;
ALTER FUNCTION public.reset_all_monthly_revenue() SET search_path = public;

-- ============================================================================
-- 3. FINANCIAL INTEGRITY: SAFE REFUND FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.refund_balance(p_user_id uuid, p_amount numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance numeric;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Refund amount must be positive';
  END IF;

  UPDATE public.profiles
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING balance INTO v_new_balance;

  IF v_new_balance IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  RETURN v_new_balance;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.refund_balance(uuid, numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refund_balance(uuid, numeric) TO service_role;

-- ============================================================================
-- 4. PERFORMANCE INDEXING: COVERING INDEXES FOR FOREIGN KEYS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON public.announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON public.audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_session_id ON public.task_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_task_id ON public.task_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_task_sessions_task_id ON public.task_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_transactions_admin_id ON public.transactions(admin_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_reviewed_by ON public.withdrawals(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_withdrawals_transaction_id ON public.withdrawals(transaction_id);
