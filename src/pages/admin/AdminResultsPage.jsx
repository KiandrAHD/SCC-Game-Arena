import Card from '../../components/ui/Card'
import { Trophy, Download } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getAdminParticipants } from '../../lib/participantApi'

export default function AdminResultsPage() {
  const [rows, setRows] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    try {
      setError('')
      const first = await getAdminParticipants({ page: 1, limit: 100, search: searchQuery })
      const pages = first?.pagination?.total_pages || 1
      const rest = await Promise.all(Array.from({ length: Math.max(0, pages - 1) }, (_, i) => getAdminParticipants({ page: i + 2, limit: 100, search: searchQuery })))
      setRows([...(first?.participants || []), ...rest.flatMap((page) => page?.participants || [])])
    } catch (e) { setError(e.message || 'Gagal memuat hasil') }
  }, [searchQuery])
  useEffect(() => { load() }, [load])
  const filtered = useMemo(() => rows.filter((row) => (row.display_name || row.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())), [rows, searchQuery])
  const stats = useMemo(() => ({ total: rows.length, complete: rows.filter((r) => r.scores?.reflex !== null && r.scores?.memory !== null && r.scores?.quiz !== null).length, average: rows.length ? Math.round(rows.reduce((sum, r) => sum + r.total_score, 0) / rows.length) : 0, high: Math.max(0, ...rows.map((r) => r.total_score)) }), [rows])
  const exportCsv = () => { const lines = [['Nama', 'Kelas', 'Reflex', 'Memory', 'Quiz', 'Total', 'Akurasi'], ...filtered.map((r) => [r.display_name, r.class_name, r.scores.reflex ?? '', r.scores.memory ?? '', r.scores.quiz ?? '', r.total_score, r.average_accuracy])].map((line) => line.map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' })); a.download = 'hasil.csv'; a.click() }
  return <div><div className="flex items-center justify-between mb-8"><div><h1 className="text-2xl font-bold text-text">Hasil & Leaderboard</h1><p className="text-muted">Data skor resmi dari server</p></div><button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 rounded-lg border"><Download className="w-4 h-4" />Ekspor CSV</button></div><div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">{[['Total Peserta', stats.total], ['Selesai', stats.complete], ['Rata-rata Skor', stats.average], ['Skor Tertinggi', stats.high]].map(([label, value]) => <Card key={label} className="text-center"><div className="text-2xl font-bold">{value}</div><div className="text-sm text-muted">{label}</div></Card>)}</div><Card className="mb-6"><input className="w-full px-4 py-2 rounded-lg border" placeholder="Cari nama peserta..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></Card><Card>{error ? <p className="py-12 text-center text-red-600">{error}</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3">Nama</th><th>Kelas</th><th>Reflex</th><th>Memory</th><th>Quiz</th><th>Total</th><th>Progres</th></tr></thead><tbody>{filtered.map((r) => <tr key={r.id} className="border-b"><td className="py-3">{r.display_name}</td><td>{r.class_name}</td><td>{r.scores.reflex ?? '-'}</td><td>{r.scores.memory ?? '-'}</td><td>{r.scores.quiz ?? '-'}</td><td>{r.total_score}</td><td>{[r.scores.reflex, r.scores.memory, r.scores.quiz].filter((v) => v !== null).length}/3</td></tr>)}</tbody></table>{!filtered.length && <div className="text-center py-12"><Trophy className="mx-auto mb-3 opacity-50" />Belum ada skor.</div>}</div>}</Card></div>
}
