import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const allowedOrigins = new Set(
  (Deno.env.get("FRONTEND_ORIGINS") ||
    "http://localhost:5173,https://scc-game-arena.vercel.app")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const corsHeaders = (req: Request): HeadersInit => {
  const origin = req.headers.get("Origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type, idempotency-key, x-supabase-api-version",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    Vary: "Origin",
  };
  if (origin && allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
};
export const cors = corsHeaders;
export const json = (body: unknown, status = 200, req: Request) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
export const fail = (error: string, status = 400, details?: unknown, req?: Request) =>
  json({ error, ...(details ? { details } : {}) }, status, req || new Request("http://localhost"));
export function client() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}
export async function body(req: Request) {
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > 32768) throw Error("BODY_TOO_LARGE");
  if (!req.body) return {};
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > 32768) throw Error("BODY_TOO_LARGE");
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}
export function token(req: Request, b?: any) {
  const bodyToken = b?.participant_token || b?.token;
  if (typeof bodyToken === "string" && bodyToken.length >= 32) return bodyToken;
  const h = req.headers.get("authorization") || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}
export async function participant(req: Request, b?: any) {
  const raw = token(req, b);
  if (typeof raw !== "string" || raw.length < 32) return null;
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(raw),
  );
  const hex = [...new Uint8Array(hash)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
  const db = client();
  const { data } = await db
    .from("participants")
    .select("*")
    .eq("entry_token_hash", hex)
    .is("revoked_at", null)
    .gt("token_expires_at", new Date().toISOString())
    .maybeSingle();
  return data;
}
export async function admin(req: Request) {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  const db = client();
  const {
    data: { user },
  } = await db.auth.getUser(h.slice(7));
  if (!user) return null;
  const { data } = await db
    .from("admin_users")
    .select("id,role")
    .eq("id", user.id)
    .maybeSingle();
  return data ? user : null;
}
export const gameOrder = ["reflex", "memory", "quiz"];
export async function logParticipantActivity(req: Request, value: { event_id?: string; participant_id?: string | null; actor_type: "participant" | "admin"; actor_admin_id?: string | null; activity_type: string; game_key?: string | null; status?: string | null; metadata?: Record<string, unknown> }) {
  const userAgent = req.headers.get("user-agent") || "";
  const device_summary = /Mobile|Android|iPhone/i.test(userAgent) ? "mobile" : "desktop";
  const { error } = await client().from("participant_activity").insert({ ...value, device_summary, metadata: value.metadata || {} });
  if (error) throw error;
}
export function score(game: string, m: any, answers: any[] = []) {
  if (game === "reflex") {
    if (
      !Number.isInteger(m?.duration_ms) || m.duration_ms < 0 || m.duration_ms > 3600000 ||
      !Number.isInteger(m?.targets_hit) ||
      !Number.isInteger(m?.targets_missed) ||
      !Number.isInteger(m?.traps_hit) ||
      m.targets_hit < 0 ||
      m.targets_missed < 0 ||
      m.traps_hit < 0 ||
      m.targets_hit + m.targets_missed !== 20
    )
      throw Error("INVALID_METRICS");
    return {
      score: Math.max(0, Math.min(200, m.targets_hit * 10 - m.traps_hit * 5)),
      accuracy: m.targets_hit * 5,
      duration: m.duration_ms,
      metrics: m,
    };
  }
  if (game === "memory") {
    if (
      !Number.isInteger(m?.rounds_correct) ||
      !Number.isInteger(m?.mistakes) ||
      m.rounds_correct < 0 ||
      m.rounds_correct > 8 ||
      m.mistakes < 0 ||
      m.mistakes > 3 ||
      !Number.isInteger(m?.duration_ms) || m.duration_ms < 0 || m.duration_ms > 3600000
    )
      throw Error("INVALID_METRICS");
    return {
      score: m.rounds_correct * 25,
      accuracy: m.rounds_correct * 12.5,
      duration: m.duration_ms,
      metrics: m,
    };
  }
  const correct = answers.filter((x) => x.correct).length;
  return {
    score: correct * 20,
    accuracy: correct * 10,
    duration: Math.max(...answers.map((x) => x.response_time_ms || 0), 0),
    metrics: { correct, answered: answers.length },
  };
}
export function csv(v: unknown) {
  const s = String(v ?? "");
  return /^[=+\-@]/.test(s) ? "'" + s : s.replaceAll('"', '""');
}
