import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  getServiceClient,
  jsonResp,
  errResp, handleCors } from "../shared/helpers.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "PATCH") return errResp("Method not allowed", 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return errResp("Unauthorized", 401);

  const supabase = getServiceClient();
  const token = authHeader.replace("Bearer ", "");

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return errResp("Unauthorized", 401);

  const body = await req.json();
  const { display_name, avatar_url } = body;

  const updates: Record<string, unknown> = {};
  if (display_name !== undefined) {
    if (display_name.length < 2 || display_name.length > 80) {
      return errResp("Display name must be 2-80 characters");
    }
    updates.display_name = display_name;
  }
  if (avatar_url !== undefined) {
    if (typeof avatar_url === "string" && avatar_url && !avatar_url.startsWith("https://")) {
      return errResp("Avatar URL must be HTTPS");
    }
    updates.avatar_url = avatar_url;
  }

  if (Object.keys(updates).length === 0) {
    return errResp("No fields to update");
  }

  // Check if user is banned
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_banned, deleted_at")
    .eq("id", user.id)
    .single();

  if (profile?.is_banned || profile?.deleted_at) {
    return errResp("Account not available", 403);
  }

  const { data: updatedProfile, error: updateErr } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select("id, phone, display_name, avatar_url, balance, total_income, daily_revenue, monthly_revenue, total_profit, total_withdrawals, work_deposit, vip_level, referral_code, is_admin, is_banned")
    .single();

  if (updateErr) return errResp("Update failed", 500);

  return jsonResp(updatedProfile);
});
