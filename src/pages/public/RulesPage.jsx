import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Zap, Brain, ListChecks, ArrowRight, Target, Clock3, AlertTriangle } from 'lucide-react'

const rules = [
  {
    title: 'Tiga Game Berurutan',
    description: 'Game dimainkan secara berurutan: Reflex Rush → Memory Rush → Quiz Blitz. Kamu tidak bisa melompat ke game berikutnya sebelum menyelesaikan game sebelumnya.',
  },
  {
    title: 'Skor Maksimal',
    description: 'Setiap game memiliki skor maksimal 200 poin. Total skor kompetisi adalah 600 poin.',
  },
  {
    title: 'Progres Tersimpan',
    description: 'Progres kamu tersimpan otomatis. Jika browser tertutup, kamu bisa melanjutkan dari game terakhir yang belum selesai.',
  },
  {
    title: 'Satu Percobaan',
    description: 'Setiap peserta hanya boleh menyelesaikan kompetisi satu kali, kecuali panitia mengizinkan permainan ulang.',
  },
]

const gameInfo = [
  {
    name: 'Reflex Rush',
    icon: Zap,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    duration: '40 detik',
    rules: [
      'Klik target merah untuk mendapat poin (+10)',
      'Hindari jebakan abu-abu (penalti -5)',
      'Skor tidak bisa negatif',
    ],
  },
  {
    name: 'Memory Rush',
    icon: Brain,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    rules: [
      '8 ronde dengan pola yang semakin panjang',
      'Ingat dan ulangi urutan warna',
      'Kesalahan 3x = game over',
    ],
  },
  {
    name: 'Quiz Blitz',
    icon: ListChecks,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    rules: [
      '10 pertanyaan pilihan ganda',
      '~10 detik per pertanyaan',
      'Jawaban benar = +20 poin',
    ],
  },
]

export default function RulesPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-text mb-2">Aturan Kompetisi</h1>
          <p className="text-muted">Baca aturan berikut sebelum mulai bermain</p>
        </div>

        {/* General Rules */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Aturan Umum
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {rules.map((rule, index) => (
              <Card key={index} className="relative">
                <Badge variant="primary" className="absolute top-4 right-4">
                  {index + 1}
                </Badge>
                <h3 className="font-bold text-text mb-2">{rule.title}</h3>
                <p className="text-sm text-muted">{rule.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Game Rules */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
            <Clock3 className="w-5 h-5 text-primary" />
            Aturan Setiap Game
          </h2>
          <div className="space-y-4">
            {gameInfo.map((game, index) => (
              <Card key={game.name} className="flex gap-4">
                <div className={`flex-shrink-0 p-3 rounded-lg ${game.bgColor}`}>
                  <game.icon className={`w-6 h-6 ${game.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-text">{game.name}</h3>
                    <Badge variant="neutral">Game {index + 1}</Badge>
                    {game.duration && (
                      <Badge variant="info">{game.duration}</Badge>
                    )}
                  </div>
                  <ul className="text-sm text-muted space-y-1">
                    {game.rules.map((rule, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Tie-break */}
        <section className="mb-10">
          <Card className="bg-warning/5 border-warning/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-text mb-2">Tie-Break</h3>
                <p className="text-sm text-muted mb-2">
                  Jika dua peserta memiliki skor sama, peringkat ditentukan oleh:
                </p>
                <ol className="text-sm text-muted space-y-1 list-decimal list-inside">
                  <li>Total skor lebih tinggi</li>
                  <li>Rata-rata akurasi lebih tinggi</li>
                  <li>Waktu penyelesaian lebih awal</li>
                </ol>
              </div>
            </div>
          </Card>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" icon={ArrowRight} as="link" to="/register">
            Daftar Sekarang
          </Button>
        </div>
      </div>
    </div>
  )
}
