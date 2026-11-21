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

  // Get user profile with VIP level
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, vip_level, is_banned, deleted_at")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_banned || profile.deleted_at) {
    return errResp("Account not available", 403);
  }

  // Get current level
  const { data: currentLevel } = await supabase
    .from("vip_levels")
    .select("sort_order")
    .eq("name", profile.vip_level)
    .single();

  if (!currentLevel) return errResp("Current VIP level not found", 500);

  // Get next level
  const { data: nextLevel } = await supabase
    .from("vip_levels")
    .select("name, upgrade_cost")
    .eq("sort_order", currentLevel.sort_order + 1)
    .single();

  if (!nextLevel) return errResp("No upgrade available");

  const cost = nextLevel.upgrade_cost;

  if (!cost) return errResp("No upgrade available");

  // Atomic balance deduction
  const { error: deductErr } = await supabase.rpc("deduct_balance", {
    p_user_id: profile.id,
    p_amount: cost,
  });

  if (deductErr) {
    if (deductErr.message?.includes("Insufficient balance")) {
      return errResp("Insufficient balance for upgrade");
    }
    return errResp("Failed to process upgrade", 500);
  }

  // Upgrade VIP level
  await supabase
    .from("profiles")
    .update({
      vip_level: nextLevel.name,
      vip_upgraded_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  // Create transaction
  await supabase.from("transactions").insert({
    user_id: profile.id,
    amount: cost,
    direction: "-",
    type: "vip_upgrade",
    status: "success",
  });

  // Create notification
  await supabase.from("notifications").insert({
    user_id: profile.id,
    type: "vip_upgrade",
    title: "VIP Upgraded!",
    body: `Congratulations! You are now ${nextLevel.name}`,
    metadata: { new_level: nextLevel.name },
  });

  const { data: updatedProfile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", profile.id)
    .single();

  return jsonResp({
    new_level: nextLevel.name,
    cost,
    new_balance: updatedProfile?.balance ?? 0,
  });
});
