import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  getServiceClient,
  jsonResp,
  errResp,
  handleCors,
  extractId,
} from "../shared/helpers.ts";

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

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("is_admin, is_banned")
    .eq("id", user.id)
    .single();

  if (!adminProfile?.is_admin || adminProfile?.is_banned) return errResp("Admin access required", 403);

  const body = await req.json().catch(() => ({}));
  const targetId = extractId(req, "admin-unban-user", body.id || body.userId || body.targetId);

  if (!targetId) return errResp("User ID required");

  const { error } = await supabase
    .from("profiles")
    .update({
      is_banned: false,
      ban_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetId);

  if (error) return errResp("Failed to unban user", 500);

  // Audit log
  await supabase.from("audit_log").insert({
    admin_id: user.id,
    target_id: targetId,
    action: "user_unbanned",
  });

  return jsonResp({ success: true });
});
