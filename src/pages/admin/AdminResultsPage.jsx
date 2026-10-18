import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Trophy, Download, Search } from 'lucide-react'
import { useState } from 'react'

const leaderboard = []

export default function AdminResultsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Hasil & Leaderboard</h1>
          <p className="text-muted">Peringkat peserta yang telah menyelesaikan kompetisi</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-gray-50 transition-colors text-sm font-medium text-text">
          <Download className="w-4 h-4" />
          Ekspor CSV
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-text">0</div>
          <div className="text-sm text-muted">Total Peserta</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-success">0</div>
          <div className="text-sm text-muted">Selesai</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-text">0</div>
          <div className="text-sm text-muted">Rata-rata Skor</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-primary">0</div>
          <div className="text-sm text-muted">Skor Tertinggi</div>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari nama peserta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </Card>

      {/* Leaderboard Table */}
      <Card>
        {leaderboard.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted w-16">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Nama</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Kelas</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted">Reflex</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted">Memory</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted">Quiz</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted">Total</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted">Akurasi</th>
                </tr>
              </thead>
              <tbody>
                {/* Placeholder rows */}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
            <h2 className="text-lg font-semibold text-text mb-2">
              Belum Ada Peserta Selesai
            </h2>
            <p className="text-muted">
              Leaderboard akan menampilkan peserta setelah ada yang menyelesaikan ketiga game
            </p>
          </div>
        )}
      </Card>

      {/* Tie-break Info */}
      <Card className="mt-6 bg-warning/5 border-warning/20">
        <div className="flex items-start gap-3">
          <Trophy className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-text mb-1">Tie-Break</h3>
            <p className="text-sm text-muted">
              Ranking berdasarkan: (1) Total skor tertinggi, (2) Rata-rata akurasi tertinggi, 
              (3) Waktu penyelesaian tercepat.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
