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

  // Get user profile with VIP level
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, vip_level, checkin_streak, is_banned, deleted_at")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_banned || profile.deleted_at) {
    return errResp("Account not available", 403);
  }

  // Get VIP level details
  const { data: vipLevel } = await supabase
    .from("vip_levels")
    .select("sort_order, daily_tasks, reward_per_task")
    .eq("name", profile.vip_level)
    .single();

  const vipSortOrder = vipLevel?.sort_order ?? 0;
  const dailyLimit = vipLevel?.daily_tasks ?? 5;

  // Get today's completed tasks (Africa/Accra timezone)
  const now = new Date();
  const accraOffset = 0; // UTC+0
  const accraDate = new Date(now.getTime() + accraOffset * 60 * 60 * 1000);
  const todayStr = accraDate.toISOString().split("T")[0];

  const { data: completedLogs } = await supabase
    .from("task_logs")
    .select("task_id")
    .eq("user_id", user.id)
    .gte("completed_at", `${todayStr}T00:00:00Z`)
    .lte("completed_at", `${todayStr}T23:59:59Z`);

  const completedTaskIds = (completedLogs ?? []).map((l) => l.task_id);
  const todayCount = completedTaskIds.length;

  // Get available tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("is_active", true)
    .lte("min_vip_sort", vipSortOrder)
    .not("id", "in", `(${completedTaskIds.join(",") || "null"})`)
    .order("display_order");

  return jsonResp({
    tasks: tasks ?? [],
    remaining: Math.max(0, dailyLimit - todayCount),
    limit: dailyLimit,
    today_count: todayCount,
    reward_per_task: vipLevel?.reward_per_task ?? 0.2,
  });
});
