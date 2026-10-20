import { useCallback, useEffect, useMemo, useState } from 'react'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { Users, Search, Download, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

async function adminCall(name, options = {}) {
  const { data, error } = await supabase.functions.invoke(name, options)
  if (!error) return data
  let message = error.message || 'Request gagal'
  try { const body = await error.context?.json(); message = body?.error || message } catch { /* response may not be JSON */ }
  throw new Error(message)
}

export default function AdminParticipantsPage() {
  const [query, setQuery] = useState('')
  const [className, setClassName] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(new Set())
  const [deleteModal, setDeleteModal] = useState(null)
  const [countdown, setCountdown] = useState(0)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setData(await adminCall('get-admin-participants', { body: { search: query, class: className, status, page, limit: 25 } })) }
    catch (e) { setError(e.message || 'Gagal memuat peserta') }
    finally { setLoading(false) }
  }, [query, className, status, page])
  useEffect(() => { load() }, [load])

  const rows = useMemo(() => data?.participants || [], [data])
  const visibleIds = useMemo(() => rows.map((row) => row.id), [rows])
  const selectedVisible = visibleIds.filter((id) => selected.has(id))
  const allVisibleSelected = visibleIds.length > 0 && selectedVisible.length === visibleIds.length

  useEffect(() => {
    setSelected((current) => new Set([...current].filter((id) => visibleIds.includes(id))))
  }, [visibleIds])

  useEffect(() => {
    if (!deleteModal || countdown <= 0) return undefined
    const timer = window.setInterval(() => setCountdown((value) => value - 1), 1000)
    return () => window.clearInterval(timer)
  }, [deleteModal, countdown])

  const openDelete = (ids) => {
    const targets = rows.filter((row) => ids.includes(row.id))
    if (!targets.length) return
    setDeleteModal(targets)
    setCountdown(targets.length === 1 ? 3 : 5)
  }
  const closeDelete = () => { if (!deleting) { setDeleteModal(null); setCountdown(0) } }
  const confirmDelete = async () => {
    if (!deleteModal || countdown > 0 || deleting) return
    setDeleting(true); setError('')
    try {
      const result = await adminCall('admin-delete-participant', { body: deleteModal.length === 1 ? { participant_id: deleteModal[0].id } : { participant_ids: deleteModal.map((row) => row.id) } })
      if (result?.failed?.length) setError(`${result.deleted?.length || 0} berhasil dihapus, ${result.failed.length} gagal.`)
      setSelected((current) => { const next = new Set(current); deleteModal.forEach((row) => next.delete(row.id)); return next })
      setDeleteModal(null); await load()
    } catch (e) { setError(e.message || 'Gagal menghapus peserta') }
    finally { setDeleting(false) }
  }
  const toggle = (id) => setSelected((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next })
  const togglePage = () => setSelected((current) => { const next = new Set(current); visibleIds.forEach((id) => allVisibleSelected ? next.delete(id) : next.add(id)); return next })
  const update = async (e) => { e.preventDefault(); try { await adminCall('admin-update-participant', { body: { participant_id: editing.id, full_name: editing.full_name, attendance_number: Number(editing.attendance_number), class_name: editing.class_name } }); setEditing(null); load() } catch (e) { setError(e.message || 'Gagal mengubah peserta') } }
  const pagination = data?.pagination

  return <div><div className="flex items-center justify-between mb-8"><div><h1 className="text-2xl font-bold text-text">Manajemen Peserta</h1><p className="text-muted">Data peserta dan skor resmi dari server</p></div><Button variant="secondary" icon={Download} onClick={async () => { const result = await adminCall('export-csv', { method: 'GET' }); const blob = new Blob([result], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'peserta.csv'; a.click() }}>Ekspor CSV</Button></div><Card className="mb-6"><div className="flex flex-col sm:flex-row gap-3"><Input placeholder="Cari nama..." value={query} onChange={(e) => { setPage(1); setQuery(e.target.value) }} icon={Search} /><select value={className} onChange={(e) => { setPage(1); setClassName(e.target.value) }} className="px-3 border rounded-lg"><option value="">Semua kelas</option>{['IXA','IXB','IXC','IXD','IXE','IXF','IXG','IXH'].map((x) => <option key={x}>{x}</option>)}</select><select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value) }} className="px-3 border rounded-lg"><option value="">Semua status</option><option value="registered">Belum mulai</option><option value="completed">Selesai</option></select></div></Card><Card>{loading ? <p className="py-12 text-center">Memuat peserta...</p> : error ? <div className="py-12 text-center text-red-600"><p>{error}</p><Button className="mt-3" onClick={load}>Coba Lagi</Button></div> : !rows.length ? <div className="py-12 text-center"><Users className="mx-auto mb-3 opacity-50" /><p>Belum ada peserta.</p></div> : <><div className="flex items-center gap-3 mb-3"><input type="checkbox" checked={allVisibleSelected} onChange={togglePage} /><span>Pilih semua di halaman ini ({selected.size} dipilih)</span><Button size="sm" variant="danger" disabled={!selected.size} onClick={() => openDelete([...selected])}>Hapus Terpilih</Button><Button size="sm" variant="ghost" disabled={!selected.size} onClick={() => setSelected(new Set())}>Batalkan Pilihan</Button></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="p-3"></th><th className="p-3 text-left">Nama</th><th className="p-3">Kelas/Absen</th><th className="p-3">Reflex</th><th className="p-3">Memory</th><th className="p-3">Quiz</th><th className="p-3">Total</th><th className="p-3">Aksi</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id} className="border-b"><td className="p-3"><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} /></td><td className="p-3">{r.display_name}</td><td className="p-3">{r.class_name}/{r.attendance_number}</td><td className="p-3 text-center">{r.scores.reflex ?? '-'}</td><td className="p-3 text-center">{r.scores.memory ?? '-'}</td><td className="p-3 text-center">{r.scores.quiz ?? '-'}</td><td className="p-3 text-center font-bold">{r.total_score}</td><td className="p-3 flex gap-2"><Button size="sm" variant="ghost" icon={Pencil} onClick={() => setEditing(r)}>Edit</Button><Button size="sm" variant="danger" icon={Trash2} onClick={() => openDelete([r.id])}>Hapus</Button></td></tr>)}</tbody></table></div></>}</Card><div className="flex justify-between mt-4"><span>Halaman {pagination?.page || 1} / {pagination?.total_pages || 1}</span><div><Button size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Sebelumnya</Button><Button size="sm" className="ml-2" disabled={!pagination || page >= pagination.total_pages} onClick={() => setPage(page + 1)}>Berikutnya</Button></div></div>{editing && <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4"><form onSubmit={update} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3"><h2 className="text-xl font-bold">Edit peserta</h2><Input label="Nama" value={editing.full_name} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} /><Input label="Absen" type="number" value={editing.attendance_number} onChange={(e) => setEditing({ ...editing, attendance_number: e.target.value })} /><Input label="Kelas" value={editing.class_name} onChange={(e) => setEditing({ ...editing, class_name: e.target.value })} /><Button type="submit">Simpan</Button><Button type="button" variant="ghost" onClick={() => setEditing(null)}>Batal</Button></form></div>}{deleteModal && <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4"><div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4"><h2 className="text-xl font-bold">Konfirmasi penghapusan</h2><p>Hapus {deleteModal.length === 1 ? `peserta ${deleteModal[0].display_name}` : `${deleteModal.length} peserta`} secara permanen? Tindakan ini tidak dapat dibatalkan.</p><p className="font-semibold">{countdown > 0 ? `Tunggu ${countdown} detik sebelum melanjutkan.` : 'Anda dapat menghapus sekarang.'}</p><div className="flex gap-2"><Button variant="ghost" disabled={deleting} onClick={closeDelete}>Batal</Button><Button variant="danger" disabled={countdown > 0 || deleting} onClick={confirmDelete}>{deleting ? 'Menghapus...' : countdown > 0 ? 'Hapus' : 'Hapus Sekarang'}</Button></div></div></div>}</div>
}
