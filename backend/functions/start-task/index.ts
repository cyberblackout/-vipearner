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

  const body = await req.json().catch(() => ({}));
  const taskId = extractId(req, "start-task", body.id || body.taskId);

  if (!taskId) return errResp("Task ID required");

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, vip_level, is_banned, deleted_at")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_banned || profile.deleted_at) {
    return errResp("Account not available", 403);
  }

  // Get task
  const { data: task, error: taskErr } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (taskErr || !task) return errResp("Task not found", 404);

  if (!task.is_active) return errResp("Task is not active");

  // Check VIP level
  const { data: vipLevel } = await supabase
    .from("vip_levels")
    .select("sort_order, daily_tasks")
    .eq("name", profile.vip_level)
    .single();

  if ((vipLevel?.sort_order ?? 0) < task.min_vip_sort) {
    return errResp("VIP level requirement not met");
  }

  // Check daily limit
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const { count: todayCount } = await supabase
    .from("task_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("completed_at", `${todayStr}T00:00:00Z`)
    .lte("completed_at", `${todayStr}T23:59:59Z`);

  if ((todayCount ?? 0) >= (vipLevel?.daily_tasks ?? 5)) {
    return errResp("Daily task limit reached");
  }

  // Check for existing active session
  const { data: existingSession } = await supabase
    .from("task_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("task_id", taskId)
    .eq("completed", false)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (existingSession) return jsonResp(existingSession);

  // Create new session
  const { data: session, error: sessionErr } = await supabase
    .from("task_sessions")
    .insert({
      user_id: user.id,
      task_id: taskId,
      started_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (sessionErr) return errResp("Failed to start task", 500);

  return jsonResp(session);
});
