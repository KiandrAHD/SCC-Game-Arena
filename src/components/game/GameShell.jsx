import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Timer from '../ui/Timer'
import Progress from '../ui/Progress'

export default function GameShell({
  title,
  gameNumber,
  children,
  score = 0,
  timerDuration,
  onTimerExpire,
  isRunning = false,
  progress,
  maxProgress,
}) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Game Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Badge variant="primary">Game {gameNumber}</Badge>
          <h1 className="text-2xl font-bold text-text mt-1">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {timerDuration && (
            <Timer
              duration={timerDuration}
              onExpire={onTimerExpire}
              isRunning={isRunning}
            />
          )}
          <div className="text-right">
            <div className="text-sm text-muted">Skor</div>
            <div className="text-2xl font-bold text-primary">{score}</div>
          </div>
        </div>
      </div>

      {/* Progress */}
      {progress !== undefined && maxProgress && (
        <div className="mb-6">
          <Progress value={progress} max={maxProgress} />
        </div>
      )}

      {/* Game Area */}
      <Card className="min-h-[400px]">
        {children}
      </Card>
    </div>
  )
}
