import { json, fail, cors, client, participant } from "../_shared/core.ts";
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "POST") return fail("Method not allowed", 405);
  let b: any = {};
  try {
    b = await req.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }
  const p = await participant(req, b);
  if (!p) return fail("Unauthorized", 401);

  const gameKey = b?.game_key;
  if (!["reflex", "memory", "quiz"].includes(gameKey))
    return fail("Invalid game key", 400);

  const db = client();
  const { data: event } = await db
    .from("events")
    .select("status")
    .eq("id", p.event_id)
    .single();
  if (event?.status !== "open") return fail("Kompetisi belum dibuka atau sudah ditutup", 403);

  const { data: priorResults } = await db
    .from("game_results")
    .select("game_key")
    .eq("participant_id", p.id);
  const done = new Set((priorResults || []).map((r) => r.game_key));

  if (p.status === "completed" || p.status === "disqualified")
    return fail("Peserta tidak dapat memulai game", 409);
  if (done.has(gameKey)) return fail("Game sudah pernah diselesaikan", 409);

  const { data: existingSession } = await db
    .from("game_sessions")
    .select("id,status,started_at")
    .eq("participant_id", p.id)
    .eq("game_key", gameKey)
    .maybeSingle();
  if (existingSession?.status === "started") {
    return json({
      session_id: existingSession.id,
      game_key: gameKey,
      started_at: existingSession.started_at,
    });
  }
  if (existingSession) return fail("Sesi game sudah selesai", 409);
  if (gameKey === "memory" && !done.has("reflex"))
    return fail("Harus menyelesaikan Reflex Rush terlebih dahulu", 400);
  if (gameKey === "quiz" && (!done.has("reflex") || !done.has("memory")))
    return fail("Harus menyelesaikan Memory Rush terlebih dahulu", 400);

  const { data: settings } = await db
    .from("competition_settings")
    .select("quiz_questions_count")
    .eq("event_id", p.event_id)
    .maybeSingle();
  const quizCount = settings?.quiz_questions_count ?? 10;

  let challengeMetadata: Record<string, unknown> = {};
  let quizQuestionsPayload: Array<{
    id: string;
    question: string;
    options: unknown;
  }> = [];

  if (gameKey === "quiz") {
    const { data: questions } = await db
      .from("quiz_questions")
      .select("id,question,options")
      .eq("event_id", p.event_id)
      .eq("is_active", true)
      .limit(quizCount);
    if (!questions || questions.length < quizCount)
      return fail("Bank soal tidak mencukupi", 500);
    challengeMetadata = { question_ids: questions.map((q) => q.id) };
    quizQuestionsPayload = questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }));
  }

  const { data: session, error } = await db
    .from("game_sessions")
    .insert({
      participant_id: p.id,
      game_key: gameKey,
      status: "started",
      started_at: new Date().toISOString(),
      challenge_metadata: challengeMetadata,
    })
    .select("id,started_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: existing } = await db
        .from("game_sessions")
        .select("id,status,started_at")
        .eq("participant_id", p.id)
        .eq("game_key", gameKey)
        .maybeSingle();
      if (existing?.status === "started") {
        return json({ session_id: existing.id, game_key: gameKey, started_at: existing.started_at });
      }
    }
    return fail("Gagal memulai sesi game", 500);
  }

  const nextStatus =
    gameKey === "reflex"
      ? "playing_reflex"
      : gameKey === "memory"
        ? "playing_memory"
        : "playing_quiz";
  await db.from("participants").update({ status: nextStatus }).eq("id", p.id);

  if (gameKey === "quiz") {
    return json({
      session_id: session.id,
      game_key: gameKey,
      questions: quizQuestionsPayload,
    });
  }
  return json({
    session_id: session.id,
    game_key: gameKey,
    started_at: session.started_at,
  });
});
