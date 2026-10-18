const variants = {
  neutral: 'bg-gray-100 text-gray-700',
  primary: 'bg-red-100 text-red-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
}

export default function Badge({ variant = 'neutral', children, className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        text-xs font-semibold rounded-full
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
