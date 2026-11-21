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
  if (req.method !== "POST") return errResp("Method not allowed", 405);

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

  const body = await req.json().catch(() => ({}));
  const targetId = extractId(req, "admin-adjust-balance", body.id || body.userId || body.targetId);

  if (!targetId) return errResp("User ID required");

  const { amount, reason } = body;

  if (typeof amount !== "number" || isNaN(amount) || !isFinite(amount) || amount < -99999 || amount > 99999) {
    return errResp("Invalid amount");
  }

  if (amount === 0) {
    return errResp("Amount cannot be zero");
  }

  if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
    return errResp("Reason is required");
  }

  // Get target user
  const { data: target } = await supabase
    .from("profiles")
    .select("id, balance, total_income")
    .eq("id", targetId)
    .single();

  if (!target) return errResp("User not found", 404);

  // Negative balance protection
  if (amount < 0 && target.balance < Math.abs(amount)) {
    return errResp("Insufficient balance for deduction");
  }

  const direction = amount >= 0 ? "+" : "-";
  const absAmount = Math.abs(amount);

  // Atomic update
  if (amount >= 0) {
    const { error } = await supabase.rpc("increment_balance", {
      p_user_id: targetId,
      p_amount: absAmount,
    });
    if (error) return errResp("Failed to adjust balance", 500);
  } else {
    const { error } = await supabase.rpc("deduct_balance", {
      p_user_id: targetId,
      p_amount: absAmount,
    });
    if (error) return errResp("Failed to adjust balance", 500);
  }

  // Create transaction
  await supabase.from("transactions").insert({
    user_id: targetId,
    amount: absAmount,
    direction,
    type: "admin_adjustment",
    status: "success",
    admin_id: user.id,
    metadata: { reason },
  });

  // Create audit log
  await supabase.from("audit_log").insert({
    admin_id: user.id,
    target_id: targetId,
    action: "balance_adjustment",
    old_value: { balance: target.balance },
    new_value: { amount, reason },
    reason,
  });

  const { data: updated } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", targetId)
    .single();

  return jsonResp({
    success: true,
    new_balance: updated?.balance ?? 0,
  });
});
