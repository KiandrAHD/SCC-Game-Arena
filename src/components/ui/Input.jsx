import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    className = '',
    ...props
  },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-text mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-lg border
            bg-surface text-text
            placeholder:text-muted
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-border'}
            ${className}
          `}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <p className={`mt-1.5 text-sm ${error ? 'text-red-500' : 'text-muted'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

export default Input
