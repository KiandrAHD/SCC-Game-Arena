import { Trophy, Zap, Brain, ListChecks } from 'lucide-react'

const gameIcons = {
  reflex: Zap,
  memory: Brain,
  quiz: ListChecks,
}

export default function ScoreDisplay({ scores = [], totalScore = 0, maxScore = 600 }) {
  return (
    <div className="space-y-4">
      {/* Individual Scores */}
      {scores.map((score, index) => {
        const Icon = gameIcons[score.gameKey] || Trophy
        const percentage = score.maxScore ? (score.value / score.maxScore) * 100 : 0
        
        return (
          <div key={score.gameKey} className="bg-surface rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-muted" />
                <span className="font-medium text-text">{score.label}</span>
              </div>
              <span className="font-bold text-text">{score.value}</span>
            </div>
            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}

      {/* Total Score */}
      <div className="bg-primary text-white rounded-lg p-6 text-center">
        <div className="text-white/80 text-sm mb-1">Total Skor</div>
        <div className="text-4xl font-bold">{totalScore}</div>
        <div className="text-white/60 text-sm mt-1">dari {maxScore} poin</div>
      </div>
    </div>
  )
}
