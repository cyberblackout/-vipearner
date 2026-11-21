import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  getServiceClient,
  jsonResp,
  errResp,
  handleCors,
  extractId,
} from "../shared/helpers.ts";

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

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("is_admin, is_banned")
    .eq("id", user.id)
    .single();

  if (!adminProfile?.is_admin || adminProfile?.is_banned) return errResp("Admin access required", 403);

  const targetId = extractId(req, "get-admin-user");

  if (!targetId) return errResp("User ID required");

  const { data: targetUser, error } = await supabase
    .from("profiles")
    .select(`
      id, phone, display_name, avatar_url,
      balance, total_income, daily_revenue, monthly_revenue,
      total_profit, total_withdrawals, work_deposit,
      vip_level, vip_upgraded_at,
      referral_code, referred_by,
      last_checkin, checkin_streak,
      is_admin, is_banned, ban_reason,
      created_at
    `)
    .eq("id", targetId)
    .single();

  if (error || !targetUser) return errResp("User not found", 404);

  return jsonResp(targetUser);
});
