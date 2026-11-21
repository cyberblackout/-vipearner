import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  getServiceClient,
  normalizePhone,
  generateSecureOTP,
  hashOTP,
  jsonResp,
  errResp, handleCors } from "../shared/helpers.ts";

const TERMII_API_KEY = Deno.env.get("TERMII_API_KEY")!;
const TERMII_SENDER_ID = Deno.env.get("TERMII_SENDER_ID") ?? "VIPEarner";
const OTP_COOLDOWN_MS = 60_000;
const MAX_OTP_ATTEMPTS = 5;
const OTP_LOCKOUT_MS = 900_000;

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "POST") return errResp("Method not allowed", 405);

  const body = await req.json();
  const { phone } = body;

  if (!phone || !/^(\+233|0)[0-9]{9}$/.test(phone.replace(/\s/g, ""))) {
    return errResp("Invalid phone number");
  }

  const normalized = normalizePhone(phone);
  const supabase = getServiceClient();

  // Rate limit: check existing OTP record
  const { data: existingOtp } = await supabase
    .from("otp_cache")
    .select("expires_at, attempts, locked_until")
    .eq("phone", normalized)
    .single();

  if (existingOtp) {
    if (
      existingOtp.locked_until &&
      new Date(existingOtp.locked_until) > new Date()
    ) {
      return errResp("Too many attempts. Try again later.", 429);
    }

    const timeSinceLastOtp =
      Date.now() - new Date(existingOtp.expires_at).getTime() + 10 * 60 * 1000;
    if (timeSinceLastOtp < OTP_COOLDOWN_MS) {
      return errResp("Please wait before requesting another OTP", 429);
    }
  }

  const code = generateSecureOTP();
  const codeHash = await hashOTP(code);

  // Store OTP with rate limiting fields
  await supabase.from("otp_cache").upsert({
    phone: normalized,
    code_hash: codeHash,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    attempts: 0,
    locked_until: null,
  });

  // Send via Termii
  try {
    await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TERMII_API_KEY,
        to: normalized,
        from: TERMII_SENDER_ID,
        sms: `Your VIP Earner OTP: ${code}`,
        type: "plain",
        channel: "dnd",
      }),
    });
  } catch (_e) {
    // Log but don't fail
  }

  return jsonResp({ message: "OTP sent" });
});
