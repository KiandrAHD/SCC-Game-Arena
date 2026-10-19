import { Link } from 'react-router-dom'

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary',
  secondary: 'bg-surface text-text border border-border hover:bg-gray-50 focus:ring-primary',
  ghost: 'bg-transparent text-text hover:bg-gray-100 focus:ring-primary',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  as = 'button',
  to,
  type,
  icon: Icon,
  children,
  className = '',
  ...props
}) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-lg
    transition-colors duration-150
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`
  const isDisabled = disabled || loading
  const content = loading ? (
    <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
  ) : Icon ? (
    <Icon className="w-5 h-5" />
  ) : null

  if (as === 'link') {
    return (
      <Link
        to={to}
        className={`${combinedClassName} ${isDisabled ? 'pointer-events-none opacity-50' : ''}`}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        {...props}
      >
        {content}
        {children}
      </Link>
    )
  }

  return (
    <button
      className={combinedClassName}
      type={type}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
      ) : Icon ? (
        <Icon className="w-5 h-5" />
      ) : null}
      {children}
    </button>
  )
}
