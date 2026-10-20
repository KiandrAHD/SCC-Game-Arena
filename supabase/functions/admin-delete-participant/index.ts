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
  const { data, error } = await db.rpc('admin_delete_participants', { p_ids: ids, p_admin: actor.id })
  if (error) {
    const message = error.message || ''
    if (message.includes('unauthorized')) return fail('Unauthorized', 401, undefined, req)
    if (message.includes('empty_ids')) return fail('Daftar peserta tidak boleh kosong', 400, undefined, req)
    if (message.includes('too_many_ids')) return fail(`Maksimal ${MAX_IDS} peserta per permintaan`, 400, undefined, req)
    return fail('Peserta tidak dapat dihapus karena integritas data', 409, { cause: message }, req)
  }
  const deleted = data?.deleted || []
  const deletedSet = new Set(deleted)
  return json({ ok: true, deleted, failed: ids.filter((id) => !deletedSet.has(id)) }, 200, req)
})
