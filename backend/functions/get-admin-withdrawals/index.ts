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

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!adminProfile?.is_admin) return errResp("Admin access required", 403);

  const url = new URL(req.url);
  const rawPage = parseInt(url.searchParams.get("page") ?? "1");
  const rawLimit = parseInt(url.searchParams.get("limit") ?? "20");
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const limit = isNaN(rawLimit) || rawLimit < 1 ? 20 : Math.min(rawLimit, 100);
  const offset = (page - 1) * limit;
  const status = url.searchParams.get("status");

  let query = supabase
    .from("withdrawals")
    .select(`
      *, user:profiles!withdrawals_user_id_fkey(id, phone, display_name, balance)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data: withdrawals, count } = await query;

  return jsonResp({
    data: withdrawals ?? [],
    total: count ?? 0,
    page,
    limit,
  });
});
