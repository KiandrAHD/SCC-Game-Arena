import { json, fail, cors, client, admin, body } from '../_shared/core.ts'
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors(req) })
  if (req.method !== 'POST') return fail('Method not allowed', 405, undefined, req)
  if (!await admin(req)) return fail('Unauthorized', 401, undefined, req)
  let b: any = {}; try { b = await body(req) } catch { return fail('Invalid JSON body', 400, undefined, req) }
  const limit = Math.min(100, Math.max(1, Number(b?.limit) || 50))
  const page = Math.max(1, Number(b?.page) || 1)
  const from = (page - 1) * limit
  const { data, count, error } = await client().from('participant_activity').select('id,participant_id,activity_type,game_key,status,device_summary,metadata,created_at,participants(display_name)', { count: 'exact' }).order('created_at', { ascending: false }).range(from, from + limit - 1)
  if (error) return fail('Gagal mengambil aktivitas peserta', 500, undefined, req)
  return json({ activities: data || [], pagination: { page, limit, total: count || 0, total_pages: Math.max(1, Math.ceil((count || 0) / limit)) } }, 200, req)
})
