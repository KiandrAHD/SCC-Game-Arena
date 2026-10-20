import { json as rawJson, fail as rawFail, cors, client, admin } from "../_shared/core.ts";

Deno.serve(async (req) => {
  const json = (payload: unknown, status = 200) => rawJson(payload, status, req);
  const fail = (message: string, status = 400, details?: unknown) => rawFail(message, status, details, req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "GET") return fail("Method not allowed", 405);

  const adm = await admin(req);
  if (!adm) return fail("Unauthorized", 401);

  const db = client();

  const { data: participants, error } = await db
    .from("participants")
    .select(
      "id,display_name,class_name,completed_at,game_results(game_key,score,accuracy,completed_at)",
    )
    .eq("status", "completed");

  if (error) {
    return fail("Gagal mengambil leaderboard admin", 500);
  }

  const validEntries: Array<{
    display_name: string;
    class_name: string;
    reflex_score: number;
    memory_score: number;
    quiz_score: number;
    total_score: number;
    average_accuracy: number;
    completed_at: string;
  }> = [];

  for (const p of participants || []) {
    const results = (p.game_results as any[]) || [];
    const resultMap: Record<
      string,
      { score: number; accuracy: number; completed_at: string }
    > = {};

    for (const r of results) {
      resultMap[r.game_key] = {
        score: Number(r.score),
        accuracy: Number(r.accuracy),
        completed_at: r.completed_at,
      };
    }

    if (resultMap["reflex"] && resultMap["memory"] && resultMap["quiz"]) {
      const reflex = resultMap["reflex"];
      const memory = resultMap["memory"];
      const quiz = resultMap["quiz"];

      const totalScore = reflex.score + memory.score + quiz.score;
      const avgAccuracy =
        Math.round(
          ((reflex.accuracy + memory.accuracy + quiz.accuracy) / 3) * 10,
        ) / 10;
      const completedAt = p.completed_at || quiz.completed_at;

      validEntries.push({
        display_name: p.display_name,
        class_name: p.class_name,
        reflex_score: reflex.score,
        memory_score: memory.score,
        quiz_score: quiz.score,
        total_score: totalScore,
        average_accuracy: avgAccuracy,
        completed_at: completedAt,
      });
    }
  }

  // Tie break sorting:
  // 1. total_score DESC
  // 2. average_accuracy DESC
  // 3. completed_at ASC
  validEntries.sort((a, b) => {
    if (b.total_score !== a.total_score) return b.total_score - a.total_score;
    if (b.average_accuracy !== a.average_accuracy)
      return b.average_accuracy - a.average_accuracy;
    return (
      new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
    );
  });

  const leaderboard = validEntries.map((entry, idx) => ({
    rank: idx + 1,
    ...entry,
  }));

  return json({ leaderboard });
});
