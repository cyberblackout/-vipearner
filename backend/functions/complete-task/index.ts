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
  const sessionId = extractId(req, "complete-task", body.id || body.sessionId);

  if (!sessionId) return errResp("Session ID required");

  // Get session
  const { data: session, error: sessionErr } = await supabase
    .from("task_sessions")
    .select("*, task:tasks(*)")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionErr || !session) return errResp("Session not found", 404);

  if (session.completed) return errResp("Task already completed");

  if (new Date(session.expires_at) < new Date()) {
    return errResp("Session expired");
  }

  // Check elapsed time
  const elapsedSeconds =
    (Date.now() - new Date(session.started_at).getTime()) / 1000;

  if (elapsedSeconds < session.task.wait_seconds) {
    return errResp("Task timer not complete");
  }

  // Check if already completed today
  const todayStr = new Date().toISOString().split("T")[0];

  const { data: existingLog } = await supabase
    .from("task_logs")
    .select("id")
    .eq("user_id", user.id)
    .eq("task_id", session.task_id)
    .gte("completed_at", `${todayStr}T00:00:00Z`)
    .lte("completed_at", `${todayStr}T23:59:59Z`)
    .single();

  if (existingLog) return errResp("Task already completed today");

  // Check if user is banned before crediting
  const { data: preProfile } = await supabase
    .from("profiles")
    .select("is_banned, deleted_at")
    .eq("id", user.id)
    .single();

  if (preProfile?.is_banned || preProfile?.deleted_at) {
    return errResp("Account not available", 403);
  }

  const reward = session.task.reward;

  // Mark session completed atomically (prevents concurrent reward duplication)
  const { data: updatedSession, error: completeErr } = await supabase
    .from("task_sessions")
    .update({ completed: true })
    .eq("id", sessionId)
    .eq("completed", false)
    .select()
    .single();

  if (completeErr || !updatedSession) {
    return errResp("Task session was already completed or expired", 409);
  }

  // Create task log
  const { error: logErr } = await supabase.from("task_logs").insert({
    user_id: user.id,
    task_id: session.task_id,
    session_id: sessionId,
    reward_earned: reward,
    completed_at: new Date().toISOString(),
  });

  if (logErr) return errResp("Failed to log task", 500);

  // Atomic balance increment via RPC
  const { error: updateErr } = await supabase.rpc("increment_balance", {
    p_user_id: user.id,
    p_amount: reward,
  });

  if (updateErr) return errResp("Failed to credit reward", 500);

  // Create transaction
  await supabase.from("transactions").insert({
    user_id: user.id,
    amount: reward,
    direction: "+",
    type: "task_reward",
    status: "success",
  });

  // Create notification
  await supabase.from("notifications").insert({
    user_id: user.id,
    type: "task_reward",
    title: "Task Completed!",
    body: `You earned GHS ${reward} for completing ${session.task.title}`,
  });

  const { data: updatedProfile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();

  return jsonResp({
    new_balance: updatedProfile?.balance ?? 0,
    reward,
  });
});
