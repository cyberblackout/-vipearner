import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export function getServiceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

export function verifyInternalAuth(req: Request): boolean {
  const secret = Deno.env.get("INTERNAL_API_SECRET");
  if (!secret) return false;
  const authHeader = req.headers.get("X-Internal-Secret");
  return authHeader === secret;
}

export function generateSecureOTP(): string {
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += array[i] % 10;
  }
  return code;
}

export async function hashOTP(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyOTP(code: string, hash: string): Promise<boolean> {
  const computed = await hashOTP(code);
  return computed === hash;
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("233")) return `+${digits}`;
  if (digits.startsWith("0")) return `+233${digits.slice(1)}`;
  return `+${digits}`;
}

const REFERRAL_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generateReferralCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += REFERRAL_CHARS[Math.floor(Math.random() * REFERRAL_CHARS.length)];
  }
  return code;
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE, PATCH",
};

export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}

export function extractId(req: Request, fnName: string, bodyId?: string | null): string | null {
  if (bodyId && typeof bodyId === "string" && bodyId.trim().length > 0) {
    return bodyId.trim();
  }
  const url = new URL(req.url);
  const queryId = url.searchParams.get("id") || url.searchParams.get("userId") || url.searchParams.get("withdrawalId");
  if (queryId) return queryId.trim();

  const segments = url.pathname.split("/").filter(Boolean);
  const fnIdx = segments.indexOf(fnName);
  if (fnIdx !== -1 && fnIdx + 1 < segments.length) {
    return segments[fnIdx + 1];
  }
  const last = segments[segments.length - 1];
  if (last && last !== fnName && last !== "v1" && last !== "functions") {
    return last;
  }
  return null;
}

export function jsonResp(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

export function errResp(message: string, status = 400) {
  return jsonResp({ error: message }, status);
}
