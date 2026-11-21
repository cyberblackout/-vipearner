import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getServiceClient,
  normalizePhone,
  jsonResp,
  errResp, handleCors } from "../shared/helpers.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "POST") return errResp("Method not allowed", 405);

  const body = await req.json();
  const { phone, password } = body;

  if (!phone || !password) return errResp("Phone and password are required");

  const normalized = normalizePhone(phone);
  const supabase = getServiceClient();

  // Get profile
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, phone, display_name, vip_level, balance, is_admin, is_banned, deleted_at, failed_login_attempts, locked_until")
    .eq("phone", normalized)
    .single();

  if (profileErr || !profile) return errResp("Invalid phone or password");

  if (profile.deleted_at) return errResp("Account not found");

  if (profile.is_banned) {
    return errResp("Your account has been suspended", 403);
  }

  if (
    profile.locked_until &&
    new Date(profile.locked_until) > new Date()
  ) {
    return errResp("Account temporarily locked. Try again later.", 423);
  }

  // Use ANON key to verify password (service_role bypasses auth verification)
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const tempEmail = `${normalized.replace("+", "")}@vipearner.internal`;

  const { data: authData, error: authErr } =
    await anonClient.auth.signInWithPassword({
      email: tempEmail,
      password: password,
    });

  if (authErr) {
    // Increment failed attempts
    const newAttempts = (profile.failed_login_attempts || 0) + 1;
    const update: Record<string, unknown> = {
      failed_login_attempts: newAttempts,
    };

    if (newAttempts >= 5) {
      update.locked_until = new Date(
        Date.now() + 15 * 60 * 1000
      ).toISOString();
      update.failed_login_attempts = 0;
    }

    await supabase.from("profiles").update(update).eq("id", profile.id);

    return errResp("Invalid phone or password");
  }

  // Reset failed attempts on success
  await supabase
    .from("profiles")
    .update({
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  return jsonResp({
    token: authData.session?.access_token,
    refresh_token: authData.session?.refresh_token,
    access_token: authData.session?.access_token,
    session: authData.session,
    user: authData.user,
    profile: {
      id: profile.id,
      phone: profile.phone,
      display_name: profile.display_name,
      vip_level: profile.vip_level,
      balance: profile.balance,
      is_admin: profile.is_admin,
    },
  });
});
