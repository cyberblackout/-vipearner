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
  const withdrawalId = extractId(req, "approve-withdrawal", body.id || body.withdrawalId);

  if (!withdrawalId) return errResp("Withdrawal ID required");
  const { note } = body;

  // Get withdrawal with pending check
  const { data: withdrawal } = await supabase
    .from("withdrawals")
    .select("*, user:profiles!withdrawals_user_id_fkey(id, total_withdrawals)")
    .eq("id", withdrawalId)
    .single();

  if (!withdrawal) return errResp("Withdrawal not found", 404);
  if (withdrawal.status !== "pending") return errResp("Withdrawal is not pending");

  // Atomic state change: only succeed if status is still pending (prevents double approval / race condition)
  const { data: updatedWithdrawal, error: updateErr } = await supabase
    .from("withdrawals")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      admin_note: note ?? null,
    })
    .eq("id", withdrawalId)
    .eq("status", "pending")
    .select()
    .single();

  if (updateErr || !updatedWithdrawal) {
    return errResp("Withdrawal was already processed by another request", 409);
  }

  // Update transaction if linked or find matching pending transaction
  if (withdrawal.transaction_id) {
    await supabase
      .from("transactions")
      .update({ status: "success" })
      .eq("id", withdrawal.transaction_id);
  } else {
    // If transaction_id wasn't linked, update matching pending transaction for this user
    await supabase
      .from("transactions")
      .update({ status: "success" })
      .eq("user_id", withdrawal.user_id)
      .eq("type", "withdrawal")
      .eq("status", "pending")
      .eq("amount", withdrawal.amount)
      .limit(1);
  }

  // Update user total_withdrawals
  const userProfile = withdrawal.user;
  if (userProfile) {
    await supabase
      .from("profiles")
      .update({
        total_withdrawals: (userProfile.total_withdrawals || 0) + withdrawal.amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", withdrawal.user_id);
  }

  // Audit log
  await supabase.from("audit_log").insert({
    admin_id: user.id,
    target_id: withdrawal.user_id,
    action: "withdrawal_approved",
    new_value: { amount: withdrawal.amount, note },
  });

  // Notify user
  await supabase.from("notifications").insert({
    user_id: withdrawal.user_id,
    type: "withdrawal_update",
    title: "Withdrawal Approved",
    body: `Your withdrawal of GHS ${withdrawal.amount} has been approved`,
  });

  return jsonResp({ success: true });
});
