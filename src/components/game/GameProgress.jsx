import { CheckCircle2 } from 'lucide-react'

export default function GameProgress({ currentGame = 1 }) {
  const games = [
    { key: 'reflex', label: 'Reflex Rush', number: 1 },
    { key: 'memory', label: 'Memory Rush', number: 2 },
    { key: 'quiz', label: 'Quiz Blitz', number: 3 },
  ]

  return (
    <div className="flex items-center justify-center gap-2">
      {games.map((game, index) => {
        const isCompleted = game.number < currentGame
        const isCurrent = game.number === currentGame
        const isPending = game.number > currentGame

        return (
          <div key={game.key} className="flex items-center">
            <div
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                ${isCompleted ? 'bg-success/20 text-success' : ''}
                ${isCurrent ? 'bg-primary text-white' : ''}
                ${isPending ? 'bg-gray-100 text-muted' : ''}
              `}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <span>{game.number}</span>
              )}
              <span className="hidden sm:inline">{game.label}</span>
            </div>
            {index < games.length - 1 && (
              <div className={`w-8 h-0.5 mx-1 ${game.number < currentGame ? 'bg-success' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
