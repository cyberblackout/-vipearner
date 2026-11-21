import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getServiceClient, jsonResp, handleCors } from "../shared/helpers.ts";

const PAYSTACK_WEBHOOK_SECRET = Deno.env.get("PAYSTACK_WEBHOOK_SECRET")!;
const REFERRAL_TRIGGER_DEPOSIT = 10;

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "POST") return new Response("OK");

  // Verify signature
  const signature = req.headers.get("x-paystack-signature");
  if (!signature) return new Response("Missing signature", { status: 401 });

  const payload = await req.text();
  const expectedSignature = await hmacSha512(payload, PAYSTACK_WEBHOOK_SECRET);

  if (signature !== expectedSignature) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(payload);

  if (event.event !== "charge.success") {
    return jsonResp({ received: true });
  }

  const data = event.data ?? {};
  const reference = data.reference;
  const amount = (data.amount ?? 0) / 100;

  if (!reference) return jsonResp({ received: true });

  const supabase = getServiceClient();

  // Find pending transaction (idempotent: only finds pending)
  const { data: transaction } = await supabase
    .from("transactions")
    .select("id, user_id, status")
    .eq("paystack_reference", reference)
    .eq("status", "pending")
    .single();

  if (!transaction) return jsonResp({ received: true });

  const metadata = data.metadata ?? {};
  const userId = metadata.user_id ?? transaction.user_id;

  if (userId !== transaction.user_id) {
    return jsonResp({ received: true });
  }

  // Mark transaction as success FIRST (prevents double-processing)
  const { error: txErr } = await supabase
    .from("transactions")
    .update({ status: "success" })
    .eq("id", transaction.id)
    .eq("status", "pending");

  if (txErr) return jsonResp({ received: true });

  // Atomic balance increment
  const { error: updateErr } = await supabase.rpc("increment_work_deposit", {
    p_user_id: transaction.user_id,
    p_amount: amount,
  });

  if (updateErr) {
    // Revert transaction status on failure
    await supabase
      .from("transactions")
      .update({ status: "pending" })
      .eq("id", transaction.id);
    return jsonResp({ received: true });
  }

  // Create notification
  await supabase.from("notifications").insert({
    user_id: transaction.user_id,
    type: "deposit",
    title: "Deposit Successful",
    body: `Your deposit of GHS ${amount} was successful`,
    metadata: { amount },
  });

  // Process referral bonus if qualifying
  if (amount >= REFERRAL_TRIGGER_DEPOSIT) {
    const internalSecret = Deno.env.get("INTERNAL_API_SECRET") ?? "";
    await supabase.functions.invoke("process-referral-bonus", {
      body: { user_id: transaction.user_id },
      headers: { "X-Internal-Secret": internalSecret },
    });
  }

  return jsonResp({ received: true });
});

async function hmacSha512(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
