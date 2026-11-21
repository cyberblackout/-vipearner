import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  getServiceClient,
  jsonResp,
  errResp, handleCors } from "../shared/helpers.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "POST") return errResp("Method not allowed", 405);

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

  if (profile.last_checkin === todayStr) {
    return errResp("Already checked in today");
  }

  const yesterday = new Date(now.getTime() - 86400000)
    .toISOString()
    .split("T")[0];

  const currentStreak =
    profile.last_checkin === yesterday ? (profile.checkin_streak ?? 0) : 0;
  const newStreak = Math.min(currentStreak + 1, 7);
  const reward = 0.1 * newStreak;

  // Atomic balance increment + streak update
  const { error: updateErr } = await supabase.rpc("increment_balance", {
    p_user_id: profile.id,
    p_amount: reward,
  });

  if (updateErr) return errResp("Failed to credit reward", 500);

  // Update streak and last_checkin (separate from balance for atomicity)
  await supabase
    .from("profiles")
    .update({
      last_checkin: todayStr,
      checkin_streak: newStreak,
    })
    .eq("id", profile.id);

  // Create transaction
  await supabase.from("transactions").insert({
    user_id: profile.id,
    amount: reward,
    direction: "+",
    type: "daily_checkin",
    status: "success",
  });

  // Create notification
  await supabase.from("notifications").insert({
    user_id: profile.id,
    type: "daily_checkin",
    title: "Daily Check-in!",
    body: `You earned GHS ${reward} for checking in. Streak: ${newStreak} days`,
    metadata: { streak: newStreak, reward },
  });

  const { data: updatedProfile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", profile.id)
    .single();

  return jsonResp({
    reward,
    streak: newStreak,
    new_balance: updatedProfile?.balance ?? 0,
  });
});
