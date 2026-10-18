export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`
        bg-surface rounded-card border border-border
        p-6
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
