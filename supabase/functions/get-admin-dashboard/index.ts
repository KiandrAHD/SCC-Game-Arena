import { json as rawJson, fail as rawFail, cors, client, admin } from "../_shared/core.ts";

Deno.serve(async (req) => {
  const json = (payload: unknown, status = 200) => rawJson(payload, status, req);
  const fail = (message: string, status = 400, details?: unknown) => rawFail(message, status, details, req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "GET") return fail("Method not allowed", 405);

  const adm = await admin(req);
  if (!adm) return fail("Unauthorized", 401);

  const db = client();

  // 1. Event
  const { data: event, error: eventError } = await db
    .from("events")
    .select("id,name,status")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (eventError) {
    console.error("get-admin-dashboard event query failed", { code: eventError.code });
    return fail("Gagal membaca event kompetisi", 500);
  }
  if (!event) return fail("Event kompetisi tidak ditemukan", 404);

  const eventName = event.name;
  const eventStatus = event.status;

  // 2. Statistics
  const { data: participants, error: participantsError } = await db
    .from("participants")
    .select("id,status")
    .eq("event_id", event.id);

  if (participantsError) {
    console.error("get-admin-dashboard participants query failed", { code: participantsError.code });
    return fail("Gagal membaca peserta", 500);
  }

  const allParts = participants;
  const total = allParts.length;
  let completed = 0;
  let inProgress = 0;
  let notStarted = 0;

  for (const p of allParts) {
    if (p.status === "completed") completed++;
    else if (p.status === "registered") notStarted++;
    else if (
      ["playing_reflex", "playing_memory", "playing_quiz"].includes(p.status)
    )
      inProgress++;
  }

  // 3. Top 10 & Average Score from Leaderboard
  const { data: lbData, error: leaderboardError } = await db
    .from("public_leaderboard")
    .select("rank,display_name,total_score")
    .eq("event_id", event.id)
    .order("rank", { ascending: true })
    .limit(10);

  if (leaderboardError) {
    console.error("get-admin-dashboard leaderboard query failed", { code: leaderboardError.code });
    return fail("Gagal membaca leaderboard", 500);
  }

  const top10 = lbData.map((row) => ({
    rank: Number(row.rank),
    display_name: row.display_name,
    total_score: Number(row.total_score),
  }));

  // Average score of completed participants
  let averageScore = 0;
  if (completed > 0) {
    const { data: allScores, error: scoresError } = await db
      .from("public_leaderboard")
      .select("total_score")
      .eq("event_id", event.id);
    if (scoresError) {
      console.error("get-admin-dashboard scores query failed", { code: scoresError.code });
      return fail("Gagal membaca skor", 500);
    }
    if (allScores.length > 0) {
      const sum = allScores.reduce(
        (acc, curr) => acc + Number(curr.total_score || 0),
        0,
      );
      averageScore = Math.round((sum / allScores.length) * 10) / 10;
    }
  }

  // 4. Recent activity: recent registrations + game completions
  const { data: recentRegs, error: registrationsError } = await db
    .from("participants")
    .select("display_name,created_at")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false })
    .limit(5);
  if (registrationsError) {
    console.error("get-admin-dashboard registrations query failed", { code: registrationsError.code });
    return fail("Gagal membaca pendaftaran terbaru", 500);
  }

  const { data: recentGames, error: gamesError } = await db
    .from("game_results")
    .select("game_key,score,completed_at,participants!inner(display_name,event_id)")
    .eq("participants.event_id", event.id)
    .order("completed_at", { ascending: false })
    .limit(5);
  if (gamesError) {
    console.error("get-admin-dashboard games query failed", { code: gamesError.code });
    return fail("Gagal membaca hasil permainan terbaru", 500);
  }

  const activities: Array<{
    type: string;
    display_name: string;
    game_key?: string;
    score?: number;
    timestamp: string;
  }> = [];

  for (const reg of recentRegs || []) {
    activities.push({
      type: "registration",
      display_name: reg.display_name,
      timestamp: reg.created_at,
    });
  }

  for (const g of recentGames || []) {
    const pName = (g.participants as any)?.display_name || "Peserta";
    activities.push({
      type: "game_completed",
      display_name: pName,
      game_key: g.game_key,
      score: g.score,
      timestamp: g.completed_at,
    });
  }

  activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
  const recentActivity = activities.slice(0, 10);

  return json({
    event: {
      name: eventName,
      status: eventStatus,
    },
    statistics: {
      total_participants: total,
      completed,
      in_progress: inProgress,
      not_started: notStarted,
      average_score: averageScore,
    },
    top_10: top10,
    recent_activity: recentActivity,
  });
});
