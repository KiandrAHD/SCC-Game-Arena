import { useCallback, useEffect, useRef, useState } from 'react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Settings, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const statusCopy = {
  draft: { label: 'Draft', description: 'Kompetisi belum dimulai', variant: 'neutral' },
  open: { label: 'Buka', description: 'Pendaftaran & permainan aktif', variant: 'success' },
  closed: { label: 'Tutup', description: 'Kompetisi selesai', variant: 'warning' },
}

export default function AdminSettingsPage() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [target, setTarget] = useState(null)
  const [seconds, setSeconds] = useState(5)
  const timerRef = useRef(null)

  const loadStatus = useCallback(async () => {
    setLoading(true); setError('')
    const { data, error: requestError } = await supabase.functions.invoke('get-admin-dashboard', { method: 'GET' })
    const serverStatus = data?.event?.status
    if (requestError || !statusCopy[serverStatus]) setError('Status kompetisi tidak dapat dimuat dari server.')
    else setStatus(serverStatus)
    setLoading(false)
  }, [])

  useEffect(() => { loadStatus() }, [loadStatus])
  useEffect(() => () => clearInterval(timerRef.current), [])

  const openConfirmation = (next) => {
    if (loading || saving || next === status) return
    clearInterval(timerRef.current); setTarget(next); setSeconds(5)
    timerRef.current = setInterval(() => setSeconds((value) => {
      if (value <= 1) { clearInterval(timerRef.current); return 0 }
      return value - 1
    }), 1000)
  }

  const cancel = () => { clearInterval(timerRef.current); setTarget(null) }
  const saveStatus = async () => {
    if (!target || seconds > 0 || saving) return
    setSaving(true); setError('')
    const registration_open = target === 'open'
    const { data, error: requestError } = await supabase.functions.invoke('update-competition-settings', {
      body: { status: target, registration_open },
    })
    if (requestError || data?.success !== true || data?.settings?.status !== target || data?.settings?.registration_open !== registration_open) {
      setError('Status tidak tersimpan. Status terakhir dari server tetap dipertahankan.')
    } else {
      setStatus(target); cancel(); await loadStatus()
    }
    setSaving(false)
  }

  return <div>
    <div className="mb-8 flex items-center justify-between"><div><h1 className="text-2xl font-bold text-text">Pengaturan Kompetisi</h1><p className="text-muted">Kelola status dan konfigurasi kompetisi</p></div><Button variant="secondary" onClick={loadStatus} disabled={loading || saving} icon={RefreshCw}>Muat Ulang</Button></div>
    {error && <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <Card className="mb-6"><h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-muted" />Status Kompetisi</h2>
      {loading ? <p className="text-muted">Memuat status dari server...</p> : <div className="grid sm:grid-cols-3 gap-4">{Object.entries(statusCopy).map(([key, info]) => <button key={key} onClick={() => openConfirmation(key)} disabled={saving} aria-pressed={status === key} className={`p-4 rounded-lg border-2 text-left transition-colors disabled:opacity-50 ${status === key ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-300'}`}><div className="flex items-center justify-between mb-2"><Badge variant={info.variant}>{info.label}</Badge>{status === key && <CheckCircle2 className="w-5 h-5 text-primary" />}</div><p className="text-sm text-muted">{info.description}</p></button>)}</div>}
    </Card>
    <Card className="bg-warning/5 border-warning/20"><div className="flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" /><div><h3 className="font-semibold text-text mb-1">Perhatian</h3><p className="text-sm text-muted">Mengubah status kompetisi mempengaruhi semua peserta.</p></div></div></Card>
    {target && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="status-confirm-title"><Card className="w-full max-w-md"><div className="text-center mb-4"><AlertTriangle className="w-8 h-8 text-warning mx-auto mb-3" /><h3 id="status-confirm-title" className="text-lg font-bold text-text">{statusCopy[target].label} Kompetisi?</h3></div><p className="text-sm text-muted text-center mb-6">{target === 'open' ? 'Peserta dapat mendaftar dan bermain.' : target === 'closed' ? 'Pendaftaran dan permainan akan ditutup.' : 'Pendaftaran akan ditutup dan kompetisi kembali ke Draft.'}</p>{seconds > 0 && <p role="status" className="text-center font-semibold mb-4">Konfirmasi tersedia dalam {seconds} detik</p>}<div className="flex gap-3"><Button variant="secondary" className="flex-1" onClick={cancel} disabled={saving}>Batal</Button><Button variant={target === 'closed' ? 'danger' : 'primary'} className="flex-1" onClick={saveStatus} disabled={seconds > 0 || saving} loading={saving}>{saving ? 'Menyimpan...' : `${statusCopy[target].label} Kompetisi Sekarang`}</Button></div></Card></div>}
  </div>
}
