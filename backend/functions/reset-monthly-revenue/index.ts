import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getServiceClient, verifyInternalAuth, jsonResp, errResp, handleCors } from "../shared/helpers.ts";

// Scheduled via pg_cron: '0 0 1 * *' (1st of month midnight UTC)
Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (!verifyInternalAuth(req)) return errResp("Unauthorized", 401);

  const supabase = getServiceClient();

  const { error } = await supabase
    .rpc("reset_all_monthly_revenue");

  if (error) {
    await supabase
      .from("profiles")
      .update({ monthly_revenue: 0 })
      .not("monthly_revenue", "eq", 0);
  }

  return jsonResp({ reset: true, timestamp: new Date().toISOString() });
});
