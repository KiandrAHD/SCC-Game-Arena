import {
  json as rawJson,
  fail as rawFail,
  cors,
  client,
  participant,
  score as calculateScore,
} from "../_shared/core.ts";

Deno.serve(async (req) => {
  const json = (payload: unknown, status = 200) => rawJson(payload, status, req);
  const fail = (message: string, status = 400, details?: unknown) => rawFail(message, status, details, req);
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
  const idempotencyKey =
    typeof b?.idempotency_key === "string" ? b.idempotency_key.trim() : "";
  if (!["reflex", "memory", "quiz"].includes(gameKey))
    return fail("Game key tidak valid", 400);
  if (!idempotencyKey) return fail("Idempotency key wajib disertakan", 400);

  const db = client();

  // Hash the incoming payload for idempotency mismatch verification
  const payloadStr = JSON.stringify({
    game_key: gameKey,
    metrics: b.metrics,
    answers: b.answers,
  });
  const hashBuf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(payloadStr),
  );
  const payloadHash = Array.from(new Uint8Array(hashBuf), (x) =>
    x.toString(16).padStart(2, "0"),
  ).join("");

  // Check existing idempotency key
  const { data: existingByKey } = await db
    .from("game_results")
    .select("*")
    .eq("participant_id", p.id)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  if (existingByKey) {
    if (existingByKey.payload_hash !== payloadHash) {
      return fail("Idempotency key reuse dengan payload berbeda ditolak", 422);
    }
    return json({
      success: true,
      score: existingByKey.score,
      accuracy: Number(existingByKey.accuracy),
      completed_at: existingByKey.completed_at,
    });
  }

  // Check if participant already has a result for this game
  const { data: existingGameResult } = await db
    .from("game_results")
    .select("*")
    .eq("participant_id", p.id)
    .eq("game_key", gameKey)
    .maybeSingle();
  if (existingGameResult) {
    return json(
      {
        error: "Hasil untuk game ini sudah tersimpan",
        existing_result: {
          score: existingGameResult.score,
          completed_at: existingGameResult.completed_at,
        },
      },
      409,
    );
  }

  // Verify active session exists
  const { data: session } = await db
    .from("game_sessions")
    .select("*")
    .eq("participant_id", p.id)
    .eq("game_key", gameKey)
    .maybeSingle();
  if (!session || session.status !== "started") {
    return fail("Sesi game belum dimulai atau sudah tidak valid", 400);
  }
  const startedAt = new Date(session.started_at).getTime();
  if (startedAt > Date.now() + 30_000)
    return fail("Waktu sesi tidak valid", 400);
  const maxDurationMs = gameKey === "reflex" ? 120000 : gameKey === "memory" ? 300000 : 600000;
  if (Date.now() - startedAt > maxDurationMs)
    return fail("Waktu permainan telah habis", 408);

  // Calculate score and accuracy server-side
  let calculated: {
    score: number;
    accuracy: number;
    duration: number;
    metrics: any;
  };
  try {
    if (gameKey === "quiz") {
      const answers: any[] = Array.isArray(b?.answers) ? b.answers : [];
      const sessionQuestionIds = Array.isArray(session.challenge_metadata?.question_ids)
        ? session.challenge_metadata.question_ids
        : [];
      if (answers.length !== sessionQuestionIds.length || answers.length === 0)
        return fail("Jumlah jawaban kuis tidak valid", 400);

      const qIds = answers.map((a) => a.question_id);
      if (
        new Set(qIds).size !== sessionQuestionIds.length ||
        answers.some(
          (a) =>
            typeof a?.question_id !== "string" ||
            !Number.isInteger(a?.selected_index) ||
            a.selected_index < -1 ||
            a.selected_index > 20 ||
            !Number.isInteger(a?.response_time_ms) ||
            a.response_time_ms < 0 ||
            a.response_time_ms > 10000,
        )
      ) {
        return fail("Jawaban kuis tidak valid", 400);
      }
      const { data: dbQuestions } = await db
        .from("quiz_questions")
        .select("id,options,correct_option_index")
        .eq("event_id", p.event_id)
        .eq("is_active", true)
        .in("id", qIds);
      if (!dbQuestions || dbQuestions.length !== sessionQuestionIds.length)
        return fail("Pertanyaan tidak valid", 400);

      if (
        sessionQuestionIds.length < 1 ||
        new Set(sessionQuestionIds).size !== sessionQuestionIds.length ||
        qIds.length !== sessionQuestionIds.length ||
        qIds.some((id: string) => !sessionQuestionIds.includes(id)) ||
        sessionQuestionIds.some((id: string) => !qIds.includes(id))
      )
        return fail("Pertanyaan tidak sesuai sesi", 400);

      const dbMap = new Map(
        dbQuestions.map((q) => [q.id, q]),
      );
      const evaluatedAnswers = answers.map((ans) => {
        const question = dbMap.get(ans.question_id);
        const correctIdx = question?.correct_option_index;
        const options = Array.isArray(question?.options) ? question.options : [];
        if (ans.selected_index !== -1 && (ans.selected_index < 0 || ans.selected_index >= options.length)) {
          throw new Error("INVALID_OPTION");
        }
        return {
          ...ans,
          correct: ans.selected_index !== -1 && correctIdx !== undefined && ans.selected_index === correctIdx,
        };
      });

      calculated = calculateScore("quiz", null, evaluatedAnswers);
    } else {
      calculated = calculateScore(gameKey, b?.metrics);
    }
  } catch (err: any) {
    return fail(`Validasi skor gagal: ${err.message}`, 400);
  }

  // Call atomic complete_game RPC
  const { data: completedResult, error: rpcError } = await db.rpc(
    "complete_game",
    {
      p_participant: p.id,
      p_game: gameKey,
      p_score: calculated.score,
      p_accuracy: calculated.accuracy,
      p_duration: calculated.duration || 0,
      p_metrics: calculated.metrics || {},
      p_key: idempotencyKey,
      p_hash: payloadHash,
    },
  );

  if (rpcError) {
    console.error("complete_game failed", { code: rpcError.code, message: rpcError.message });
    return fail("Gagal menyimpan hasil permainan", 500);
  }

  return json({
    success: true,
    score: completedResult.score,
    accuracy: Number(completedResult.accuracy),
    completed_at: completedResult.completed_at,
  });
});
