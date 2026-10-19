import { json, fail, cors, client, admin } from "../_shared/core.ts";

function sanitizeCsvCell(v: unknown): string {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) {
    s = "'" + s;
  }
  if (/[",\n\r]/.test(s)) {
    return `"${s.replaceAll('"', '""')}"`;
  }
  return s;
}

Deno.serve(async (req) => {
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
    return fail("Gagal mengekspor data CSV", 500);
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

  const header = [
    "Peringkat",
    "Nama",
    "Kelas",
    "Reflex Rush",
    "Memory Rush",
    "Quiz Blitz",
    "Total",
    "Akurasi (%)",
    "Waktu",
  ];
  const lines = [header.map(sanitizeCsvCell).join(",")];

  validEntries.forEach((entry, idx) => {
    const row = [
      idx + 1,
      entry.display_name,
      entry.class_name,
      entry.reflex_score,
      entry.memory_score,
      entry.quiz_score,
      entry.total_score,
      entry.average_accuracy,
      entry.completed_at,
    ];
    lines.push(row.map(sanitizeCsvCell).join(","));
  });

  return json({ csv: lines.join("\n") });
});
