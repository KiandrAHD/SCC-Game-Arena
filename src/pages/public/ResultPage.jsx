import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Progress from '../../components/ui/Progress'
import { Trophy, ArrowRight, RotateCcw, Medal } from 'lucide-react'

export default function ResultPage() {
  // Placeholder data
  const result = null

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-full bg-success/20 mb-4">
            <Trophy className="w-12 h-12 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-text mb-2">Kompetisi Selesai!</h1>
          <p className="text-muted">
            {result 
              ? 'Selamat! Kamu telah menyelesaikan semua game.'
              : 'Hasil kompetisi akan ditampilkan di sini setelah kamu menyelesaikan ketiga game.'
            }
          </p>
        </div>

        {result ? (
          <>
            {/* Score Cards */}
            <div className="grid gap-4 mb-8">
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="neutral">Game 1</Badge>
                    <h3 className="font-bold text-text mt-1">Reflex Rush</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-text">0</div>
                    <div className="text-sm text-muted">poin</div>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="neutral">Game 2</Badge>
                    <h3 className="font-bold text-text mt-1">Memory Rush</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-text">0</div>
                    <div className="text-sm text-muted">poin</div>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="neutral">Game 3</Badge>
                    <h3 className="font-bold text-text mt-1">Quiz Blitz</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-text">0</div>
                    <div className="text-sm text-muted">poin</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Total Score */}
            <Card className="text-center mb-8 bg-primary text-white">
              <p className="text-white/80 mb-2">Total Skor</p>
              <div className="text-5xl font-bold mb-2">0</div>
              <div className="text-white/60">dari 600 poin</div>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" icon={Trophy} as="link" to="/leaderboard">
                Lihat Leaderboard
              </Button>
              <Button variant="secondary" size="lg" icon={RotateCcw} disabled>
                Main Lagi
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Empty State */}
            <Card className="text-center py-12">
              <Medal className="w-16 h-16 text-muted mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-text mb-2">
                Belum Ada Hasil
              </h2>
              <p className="text-muted mb-6 max-w-sm mx-auto">
                Selesaikan ketiga game untuk melihat hasil kompetisi kamu.
              </p>
              <Button icon={ArrowRight} as="link" to="/register">
                Mulai Bermain
              </Button>
            </Card>

            {/* Progress Indicator */}
            <Card className="mt-6">
              <h3 className="font-semibold text-text mb-4">Progres Game</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted">Game 1: Reflex Rush</span>
                    <Badge variant="neutral">Belum mulai</Badge>
                  </div>
                  <Progress value={0} max={200} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted">Game 2: Memory Rush</span>
                    <Badge variant="neutral">Belum mulai</Badge>
                  </div>
                  <Progress value={0} max={200} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted">Game 3: Quiz Blitz</span>
                    <Badge variant="neutral">Belum mulai</Badge>
                  </div>
                  <Progress value={0} max={200} />
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
