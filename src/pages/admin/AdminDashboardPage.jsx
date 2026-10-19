import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Users, Trophy, Clock3, Gamepad2, Download, TrendingUp, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const statDefinitions = [
  ['total_participants', 'Total Peserta', Users, 'text-blue-500'],
  ['completed', 'Selesai', Trophy, 'text-success'],
  ['in_progress', 'Sedang Bermain', Gamepad2, 'text-warning'],
  ['not_started', 'Belum Mulai', Clock3, 'text-muted'],
]

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: requestError } = await supabase.functions.invoke('get-admin-dashboard', { method: 'GET' })
    if (requestError) {
      setError('Data dashboard tidak dapat dimuat. Periksa sesi admin lalu coba lagi.')
    } else {
      setDashboard(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  const exportCsv = async () => {
    setExporting(true)
    const { data, error: requestError } = await supabase.functions.invoke('export-csv', { method: 'GET' })
    setExporting(false)
    if (requestError || !data?.csv) {
      setError('Data CSV tidak dapat diekspor. Coba lagi.')
      return
    }
    const blob = new Blob([data.csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'scc-game-arena-results.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const statistics = dashboard?.statistics || {}
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-text">Dashboard</h1><p className="text-muted">Ringkasan kompetisi SCC Game Arena</p></div>
        <div className="flex items-center gap-3"><Badge variant={dashboard?.event?.status === 'open' ? 'success' : 'neutral'}>{dashboard?.event?.status || 'Memuat...'}</Badge><button onClick={loadDashboard} aria-label="Muat ulang dashboard" className="p-2 rounded-lg border border-border hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button></div>
      </div>
      {error && <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statDefinitions.map(([key, label, Icon, color]) => <Card key={key}><div className="flex items-center gap-4"><div className={`p-3 rounded-lg bg-gray-100 ${color}`}><Icon className="w-6 h-6" /></div><div><div className="text-2xl font-bold text-text">{loading ? '—' : (statistics[key] ?? 0)}</div><div className="text-sm text-muted">{label}</div></div></div></Card>)}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-text flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" />Top 10 Peserta</h2><Badge variant="neutral">Server</Badge></div>{dashboard?.top_10?.length ? <div className="space-y-2">{dashboard.top_10.map((person) => <div key={`${person.rank}-${person.display_name}`} className="flex justify-between border-b border-border py-2 text-sm"><span>{person.rank}. {person.display_name}</span><strong>{person.total_score}</strong></div>)}</div> : <p className="text-center py-8 text-muted">Belum ada peserta yang selesai</p>}</Card>
        <div className="space-y-6"><Card><h2 className="text-lg font-bold text-text mb-4">Aktivitas Terbaru</h2>{dashboard?.recent_activity?.length ? <div className="space-y-3">{dashboard.recent_activity.slice(0, 6).map((activity, index) => <div key={`${activity.timestamp}-${index}`} className="text-sm"><strong>{activity.display_name}</strong> {activity.type === 'registration' ? 'mendaftar' : `menyelesaikan ${activity.game_key} (${activity.score})`}<div className="text-xs text-muted">{new Date(activity.timestamp).toLocaleString('id-ID')}</div></div>)}</div> : <p className="text-center py-4 text-muted text-sm">Belum ada aktivitas</p>}</Card><Card><h2 className="text-lg font-bold text-text mb-4">Aksi Cepat</h2><div className="grid grid-cols-2 gap-3"><button onClick={exportCsv} disabled={exporting} className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-gray-50 text-left disabled:opacity-50"><Download className="w-5 h-5 text-muted" /><span className="text-sm font-medium text-text">{exporting ? 'Mengekspor...' : 'Ekspor CSV'}</span></button><Link to="/admin/participants" className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-gray-50"><Users className="w-5 h-5 text-muted" /><span className="text-sm font-medium text-text">Lihat Peserta</span></Link></div></Card></div>
      </div>
      <Card className="mt-6 bg-info/5 border-info/20"><p className="text-sm text-muted">Data dashboard berasal dari endpoint admin dan diperbarui dari server.</p></Card>
    </div>
  )
}
