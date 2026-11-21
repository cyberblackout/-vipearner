import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  getServiceClient,
  jsonResp,
  errResp, handleCors } from "../shared/helpers.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "GET") return errResp("Method not allowed", 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return errResp("Unauthorized", 401);

  const supabase = getServiceClient();
  const token = authHeader.replace("Bearer ", "");

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return errResp("Unauthorized", 401);

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select(`
      id, phone, display_name, avatar_url,
      balance, total_income, daily_revenue, monthly_revenue,
      total_profit, total_withdrawals, work_deposit,
      vip_level, vip_upgraded_at,
      referral_code, referred_by,
      last_checkin, checkin_streak, last_lucky_bag,
      is_admin, is_banned, ban_reason,
      created_at
    `)
    .eq("id", user.id)
    .is("deleted_at", null)
    .single();

  if (profileErr || !profile) return errResp("Profile not found", 404);

  // Get VIP level details
  const { data: vipLevel } = await supabase
    .from("vip_levels")
    .select("*")
    .eq("name", profile.vip_level)
    .single();

  return jsonResp({ ...profile, vipLevel });
});
