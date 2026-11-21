import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  getServiceClient,
  jsonResp,
  errResp, handleCors } from "../shared/helpers.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY")!;
const APP_URL = Deno.env.get("APP_URL") ?? "https://vipearner.com";

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
  const { amount } = body;

  if (!amount || typeof amount !== "number") {
    return errResp("Amount is required");
  }

  const minDeposit = 250;
  const maxDeposit = 100000;

  if (amount < minDeposit || amount > maxDeposit) {
    return errResp(`Amount must be between GHS ${minDeposit} and GHS ${maxDeposit}`);
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, phone, is_banned, deleted_at")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_banned || profile.deleted_at) {
    return errResp("Account not available", 403);
  }

  // Check for existing pending deposit
  const { data: pendingDeposit } = await supabase
    .from("transactions")
    .select("id")
    .eq("user_id", profile.id)
    .eq("type", "deposit")
    .eq("status", "pending")
    .single();

  if (pendingDeposit) {
    return errResp("You have a pending deposit. Please complete or wait for it to expire.");
  }

  // Initiate Paystack transaction
  const response = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: `${profile.phone.replace("+", "")}@vipearner.gh`,
        amount: amount * 100, // Paystack uses kobo/pesewas
        currency: "GHS",
        channels: ["mobile_money", "card"],
        metadata: {
          user_id: profile.id,
          type: "deposit",
        },
        callback_url: `${APP_URL}/deposit/callback`,
      }),
    }
  );

  if (!response.ok) {
    return errResp("Failed to initiate payment", 502);
  }

  const result = await response.json();

  if (!result.status) {
    return errResp(result.message ?? "Payment initiation failed", 502);
  }

  // Create pending transaction
  await supabase.from("transactions").insert({
    user_id: profile.id,
    amount,
    direction: "+",
    type: "deposit",
    status: "pending",
    paystack_reference: result.data.reference,
  });

  return jsonResp({
    authorization_url: result.data.authorization_url,
    reference: result.data.reference,
  });
});
