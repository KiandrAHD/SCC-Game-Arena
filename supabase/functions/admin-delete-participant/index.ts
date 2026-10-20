import { json, fail, cors, client, admin, body } from '../_shared/core.ts'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MAX_IDS = 100

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors(req) })
  if (req.method !== 'POST') return fail('Method not allowed', 405, undefined, req)
  const actor = await admin(req)
  if (!actor) return fail('Unauthorized', 401, undefined, req)
  let b: any
  try { b = await body(req) } catch { return fail('Invalid JSON body', 400, undefined, req) }
  const rawIds = Array.isArray(b?.participant_ids) ? b.participant_ids : [b?.participant_id]
  if (!rawIds.length || rawIds.some((id: unknown) => typeof id !== 'string' || !UUID.test(id))) return fail('participant_ids harus berisi UUID valid', 400, undefined, req)
  const ids = [...new Set(rawIds)]
  if (ids.length > MAX_IDS) return fail(`Maksimal ${MAX_IDS} peserta per permintaan`, 400, undefined, req)

  const db = client()
  const { data: participants, error: readError } = await db.from('participants').select('id,display_name,class_name,attendance_number').in('id', ids)
  if (readError) return fail('Gagal membaca peserta', 500, undefined, req)
  const found = participants || []
  const foundIds = new Set(found.map((participant) => participant.id))
  const missing = ids.filter((id) => !foundIds.has(id))
  if (!found.length) return fail('Peserta tidak ditemukan', 404, { missing }, req)

  const { error: deleteError } = await db.from('participants').delete().in('id', found.map((participant) => participant.id))
  if (deleteError) return fail('Peserta tidak dapat dihapus karena integritas data', 409, undefined, req)
  const { error: auditError } = await db.from('admin_activity').insert(found.map((participant) => ({ admin_id: actor.id, action: 'delete_participant', target_type: 'participant', target_id: participant.id, payload: { display_name: participant.display_name, class_name: participant.class_name, attendance_number: participant.attendance_number } })))
  if (auditError) return fail('Peserta dihapus, tetapi audit log gagal disimpan', 500, { deleted: found.map((participant) => participant.id) }, req)
  return json({ ok: true, deleted: found.map((participant) => participant.id), failed: missing }, 200, req)
})
