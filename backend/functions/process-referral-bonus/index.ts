import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  getServiceClient,
  verifyInternalAuth,
  jsonResp,
  errResp, handleCors } from "../shared/helpers.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "POST") return errResp("Method not allowed", 405);

  if (!verifyInternalAuth(req)) return errResp("Unauthorized", 401);

  const body = await req.json();
  const { user_id } = body;

  if (!user_id) return errResp("user_id required");

  const supabase = getServiceClient();

  // Find unpaid referral for this user
  const { data: referral } = await supabase
    .from("referrals")
    .select("id, referrer_id, reward_amount")
    .eq("referred_id", user_id)
    .eq("reward_paid", false)
    .single();

  if (!referral) return jsonResp({ processed: false });

  // Atomic balance increment
  const { error: updateErr } = await supabase.rpc("increment_balance", {
    p_user_id: referral.referrer_id,
    p_amount: referral.reward_amount,
  });

  if (updateErr) return errResp("Failed to credit referral bonus", 500);

  // Create transaction
  await supabase.from("transactions").insert({
    user_id: referral.referrer_id,
    amount: referral.reward_amount,
    direction: "+",
    type: "referral_bonus",
    status: "success",
    metadata: { referred_user: user_id },
  });

  // Mark referral as paid
  await supabase
    .from("referrals")
    .update({
      reward_paid: true,
      paid_at: new Date().toISOString(),
    })
    .eq("id", referral.id);

  // Notify referrer
  await supabase.from("notifications").insert({
    user_id: referral.referrer_id,
    type: "referral_bonus",
    title: "Referral Bonus!",
    body: `You earned GHS ${referral.reward_amount} for referring a friend!`,
    metadata: { reward: referral.reward_amount },
  });

  return jsonResp({ processed: true, reward: referral.reward_amount });
});
