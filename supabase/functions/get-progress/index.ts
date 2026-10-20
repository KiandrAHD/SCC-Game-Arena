import { json as rawJson, fail as rawFail, cors, client, participant } from "../_shared/core.ts";
Deno.serve(async (req) => {
  const json = (payload: unknown, status = 200) => rawJson(payload, status, req);
  const fail = (message: string, status = 400, details?: unknown) => rawFail(message, status, details, req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "POST") return fail("Method not allowed", 405);
  let b = {};
  try {
    b = await req.json();
  } catch {
    /* ignore empty */
  }
  const p = await participant(req, b);
  if (!p) return fail("Token tidak valid atau sudah expired", 401);

  const db = client();
  const { data: results, error: resultsError } = await db
    .from("game_results")
    .select("game_key,score,accuracy,completed_at")
    .eq("participant_id", p.id);
  if (resultsError) return fail("Gagal membaca hasil game", 500);
  const { data: sessions, error: sessionsError } = await db
    .from("game_sessions")
    .select("game_key,status")
    .eq("participant_id", p.id);
  if (sessionsError) return fail("Gagal membaca sesi game", 500);

  const resMap = Object.fromEntries(
    (results || []).map((r) => [r.game_key, r]),
  );
  const sessMap = Object.fromEntries(
    (sessions || []).map((s) => [s.game_key, s]),
  );

  const reflexRes = resMap["reflex"];
  const memoryRes = resMap["memory"];
  const quizRes = resMap["quiz"];

  return json({
    participant_id: p.id,
    display_name: p.display_name,
    status: p.status,
    games: {
      reflex: reflexRes
        ? {
            completed: true,
            score: reflexRes.score,
            accuracy: Number(reflexRes.accuracy),
            completed_at: reflexRes.completed_at,
          }
        : { completed: false },
      memory: memoryRes
        ? {
            completed: true,
            score: memoryRes.score,
            accuracy: Number(memoryRes.accuracy),
            completed_at: memoryRes.completed_at,
          }
        : {
            completed: false,
            current_round: 1,
          },
      quiz: quizRes
        ? {
            completed: true,
            score: quizRes.score,
            accuracy: Number(quizRes.accuracy),
            completed_at: quizRes.completed_at,
          }
        : { completed: false },
    },
  });
});
