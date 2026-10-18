import { useState } from 'react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Settings, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function AdminSettingsPage() {
  const [status, setStatus] = useState('draft')
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'closed') {
      setShowConfirmModal(true)
    } else {
      setStatus(newStatus)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Pengaturan Kompetisi</h1>
        <p className="text-muted">Kelola status dan konfigurasi kompetisi</p>
      </div>

      {/* Status */}
      <Card className="mb-6">
        <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-muted" />
          Status Kompetisi
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <button
            onClick={() => handleStatusChange('draft')}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              status === 'draft' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Badge variant="neutral">Draft</Badge>
              {status === 'draft' && <CheckCircle2 className="w-5 h-5 text-primary" />}
            </div>
            <p className="text-sm text-muted">Kompetisi belum dimulai</p>
          </button>

          <button
            onClick={() => handleStatusChange('open')}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              status === 'open' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Badge variant="success">Buka</Badge>
              {status === 'open' && <CheckCircle2 className="w-5 h-5 text-primary" />}
            </div>
            <p className="text-sm text-muted">Pendaftaran & permainan aktif</p>
          </button>

          <button
            onClick={() => handleStatusChange('closed')}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              status === 'closed' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Badge variant="warning">Tutup</Badge>
              {status === 'closed' && <CheckCircle2 className="w-5 h-5 text-primary" />}
            </div>
            <p className="text-sm text-muted">Kompetisi selesai</p>
          </button>
        </div>
      </Card>

      {/* Game Settings */}
      <Card className="mb-6">
        <h2 className="text-lg font-bold text-text mb-4">Pengaturan Game</h2>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">
                Reflex Rush: Maks Skor
              </label>
              <input
                type="number"
                defaultValue="200"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">
                Memory Rush: Maks Skor
              </label>
              <input
                type="number"
                defaultValue="200"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">
                Quiz Blitz: Maks Skor
              </label>
              <input
                type="number"
                defaultValue="200"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Warning Banner */}
      <Card className="bg-warning/5 border-warning/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-text mb-1">Perhatian</h3>
            <p className="text-sm text-muted">
              Mengubah status kompetisi mempengaruhi semua peserta. 
              Pastikan untuk mengkomunikasikan perubahan kepada panitia dan peserta.
            </p>
          </div>
        </div>
      </Card>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="text-center mb-4">
              <div className="inline-flex p-3 rounded-full bg-warning/20 mb-3">
                <AlertTriangle className="w-8 h-8 text-warning" />
              </div>
              <h3 className="text-lg font-bold text-text">Tutup Kompetisi?</h3>
            </div>
            <p className="text-sm text-muted text-center mb-6">
              Menutup kompetisi akan mencegah peserta baru mendaftar dan peserta yang sedang bermain tidak dapat melanjutkan.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowConfirmModal(false)}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  setStatus('closed')
                  setShowConfirmModal(false)
                }}
              >
                Tutup Kompetisi
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
