import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Zap, Brain, ListChecks, Trophy, Users, Gamepad2 } from 'lucide-react'

const games = [
  {
    key: 'reflex',
    name: 'Reflex Rush',
    description: 'Uji kecepatan refleks kamu dalam menargetkan objek.',
    icon: Zap,
    color: 'text-red-500',
  },
  {
    key: 'memory',
    name: 'Memory Rush',
    description: 'Ingat dan ulangi urutan warna yang muncul.',
    icon: Brain,
    color: 'text-purple-500',
  },
  {
    key: 'quiz',
    name: 'Quiz Blitz',
    description: 'Jawab pertanyaan pengetahuan umum dengan cepat.',
    icon: ListChecks,
    color: 'text-blue-500',
  },
]

export default function LandingPage() {
  // Placeholder data - tidak ada backend terkoneksi
  const participantCount = 0
  const topPlayers = []

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4">
            Siap jadi juara di{' '}
            <span className="text-primary">SCC Game Arena</span>?
          </h1>
          <p className="text-lg text-muted mb-8 max-w-2xl mx-auto">
            Mainkan tiga game seru, kumpulkan poin, dan lihat namamu di papan peringkat!
            Tidak perlu buat akun &mdash; langsung main saja.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" icon={Gamepad2} as="link" to="/register">
              Mulai Bermain
            </Button>
            <Button variant="secondary" size="lg" as="link" to="/rules">
              Lihat Aturan
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4 bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto flex justify-center gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary">{participantCount}</div>
            <div className="text-sm text-muted">Peserta bergabung</div>
          </div>
          <div className="w-px bg-border" />
          <div>
            <div className="text-3xl font-bold text-text">600</div>
            <div className="text-sm text-muted">Poin maksimal</div>
          </div>
          <div className="w-px bg-border" />
          <div>
            <div className="text-3xl font-bold text-text">3</div>
            <div className="text-sm text-muted">Game seru</div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-text text-center mb-8">
            Tiga Game Menanti
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {games.map((game, index) => (
              <Card key={game.key} className="text-center hover:shadow-md transition-shadow">
                <div className={`inline-flex p-3 rounded-full bg-gray-100 mb-4 ${game.color}`}>
                  <game.icon className="w-8 h-8" />
                </div>
                <Badge variant="neutral" className="mb-2">Game {index + 1}</Badge>
                <h3 className="text-lg font-bold text-text mb-2">{game.name}</h3>
                <p className="text-sm text-muted">{game.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-16 px-4 bg-surface border-t border-border">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text flex items-center gap-2">
              <Trophy className="w-6 h-6 text-warning" />
              Top 3 Peserta
            </h2>
            <Link to="/leaderboard" className="text-sm text-primary font-medium hover:underline">
              Lihat semua peringkat
            </Link>
          </div>
          {topPlayers.length > 0 ? (
            <div className="space-y-3">
              {/* Placeholder for top players */}
            </div>
          ) : (
            <Card className="text-center py-8">
              <Users className="w-12 h-12 text-muted mx-auto mb-3" />
              <p className="text-muted">Belum ada peserta yang selesai.</p>
              <p className="text-sm text-muted mt-1">Jadilah yang pertama!</p>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
