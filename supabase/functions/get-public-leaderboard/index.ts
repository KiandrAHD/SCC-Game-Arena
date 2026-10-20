import { json as rawJson, fail as rawFail, cors, client } from '../_shared/core.ts';

Deno.serve(async (req) => {
  const json = (payload: unknown, status = 200) => rawJson(payload, status, req);
  const fail = (message: string, status = 400, details?: unknown) => rawFail(message, status, details, req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors(req) });
  if (req.method !== 'GET') return fail('Method not allowed', 405);

  const url = new URL(req.url);
  const rawLimit = Number(url.searchParams.get('limit') || 100);
  const limit = Math.max(1, Math.min(300, Number.isInteger(rawLimit) ? rawLimit : 100));

  const db = client();
  const { data: event } = await db.from("events").select("id").in("status", ["open", "closed"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!event) return json({ leaderboard: [], updated_at: new Date().toISOString() });
  const { data, error } = await db
    .from('public_leaderboard')
    .select('rank,display_name,class_name,total_score,average_accuracy,completed_games,is_complete')
    .eq('event_id', event.id)
    .order('rank', { ascending: true })
    .limit(limit);

  if (error) {
    return fail('Gagal mengambil leaderboard', 500);
  }

  const leaderboard = (data || []).map((row) => ({
    rank: Number(row.rank),
    display_name: row.display_name,
    class_name: row.class_name,
    total_score: Number(row.total_score),
    average_accuracy: Number(row.average_accuracy),
    completed_games: Number(row.completed_games),
    is_complete: Boolean(row.is_complete)
  }));

  return json({
    leaderboard,
    updated_at: new Date().toISOString()
  });
});
