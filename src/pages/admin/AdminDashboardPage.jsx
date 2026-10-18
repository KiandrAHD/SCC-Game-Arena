import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Users, Trophy, Clock3, Gamepad2, Download, TrendingUp } from 'lucide-react'

const statCards = [
  { label: 'Total Peserta', value: 0, icon: Users, color: 'text-blue-500' },
  { label: 'Selesai', value: 0, icon: Trophy, color: 'text-success' },
  { label: 'Sedang Bermain', value: 0, icon: Gamepad2, color: 'text-warning' },
  { label: 'Belum Mulai', value: 0, icon: Clock3, color: 'text-muted' },
]

const recentActivity = []

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-muted">Ringkasan kompetisi SCC Game Arena</p>
        </div>
        <Badge variant="success">Kompetisi Aktif</Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-gray-100 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text">{stat.value}</div>
                <div className="text-sm text-muted">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Participants */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Top 5 Peserta
            </h2>
            <Badge variant="neutral">Sementara</Badge>
          </div>
          {recentActivity.length > 0 ? (
            <div className="space-y-2">
              {/* Placeholder for top participants */}
            </div>
          ) : (
            <div className="text-center py-8 text-muted">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Belum ada peserta yang selesai</p>
            </div>
          )}
        </Card>

        {/* Activity & Quick Actions */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-bold text-text mb-4">Aktivitas Terbaru</h2>
            {recentActivity.length > 0 ? (
              <div className="space-y-2">
                {/* Placeholder for activity */}
              </div>
            ) : (
              <div className="text-center py-4 text-muted text-sm">
                Belum ada aktivitas
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-text mb-4">Aksi Cepat</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-gray-50 transition-colors text-left">
                <Download className="w-5 h-5 text-muted" />
                <span className="text-sm font-medium text-text">Ekspor CSV</span>
              </button>
              <button className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-gray-50 transition-colors text-left">
                <Users className="w-5 h-5 text-muted" />
                <span className="text-sm font-medium text-text">Lihat Peserta</span>
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="mt-6 bg-info/5 border-info/20">
        <div className="flex items-start gap-3">
          <Gamepad2 className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-text mb-1">Status Dashboard</h3>
            <p className="text-sm text-muted">
              Dashboard ini menampilkan data placeholder. Hubungkan Supabase untuk melihat data peserta aktual.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
