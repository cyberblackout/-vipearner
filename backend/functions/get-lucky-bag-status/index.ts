import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  getServiceClient,
  jsonResp,
  errResp, handleCors } from "../shared/helpers.ts";

const LUCKY_BAG_MIN = 0.1;
const LUCKY_BAG_MAX = 1.0;

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
    .select("id, last_lucky_bag, is_banned, deleted_at")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_banned || profile.deleted_at) {
    return errResp("Account not available", 403);
  }

  const lastClaim = profile.last_lucky_bag
    ? new Date(profile.last_lucky_bag)
    : null;

  const canClaim =
    !lastClaim ||
    Date.now() - lastClaim.getTime() >= 24 * 60 * 60 * 1000;

  let nextClaimTime: string | null = null;
  if (!canClaim && lastClaim) {
    const next = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
    nextClaimTime = next.toISOString().split("T")[1].slice(0, 5);
  }

  return jsonResp({
    can_claim: canClaim,
    reward_min: LUCKY_BAG_MIN,
    reward_max: LUCKY_BAG_MAX,
    next_claim_time: nextClaimTime,
  });
});
