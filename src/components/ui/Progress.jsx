export default function Progress({ value = 0, max = 100, label, className = '' }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-medium text-text">{label}</span>
          <span className="text-sm text-muted">{value}/{max}</span>
        </div>
      )}
      <div
        className="w-full h-2 bg-border rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
