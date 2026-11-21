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

  const url = new URL(req.url);
  const rawPage = parseInt(url.searchParams.get("page") ?? "1");
  const rawLimit = parseInt(url.searchParams.get("limit") ?? "20");
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const limit = isNaN(rawLimit) || rawLimit < 1 ? 20 : Math.min(rawLimit, 100);
  const offset = (page - 1) * limit;

  const { data: notifications, count } = await supabase
    .from("notifications")
    .select("id, type, title, body, is_read, metadata, created_at", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return jsonResp({
    data: notifications ?? [],
    total: count ?? 0,
    page,
    limit,
  });
});
