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
  if (req.method !== "POST") return errResp("Method not allowed", 405);

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

  if (
    lastClaim &&
    Date.now() - lastClaim.getTime() < 24 * 60 * 60 * 1000
  ) {
    const next = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
    const hours = next.getHours().toString().padStart(2, "0");
    const mins = next.getMinutes().toString().padStart(2, "0");
    return errResp(`You can claim again at ${hours}:${mins}`);
  }

  // Generate random reward using secure random
  const array = new Uint8Array(1);
  crypto.getRandomValues(array);
  const reward =
    Math.round(
      (array[0] / 255 * (LUCKY_BAG_MAX - LUCKY_BAG_MIN) + LUCKY_BAG_MIN) * 100
    ) / 100;

  // Atomic balance increment
  const { error: updateErr } = await supabase.rpc("increment_balance", {
    p_user_id: profile.id,
    p_amount: reward,
  });

  if (updateErr) return errResp("Failed to credit reward", 500);

  // Update lucky bag timestamp
  await supabase
    .from("profiles")
    .update({ last_lucky_bag: new Date().toISOString() })
    .eq("id", profile.id);

  // Create transaction
  await supabase.from("transactions").insert({
    user_id: profile.id,
    amount: reward,
    direction: "+",
    type: "lucky_bag",
    status: "success",
  });

  // Create notification
  await supabase.from("notifications").insert({
    user_id: profile.id,
    type: "lucky_bag",
    title: "Lucky Bag!",
    body: `You won GHS ${reward} from the lucky bag!`,
    metadata: { reward },
  });

  const { data: updatedProfile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", profile.id)
    .single();

  return jsonResp({
    reward,
    new_balance: updatedProfile?.balance ?? 0,
  });
});
