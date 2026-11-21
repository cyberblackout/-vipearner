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

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, last_checkin, checkin_streak, is_banned, deleted_at")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_banned || profile.deleted_at) {
    return errResp("Account not available", 403);
  }

  // Get today's date in Africa/Accra (UTC+0)
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const yesterday = new Date(now.getTime() - 86400000)
    .toISOString()
    .split("T")[0];

  const canCheckin = profile.last_checkin !== todayStr;
  let streak = profile.checkin_streak ?? 0;

  if (profile.last_checkin !== yesterday && profile.last_checkin !== todayStr) {
    streak = 0;
  }

  const rewards: Record<number, number> = {};
  for (let i = 1; i <= 7; i++) {
    rewards[i] = 0.1 * i;
  }

  return jsonResp({
    current_streak: streak,
    can_checkin: canCheckin,
    rewards,
    today_reward: 0.1 * (streak + 1),
  });
});
