import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  getServiceClient,
  jsonResp,
  errResp, handleCors } from "../shared/helpers.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "GET") return errResp("Method not allowed", 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return errResp("Unauthorized", 401);

  const supabase = getServiceClient();
  const token = authHeader.replace("Bearer ", "");

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return errResp("Unauthorized", 401);

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, vip_level, balance, is_banned, deleted_at")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_banned || profile.deleted_at) {
    return errResp("Account not available", 403);
  }

  // Get all VIP levels
  const { data: levels } = await supabase
    .from("vip_levels")
    .select("*")
    .order("sort_order");

  // Get current level details
  const { data: currentLevel } = await supabase
    .from("vip_levels")
    .select("*")
    .eq("name", profile.vip_level)
    .single();

  return jsonResp({
    levels: levels ?? [],
    current_level: currentLevel,
    balance: profile.balance,
  });
});
