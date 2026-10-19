import { json, fail, cors, client } from '../_shared/core.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors(req) });
  if (req.method !== 'GET') return fail('Method not allowed', 405);

  const url = new URL(req.url);
  const rawLimit = Number(url.searchParams.get('limit') || 100);
  const limit = Math.max(1, Math.min(300, Number.isInteger(rawLimit) ? rawLimit : 100));

  const db = client();
  const { data: event } = await db.from("events").select("id").eq("status", "open").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!event) return json({ leaderboard: [], updated_at: new Date().toISOString() });
  const { data, error } = await db
    .from('public_leaderboard')
    .select('rank,display_name,class_name,total_score,average_accuracy')
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
    average_accuracy: Number(row.average_accuracy)
  }));

  return json({
    leaderboard,
    updated_at: new Date().toISOString()
  });
});
