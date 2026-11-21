import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getServiceClient,
  normalizePhone,
  generateReferralCode,
  verifyOTP,
  jsonResp,
  errResp, handleCors } from "../shared/helpers.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MAX_OTP_ATTEMPTS = 5;
const OTP_LOCKOUT_MS = 900_000;

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "POST") return errResp("Method not allowed", 405);

  const body = await req.json();
  const { phone, code, ref_code } = body;

  if (!phone || !code) return errResp("Phone and code are required");

  const normalized = normalizePhone(phone);
  const supabase = getServiceClient();

  // Get OTP record with rate limiting
  const { data: otpRow, error: otpErr } = await supabase
    .from("otp_cache")
    .select("code_hash, expires_at, attempts, locked_until")
    .eq("phone", normalized)
    .single();

  if (otpErr || !otpRow) return errResp("Invalid OTP");

  // Check lockout
  if (
    otpRow.locked_until &&
    new Date(otpRow.locked_until) > new Date()
  ) {
    return errResp("Too many failed attempts. Try again later.", 423);
  }

  // Check expiry
  if (new Date(otpRow.expires_at) < new Date()) {
    return errResp("OTP expired");
  }

  // Check attempts
  const attempts = (otpRow.attempts || 0) + 1;

  const valid = await verifyOTP(code, otpRow.code_hash);
  if (!valid) {
    const update: Record<string, unknown> = { attempts };

    if (attempts >= MAX_OTP_ATTEMPTS) {
      update.locked_until = new Date(Date.now() + OTP_LOCKOUT_MS).toISOString();
      update.attempts = 0;
    }

    await supabase.from("otp_cache").update(update).eq("phone", normalized);
    return errResp("Invalid OTP");
  }

  // Delete used OTP
  await supabase.from("otp_cache").delete().eq("phone", normalized);

  // Check if user exists in profiles
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, phone")
    .eq("phone", normalized)
    .single();

  let userId: string;

  if (existingProfile) {
    userId = existingProfile.id;
  } else {
    // Create auth user via Admin API
    const tempEmail = `${normalized.replace("+", "")}@vipearner.internal`;
    const tempPassword = crypto.randomUUID();

    const { data: authUser, error: createErr } =
      await supabase.auth.admin.createUser({
        email: tempEmail,
        password: tempPassword,
        phone: normalized,
        email_confirm: true,
        phone_confirm: true,
      });

    if (createErr || !authUser?.user) {
      return errResp("Failed to create user", 500);
    }

    userId = authUser.user.id;

    // Update profile with proper referral code and phone
    const referralCode = generateReferralCode();
    await supabase.from("profiles").update({
      phone: normalized,
      referral_code: referralCode,
    }).eq("id", userId);
  }

  // Link referral if provided
  if (ref_code) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("id", userId)
      .single();

    if (profile && !profile.referred_by) {
      const { data: referrer } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", ref_code)
        .single();

      if (referrer && referrer.id !== userId) {
        await supabase
          .from("profiles")
          .update({ referred_by: referrer.id })
          .eq("id", userId);
      }
    }
  }

  // Sign JWT using Supabase Auth
  const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: session, error: sessionErr } =
    await serviceClient.auth.admin.generateLink({
      type: "magiclink",
      email: `${normalized.replace("+", "")}@vipearner.internal`,
    });

  if (sessionErr) {
    return errResp("Failed to create session", 500);
  }

  return jsonResp({
    token: session.properties?.action_link?.split("token=")[1] ?? "",
    user: { id: userId, phone: normalized },
  });
});
