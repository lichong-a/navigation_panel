import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', required, ...props }, ref) => {
    const id = React.useId()

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5"
          >
            {label}
            {required && <span className="text-[var(--color-error)] ml-0.5">*</span>}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          type={type}
          required={required}
          className={cn(
            'w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent',
            error && 'border-[var(--color-error)] focus:ring-[var(--color-error)]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-[var(--color-error)]">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
