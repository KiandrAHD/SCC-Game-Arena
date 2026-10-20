import { json as rawJson, fail as rawFail, cors, client, admin, body } from "../_shared/core.ts";

Deno.serve(async (req) => {
  const json = (payload: unknown, status = 200) => rawJson(payload, status, req);
  const fail = (message: string, status = 400, details?: unknown) => rawFail(message, status, details, req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "POST") return fail("Method not allowed", 405);

  const adm = await admin(req);
  if (!adm) return fail("Unauthorized", 401);

  let b: any = {};
  try {
    b = await body(req);
  } catch {
    b = {};
  }

  const page = Math.max(
    1,
    Number.isInteger(Number(b?.page)) ? Number(b.page) : 1,
  );
  const limit = Math.max(
    1,
    Math.min(100, Number.isInteger(Number(b?.limit)) ? Number(b.limit) : 50),
  );
  const search = typeof b?.search === "string" ? b.search.trim() : "";
  const className = typeof b?.class === "string" ? b.class.trim() : "";
  const status = typeof b?.status === "string" ? b.status.trim() : "";

  const db = client();

  let query = db
    .from("participants")
    .select(
      "id,display_name,full_name,class_name,attendance_number,status,created_at,completed_at",
      { count: "exact" },
    );

  if (search) {
    const safeSearch = search.replace(/[\\,().%_*]/g, "");
    if (safeSearch) {
      query = query.or(
        `full_name.ilike.*${safeSearch}*,display_name.ilike.*${safeSearch}*`,
      );
    }
  }
  if (className) {
    query = query.eq("class_name", className);
  }
  if (status) {
    query = query.eq("status", status);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data: participantsData, count, error } = await query;
  if (error) {
    return fail("Gagal mengambil daftar peserta", 500);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const participantIds = (participantsData || []).map((p) => p.id);
  const resultsByParticipant: Record<string, any[]> = {};

  if (participantIds.length > 0) {
    const { data: results } = await db
      .from("game_results")
      .select("participant_id,game_key,score,accuracy")
      .in("participant_id", participantIds);

    for (const res of results || []) {
      if (!resultsByParticipant[res.participant_id]) {
        resultsByParticipant[res.participant_id] = [];
      }
      resultsByParticipant[res.participant_id].push(res);
    }
  }

  const participants = (participantsData || []).map((p) => {
    const pResults = resultsByParticipant[p.id] || [];
    const scores: Record<string, number | null> = {
      reflex: null,
      memory: null,
      quiz: null,
    };
    let totalScore = 0;
    let accuracySum = 0;

    for (const r of pResults) {
      scores[r.game_key] = r.score;
      totalScore += Number(r.score || 0);
      accuracySum += Number(r.accuracy || 0);
    }

    const avgAccuracy =
      pResults.length > 0
        ? Math.round((accuracySum / pResults.length) * 10) / 10
        : 0;

    return {
      id: p.id,
      display_name: p.display_name,
      full_name: p.full_name,
      class_name: p.class_name,
      attendance_number: p.attendance_number,
      status: p.status,
      scores,
      total_score: totalScore,
      average_accuracy: avgAccuracy,
      created_at: p.created_at,
      completed_at: p.completed_at,
    };
  });

  return json({
    participants,
    pagination: {
      page,
      limit,
      total,
      total_pages: totalPages,
    },
  });
});
