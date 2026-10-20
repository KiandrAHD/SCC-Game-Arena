import { json, fail, cors, client, admin, body } from '../_shared/core.ts'
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors(req) })
  if (req.method !== 'POST') return fail('Method not allowed', 405, undefined, req)
  const actor = await admin(req); if (!actor) return fail('Unauthorized', 401, undefined, req)
  let b: any; try { b = await body(req) } catch { return fail('Invalid JSON body', 400, undefined, req) }
  if (typeof b?.participant_id !== 'string') return fail('participant_id wajib diisi', 400, undefined, req)
  const db = client(); const { data: participant, error: readError } = await db.from('participants').select('id,event_id,display_name,class_name,attendance_number').eq('id', b.participant_id).maybeSingle(); if (readError || !participant) return fail('Peserta tidak ditemukan', 404, undefined, req)
  const { error } = await db.from('participants').delete().eq('id', participant.id); if (error) return fail('Peserta tidak dapat dihapus karena integritas data', 409, undefined, req)
  await db.from('admin_activity').insert({ admin_id: actor.id, action: 'delete_participant', target_type: 'participant', target_id: participant.id, payload: { display_name: participant.display_name, class_name: participant.class_name, attendance_number: participant.attendance_number } })
  return json({ ok: true }, 200, req)
})
