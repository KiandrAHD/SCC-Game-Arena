import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { ListChecks, ArrowLeft, Play } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function QuizBlitzPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/play/memory" className="text-muted hover:text-text transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-text">Quiz Blitz</span>
            <Badge variant="primary">Game 3</Badge>
          </div>
          <div className="w-5" />
        </div>

        {/* Game Info Card */}
        <Card className="text-center mb-6">
          <div className="inline-flex p-4 rounded-full bg-blue-100 mb-4">
            <ListChecks className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-text mb-2">Quiz Blitz</h1>
          <p className="text-muted mb-6">
            Jawab 10 pertanyaan pengetahuan umum secepat mungkin!
          </p>
          
          <div className="flex justify-center gap-6 mb-6 text-sm">
            <div>
              <div className="text-2xl font-bold text-text">10</div>
              <div className="text-muted">soal</div>
            </div>
            <div className="w-px bg-border" />
            <div>
              <div className="text-2xl font-bold text-text">~10</div>
              <div className="text-muted">detik/soal</div>
            </div>
            <div className="w-px bg-border" />
            <div>
              <div className="text-2xl font-bold text-text">200</div>
              <div className="text-muted">max poin</div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left text-sm">
            <p className="font-semibold text-amber-800 mb-1">Aturan:</p>
            <ul className="text-amber-700 space-y-0.5">
              <li>• Jawaban benar: +20 poin</li>
              <li>• Tidak ada bonus kecepatan</li>
              <li>• Waktu habis = salah</li>
            </ul>
          </div>
        </Card>

        {/* Game Area Placeholder */}
        <Card className="bg-gray-50 border-dashed">
          <div className="text-center py-16">
            <p className="text-muted mb-4">
              Quiz area akan ditampilkan di sini
            </p>
            <Badge variant="warning">Fitur dalam pengembangan</Badge>
          </div>
        </Card>

        {/* Controls */}
        <div className="flex justify-center mt-6">
          <Button size="lg" icon={Play} disabled>
            Mulai Game
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button variant="ghost" as="link" to="/play/memory">
            Game Sebelumnya
          </Button>
          <Button variant="secondary" as="link" to="/result" disabled>
            Lihat Hasil
          </Button>
        </div>
      </div>
    </div>
  )
}
