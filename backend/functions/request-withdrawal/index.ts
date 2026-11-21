import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  getServiceClient,
  jsonResp,
  errResp,
  handleCors,
} from "../shared/helpers.ts";

const MIN_WITHDRAWAL = 50;
const MAX_WITHDRAWAL = 50000;

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

  const body = await req.json();
  const { amount, channel, details } = body;

  if (!amount || typeof amount !== "number") {
    return errResp("Amount is required");
  }

  if (amount < MIN_WITHDRAWAL) {
    return errResp(`Minimum withdrawal is GHS ${MIN_WITHDRAWAL}`);
  }

  if (amount > MAX_WITHDRAWAL) {
    return errResp(`Maximum withdrawal is GHS ${MAX_WITHDRAWAL}`);
  }

  if (!channel || !["mobile_money", "bank"].includes(channel)) {
    return errResp("Channel must be mobile_money or bank");
  }

  if (!details || typeof details !== "object") {
    return errResp("Details are required");
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_banned, deleted_at")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_banned || profile.deleted_at) {
    return errResp("Account not available", 403);
  }

  // Check for pending withdrawal
  const { data: pending } = await supabase
    .from("withdrawals")
    .select("id")
    .eq("user_id", profile.id)
    .eq("status", "pending")
    .single();

  if (pending) return errResp("You have a pending withdrawal");

  // Atomic balance deduction
  const { error: deductErr } = await supabase.rpc("deduct_balance", {
    p_user_id: profile.id,
    p_amount: amount,
  });

  if (deductErr) {
    if (deductErr.message?.includes("Insufficient balance")) {
      return errResp("Insufficient balance");
    }
    return errResp("Failed to process withdrawal", 500);
  }

  // Create withdrawal
  const { data: withdrawal, error: wErr } = await supabase
    .from("withdrawals")
    .insert({
      user_id: profile.id,
      amount,
      channel,
      details,
      status: "pending",
    })
    .select()
    .single();

  if (wErr) {
    // Rollback deducted balance if withdrawal creation failed
    await supabase.rpc("refund_balance", {
      p_user_id: profile.id,
      p_amount: amount,
    });
    return errResp("Failed to create withdrawal", 500);
  }

  // Create transaction and link transaction_id
  const { data: txn } = await supabase
    .from("transactions")
    .insert({
      user_id: profile.id,
      amount,
      direction: "-",
      type: "withdrawal",
      status: "pending",
      metadata: { withdrawal_id: withdrawal.id },
    })
    .select("id")
    .single();

  if (txn?.id) {
    await supabase
      .from("withdrawals")
      .update({ transaction_id: txn.id })
      .eq("id", withdrawal.id);
  }

  // Create notification
  await supabase.from("notifications").insert({
    user_id: profile.id,
    type: "withdrawal_update",
    title: "Withdrawal Requested",
    body: `Your withdrawal of GHS ${amount} is being processed`,
    metadata: { amount, channel },
  });

  return jsonResp(withdrawal);
});
