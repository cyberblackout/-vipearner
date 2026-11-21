-- ========================================================================
-- VIP EARNER GH - Comprehensive Row Level Security (RLS) Policies
-- Migration: 20261119000001_comprehensive_rls_policies.sql
-- ========================================================================

-- 1. Helper function: is_admin() to prevent recursive RLS evaluations
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() AND deleted_at IS NULL),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- 2. vip_levels: Public reference data
DROP POLICY IF EXISTS "Public can view VIP levels" ON public.vip_levels;
CREATE POLICY "Public can view VIP levels"
  ON public.vip_levels FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage VIP levels" ON public.vip_levels;
CREATE POLICY "Admins can manage VIP levels"
  ON public.vip_levels FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. announcements: Public read active, admin manage all
DROP POLICY IF EXISTS "Active announcements viewable by all" ON public.announcements;
CREATE POLICY "Active announcements viewable by all"
  ON public.announcements FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
CREATE POLICY "Admins can manage announcements"
  ON public.announcements FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. tasks: Authenticated users view active tasks, admin manage all
DROP POLICY IF EXISTS "Active tasks viewable by authenticated users" ON public.tasks;
CREATE POLICY "Active tasks viewable by authenticated users"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage tasks" ON public.tasks;
CREATE POLICY "Admins can manage tasks"
  ON public.tasks FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. profiles: Users view own profile, admins view all
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own display info" ON public.profiles;
CREATE POLICY "Users can update own display info"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 6. transactions: Users view own transactions, admins view all
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- 7. withdrawals: Users view own withdrawals, admins view all
DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can view own withdrawals"
  ON public.withdrawals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- 8. referrals: Users view own referrals, admins view all
DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR public.is_admin());

-- 9. notifications: Users view and update own notifications, admins view all
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 10. task_sessions: Users view own sessions, admins view all
DROP POLICY IF EXISTS "Users can view own task sessions" ON public.task_sessions;
CREATE POLICY "Users can view own task sessions"
  ON public.task_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- 11. task_logs: Users view own logs, admins view all
DROP POLICY IF EXISTS "Users can view own task logs" ON public.task_logs;
CREATE POLICY "Users can view own task logs"
  ON public.task_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- 12. audit_log: Admins view audit logs, no regular user access
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_log;
CREATE POLICY "Admins can view audit logs"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 13. otp_cache: Deny all direct client access
DROP POLICY IF EXISTS "Deny all client access to otp_cache" ON public.otp_cache;
CREATE POLICY "Deny all client access to otp_cache"
  ON public.otp_cache FOR ALL
  TO anon, authenticated
  USING (false);
