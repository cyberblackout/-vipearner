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
  const withdrawalId = extractId(req, "reject-withdrawal", body.id || body.withdrawalId);

  if (!withdrawalId) return errResp("Withdrawal ID required");

  const { reason } = body;
  if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
    return errResp("Reason is required");
  }

  // Sanitize reason for notification (max 200 chars, no special chars)
  const sanitizedReason = reason.trim().slice(0, 200).replace(/[<>"'&]/g, "");

  // Get withdrawal with pending check
  const { data: withdrawal } = await supabase
    .from("withdrawals")
    .select("id, amount, status, user_id, transaction_id")
    .eq("id", withdrawalId)
    .single();

  if (!withdrawal) return errResp("Withdrawal not found", 404);
  if (withdrawal.status !== "pending") return errResp("Withdrawal is not pending");

  // Atomic state change: only succeed if status is still pending (prevents race condition)
  const { data: updatedWithdrawal, error: updateErr } = await supabase
    .from("withdrawals")
    .update({
      status: "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      admin_note: sanitizedReason,
    })
    .eq("id", withdrawalId)
    .eq("status", "pending")
    .select()
    .single();

  if (updateErr || !updatedWithdrawal) {
    return errResp("Withdrawal was already processed by another request", 409);
  }

  // Safe atomic balance refund (does NOT inflate user's income or profit metrics)
  await supabase.rpc("refund_balance", {
    p_user_id: withdrawal.user_id,
    p_amount: withdrawal.amount,
  });

  // Update transaction if linked or find matching pending transaction
  if (withdrawal.transaction_id) {
    await supabase
      .from("transactions")
      .update({ status: "failed" })
      .eq("id", withdrawal.transaction_id);
  } else {
    // If transaction_id wasn't linked, update matching pending transaction for this user
    await supabase
      .from("transactions")
      .update({ status: "failed" })
      .eq("user_id", withdrawal.user_id)
      .eq("type", "withdrawal")
      .eq("status", "pending")
      .eq("amount", withdrawal.amount)
      .limit(1);
  }

  // Audit log
  await supabase.from("audit_log").insert({
    admin_id: user.id,
    target_id: withdrawal.user_id,
    action: "withdrawal_rejected",
    old_value: { status: "pending" },
    new_value: { amount: withdrawal.amount, reason: sanitizedReason },
    reason: sanitizedReason,
  });

  // Notify user
  await supabase.from("notifications").insert({
    user_id: withdrawal.user_id,
    type: "withdrawal_update",
    title: "Withdrawal Rejected",
    body: `Your withdrawal of GHS ${withdrawal.amount} was rejected. Reason: ${sanitizedReason}`,
  });

  return jsonResp({ success: true });
});
