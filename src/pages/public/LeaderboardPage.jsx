import { useCallback, useEffect, useState } from 'react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Trophy, Medal, Users, Gamepad2, RefreshCw } from 'lucide-react'
import { getPublicLeaderboard, userMessage } from '../../lib/participantApi'

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([])
  const [updatedAt, setUpdatedAt] = useState(null)
  const [state, setState] = useState('loading')
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setState('loading'); setError('')
    try { const response = await getPublicLeaderboard(); setEntries(response?.leaderboard || []); setUpdatedAt(response?.updated_at || null); setState('ready') } catch (requestError) { setError(userMessage(requestError)); setState('error') }
  }, [])
  useEffect(() => { load() }, [load])
  const podium = [entries[1], entries[0], entries[2]]
  return <div className="min-h-[calc(100vh-4rem)] py-8 px-4"><div className="max-w-4xl mx-auto">
    <div className="text-center mb-8"><div className="inline-flex p-3 rounded-full bg-warning/20 mb-3"><Trophy className="w-8 h-8 text-warning" /></div><h1 className="text-3xl font-bold text-text mb-2">Leaderboard</h1><p className="text-muted">Peringkat peserta yang telah menyelesaikan ketiga game</p></div>
    {state === 'loading' && <Card className="text-center py-12">Memuat leaderboard...</Card>}
    {state === 'error' && <Card className="text-center py-12"><p className="text-red-500 mb-4">{error}</p><Button icon={RefreshCw} onClick={load}>Coba Lagi</Button></Card>}
    {state === 'ready' && entries.length === 0 && <Card className="text-center py-16"><Users className="w-16 h-16 text-muted mx-auto mb-4" /><h2 className="text-lg font-semibold text-text mb-2">Belum Ada Peserta Selesai</h2><p className="text-muted mb-6">Leaderboard akan menampilkan peserta yang telah menyelesaikan ketiga game.</p><Button icon={Gamepad2} as="link" to="/register">Mulai Bermain</Button></Card>}
    {state === 'ready' && entries.length > 0 && <><div className="grid grid-cols-3 gap-4 mb-8">{podium.map((entry, index) => <Card key={index} className={`text-center ${index === 1 ? 'bg-warning/5 border-warning/30' : 'bg-gray-50'}`}><Medal className="w-8 h-8 mx-auto mb-2 text-warning" /><Badge variant={index === 1 ? 'warning' : 'neutral'}>{index === 1 ? '1st' : index === 0 ? '2nd' : '3rd'}</Badge><div className="font-bold text-text truncate mt-2">{entry?.display_name || '-'}</div><div className="text-sm text-muted">{entry ? `${entry.total_score} poin` : '-'}</div></Card>)}</div><Card><div className="divide-y divide-border"><div className="grid grid-cols-4 gap-4 py-3 text-sm font-semibold text-muted"><div>Peringkat</div><div>Nama</div><div>Kelas</div><div className="text-right">Skor</div></div>{entries.map((entry) => <div key={`${entry.rank}-${entry.display_name}`} className="grid grid-cols-4 gap-4 py-3 text-sm"><div>{entry.rank}</div><div className="truncate">{entry.display_name}</div><div>{entry.class_name}</div><div className="text-right">{entry.total_score} <span className="text-muted">({entry.average_accuracy}%)</span></div></div>)}</div></Card>{updatedAt && <p className="text-xs text-muted text-right mt-3">Diperbarui: {new Date(updatedAt).toLocaleString('id-ID')}</p>}</>}
    <div className="text-center mt-8"><Button variant="ghost" as="link" to="/">Kembali ke Beranda</Button></div>
  </div></div>
}
