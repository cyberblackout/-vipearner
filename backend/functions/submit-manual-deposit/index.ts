import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  getServiceClient,
  jsonResp,
  errResp,
  normalizePhone, handleCors } from "../shared/helpers.ts";

const MIN_DEPOSIT = 250;
const MAX_DEPOSIT = 100000;

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
  const { amount, network, senderPhone, reference, screenshotUrl } = body;

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount < MIN_DEPOSIT) {
    return errResp(`Minimum deposit is GHS ${MIN_DEPOSIT}.00`);
  }

  if (numAmount > MAX_DEPOSIT) {
    return errResp(`Maximum deposit is GHS ${MAX_DEPOSIT.toLocaleString()}.00`);
  }

  if (!network || !["MTN", "Telecel", "AirtelTigo"].includes(network)) {
    return errResp("Please select a valid network (MTN, Telecel, or AirtelTigo)");
  }

  if (!senderPhone || typeof senderPhone !== "string" || senderPhone.trim().length < 9) {
    return errResp("Please enter a valid phone number you sent the money from");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_banned, deleted_at")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_banned || profile.deleted_at) {
    return errResp("Account not available", 403);
  }

  const normalizedSender = normalizePhone(senderPhone);
  const depositRef = reference?.trim() || `DEP-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Insert pending deposit record in transactions table
  const { data: transaction, error: txError } = await supabase
    .from("transactions")
    .insert({
      user_id: profile.id,
      amount: numAmount,
      direction: "+",
      type: "deposit",
      status: "pending",
      paystack_reference: depositRef,
      metadata: {
        payment_method: "manual_mobile_money",
        network,
        sender_phone: normalizedSender,
        reference: depositRef,
        screenshot_url: screenshotUrl || null,
        submitted_at: new Date().toISOString(),
      },
    })
    .select()
    .single();

  if (txError) {
    console.error("Deposit insert error:", txError);
    return errResp("Failed to record deposit. Please try again.", 500);
  }

  return jsonResp({
    success: true,
    message: "Deposit submitted successfully! Your account will be credited once verified by admin.",
    transaction,
  });
});
