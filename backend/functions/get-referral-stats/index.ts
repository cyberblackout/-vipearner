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
    .select("id, referral_code, is_banned, deleted_at")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_banned || profile.deleted_at) {
    return errResp("Account not available", 403);
  }

  // Get referrals made by this user
  const { data: referrals } = await supabase
    .from("referrals")
    .select("id, reward_amount, reward_paid, paid_at, created_at, referred:profiles!referrals_referred_id_fkey(id, display_name, created_at)")
    .eq("referrer_id", user.id);

  const total = referrals?.length ?? 0;
  const rewarded = referrals?.filter((r) => r.reward_paid).length ?? 0;
  const pending = total - rewarded;
  const totalEarned =
    referrals
      ?.filter((r) => r.reward_paid)
      .reduce((sum, r) => sum + Number(r.reward_amount), 0) ?? 0;

  return jsonResp({
    referral_code: profile.referral_code,
    total,
    rewarded,
    pending,
    total_earned: totalEarned,
    referrals: referrals ?? [],
  });
});
