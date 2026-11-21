import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getServiceClient,
  normalizePhone,
  generateReferralCode,
  jsonResp,
  errResp, handleCors } from "../shared/helpers.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "POST") return errResp("Method not allowed", 405);

  const body = await req.json();
  const { phone, password, display_name, referral_code } = body;

  if (!phone || !password || !display_name) {
    return errResp("Phone, password, and display name are required");
  }

  if (password.length < 6) {
    return errResp("Password must be at least 6 characters");
  }

  if (display_name.length < 2 || display_name.length > 80) {
    return errResp("Display name must be 2-80 characters");
  }

  const normalized = normalizePhone(phone);
  const supabase = getServiceClient();

  // Check if phone already exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, is_banned, deleted_at")
    .eq("phone", normalized)
    .single();

  if (existing) {
    if (existing.is_banned || existing.deleted_at) {
      return errResp("Phone number not available");
    }
    return errResp("Phone number already registered");
  }

  // Create auth user
  const tempEmail = `${normalized.replace("+", "")}@vipearner.internal`;

  const { data: authUser, error: createErr } =
    await supabase.auth.admin.createUser({
      email: tempEmail,
      password: password,
      phone: normalized,
      email_confirm: true,
      phone_confirm: true,
    });

  if (createErr || !authUser?.user) {
    return errResp("Failed to create account", 500);
  }

  const userId = authUser.user.id;
  const userReferralCode = generateReferralCode();

  // Create profile row (no auto-trigger exists on auth.users)
  const { error: profileErr } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      phone: normalized,
      display_name: display_name,
      referral_code: userReferralCode,
      balance: 0.00,
      work_deposit: 20.00,
      vip_level: "Intern",
    });

  if (profileErr) {
    // If insert fails (e.g. duplicate), try update as fallback
    await supabase
      .from("profiles")
      .update({
        phone: normalized,
        display_name: display_name,
        referral_code: userReferralCode,
        balance: 0.00,
        work_deposit: 20.00,
        vip_level: "Intern",
      })
      .eq("id", userId);
  }

  // Link referral if provided
  if (referral_code) {
    const { data: referrer } = await supabase
      .from("profiles")
      .select("id")
      .eq("referral_code", referral_code)
      .single();

    if (referrer && referrer.id !== userId) {
      await supabase
        .from("profiles")
        .update({ referred_by: referrer.id })
        .eq("id", userId);
    }
  }

  // Use ANON key to sign in (service_role bypasses password verification)
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: session, error: sessionErr } =
    await anonClient.auth.signInWithPassword({
      email: tempEmail,
      password: password,
    });

  if (sessionErr) {
    return jsonResp({
      token: null,
      refresh_token: null,
      user: { id: userId, phone: normalized, display_name },
    });
  }

  return jsonResp({
    token: session.session?.access_token,
    refresh_token: session.session?.refresh_token,
    user: {
      id: userId,
      phone: normalized,
      display_name,
      referral_code: userReferralCode,
    },
  });
});
