'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

export function Switch({ checked, onChange, label, disabled, className }: SwitchProps) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-3 cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
          checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface)] border border-[var(--color-border)]'
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>
      {label && <span className="text-sm text-[var(--color-text)]">{label}</span>}
    </label>
  )
}
