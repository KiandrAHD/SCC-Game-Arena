import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'

export default function Timer({ 
  duration = 40, 
  onExpire, 
  isRunning = true,
  className = '' 
}) {
  const [timeLeft, setTimeLeft] = useState(duration)
  
  const isWarning = timeLeft <= 10 && timeLeft > 5
  const isCritical = timeLeft <= 5

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onExpire?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, onExpire, timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-lg font-semibold
        ${isCritical ? 'bg-red-100 text-red-700' : isWarning ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-text'}
        ${className}
      `}
      role="timer"
      aria-live="polite"
    >
      <Clock3 className="w-5 h-5" />
      <span>{formatTime(timeLeft)}</span>
    </div>
  )
}
