import { json, fail, cors, client, admin, body } from '../_shared/core.ts'
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors(req) })
  if (req.method !== 'POST') return fail('Method not allowed', 405, undefined, req)
  const actor = await admin(req); if (!actor) return fail('Unauthorized', 401, undefined, req)
  let b: any; try { b = await body(req) } catch { return fail('Invalid JSON body', 400, undefined, req) }
  if (typeof b?.participant_id !== 'string' || typeof b?.full_name !== 'string' || b.full_name.trim().length < 1 || b.full_name.trim().length > 40 || !Number.isInteger(b.attendance_number) || b.attendance_number < 1 || b.attendance_number > 40 || typeof b?.class_name !== 'string' || !/^IX[A-H]$/.test(b.class_name.trim())) return fail('Data peserta tidak valid', 400, undefined, req)
  const db = client(); const { data: before, error: readError } = await db.from('participants').select('id,event_id,full_name,attendance_number,class_name').eq('id', b.participant_id).maybeSingle(); if (readError || !before) return fail('Peserta tidak ditemukan', 404, undefined, req)
  const { data: updated, error } = await db.from('participants').update({ full_name: b.full_name.trim(), display_name: b.full_name.trim(), attendance_number: b.attendance_number, class_name: b.class_name.trim() }).eq('id', b.participant_id).select('id,display_name,full_name,attendance_number,class_name').single()
  if (error) return fail(error.code === '23505' ? 'Nomor absen dan kelas sudah digunakan' : 'Gagal mengubah peserta', error.code === '23505' ? 409 : 500, undefined, req)
  await db.from('admin_activity').insert({ admin_id: actor.id, action: 'update_participant', target_type: 'participant', target_id: before.id, payload: { before: { full_name: before.full_name, attendance_number: before.attendance_number, class_name: before.class_name }, after: { full_name: updated.full_name, attendance_number: updated.attendance_number, class_name: updated.class_name } } })
  return json({ participant: updated }, 200, req)
})
