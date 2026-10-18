import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import { Users, Search, Download, MoreVertical } from 'lucide-react'
import { useState } from 'react'

const participants = []

export default function AdminParticipantsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Manajemen Peserta</h1>
          <p className="text-muted">Daftar peserta yang terdaftar</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-gray-50 transition-colors text-sm font-medium text-text">
          <Download className="w-4 h-4" />
          Ekspor CSV
        </button>
      </div>

      {/* Search & Filter */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Cari nama atau nomor absen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2.5 rounded-lg border border-border bg-surface text-text">
              <option value="">Semua Kelas</option>
              <option value="IXA">IX A</option>
              <option value="IXB">IX B</option>
              <option value="IXC">IX C</option>
              <option value="IXD">IX D</option>
            </select>
            <select className="px-4 py-2.5 rounded-lg border border-border bg-surface text-text">
              <option value="">Semua Status</option>
              <option value="registered">Belum Mulai</option>
              <option value="playing">Sedang Bermain</option>
              <option value="completed">Selesai</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Participants Table */}
      <Card>
        {participants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Nama</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Kelas</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Absen</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Game 1</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Game 2</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Game 3</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {/* Placeholder rows */}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
            <h2 className="text-lg font-semibold text-text mb-2">
              Belum Ada Peserta
            </h2>
            <p className="text-muted">
              Peserta akan muncul di sini setelah mendaftar
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
