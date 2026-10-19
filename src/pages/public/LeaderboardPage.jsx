import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Trophy, Medal, Users, Gamepad2 } from 'lucide-react'

export default function LeaderboardPage() {
  // Placeholder data
  const leaderboard = []

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-warning/20 mb-3">
            <Trophy className="w-8 h-8 text-warning" />
          </div>
          <h1 className="text-3xl font-bold text-text mb-2">Leaderboard</h1>
          <p className="text-muted">
            Peringkat peserta yang telah menyelesaikan ketiga game
          </p>
        </div>

        {leaderboard.length > 0 ? (
          <>
            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 2nd Place */}
              <Card className="text-center pt-8 pb-6 bg-gray-50">
                <div className="inline-flex p-2 rounded-full bg-gray-200 mb-2">
                  <Medal className="w-6 h-6 text-gray-600" />
                </div>
                <Badge variant="neutral" className="mb-2">2nd</Badge>
                <div className="font-bold text-text truncate">-</div>
                <div className="text-sm text-muted">0 poin</div>
              </Card>
              
              {/* 1st Place */}
              <Card className="text-center pt-6 pb-6 bg-warning/5 border-warning/30">
                <div className="inline-flex p-2 rounded-full bg-warning/20 mb-2">
                  <Trophy className="w-8 h-8 text-warning" />
                </div>
                <Badge variant="warning" className="mb-2">1st</Badge>
                <div className="font-bold text-text truncate">-</div>
                <div className="text-sm text-muted">0 poin</div>
              </Card>
              
              {/* 3rd Place */}
              <Card className="text-center pt-8 pb-6 bg-gray-50">
                <div className="inline-flex p-2 rounded-full bg-amber-100 mb-2">
                  <Medal className="w-6 h-6 text-amber-600" />
                </div>
                <Badge variant="warning" className="mb-2">3rd</Badge>
                <div className="font-bold text-text truncate">-</div>
                <div className="text-sm text-muted">0 poin</div>
              </Card>
            </div>

            {/* Rest of Leaderboard */}
            <Card>
              <div className="divide-y divide-border">
                {/* Table header */}
                <div className="grid grid-cols-4 gap-4 py-3 text-sm font-semibold text-muted">
                  <div>Peringkat</div>
                  <div>Nama</div>
                  <div>Kelas</div>
                  <div className="text-right">Skor</div>
                </div>
                {/* Rows would go here */}
              </div>
            </Card>
          </>
        ) : (
          <>
            {/* Empty State */}
            <Card className="text-center py-16">
              <Users className="w-16 h-16 text-muted mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-text mb-2">
                Belum Ada Peserta Selesai
              </h2>
              <p className="text-muted mb-6 max-w-sm mx-auto">
                Leaderboard akan menampilkan peserta yang telah menyelesaikan ketiga game.
              </p>
              <Button icon={Gamepad2} as="link" to="/register">
                Mulai Bermain
              </Button>
            </Card>

            {/* Info Card */}
            <Card className="mt-6 bg-info/5 border-info/20">
              <div className="flex items-start gap-3">
                <Trophy className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-text mb-1">Cara Masuk Leaderboard</h3>
                  <p className="text-sm text-muted">
                    Selesaikan Reflex Rush, Memory Rush, dan Quiz Blitz untuk masuk leaderboard.
                    Total skor maksimal adalah 600 poin.
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Button variant="ghost" as="link" to="/">
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  )
}
