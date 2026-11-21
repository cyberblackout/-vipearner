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

  // Check admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return errResp("Admin access required", 403);

  // Use database-level aggregation instead of loading all rows
  const todayStr = new Date().toISOString().split("T")[0];

  const [usersCount, balanceAgg, depositsAgg, pendingWithdrawals, todayTasks, revenueAgg] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).is("deleted_at", null),
      supabase.rpc("get_total_balance"),
      supabase.rpc("get_total_deposits"),
      supabase
        .from("withdrawals")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("task_logs")
        .select("id", { count: "exact", head: true })
        .gte("completed_at", `${todayStr}T00:00:00Z`)
        .lte("completed_at", `${todayStr}T23:59:59Z`),
      supabase.rpc("get_total_daily_revenue"),
    ]);

  return jsonResp({
    total_users: usersCount.count ?? 0,
    total_balance: balanceAgg.data ?? 0,
    total_deposits: depositsAgg.data ?? 0,
    pending_withdrawals: pendingWithdrawals.count ?? 0,
    today_tasks: todayTasks.count ?? 0,
    today_revenue: revenueAgg.data ?? 0,
  });
});
