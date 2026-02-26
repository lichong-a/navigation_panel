'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChevronDown, Check } from 'lucide-react'

interface SelectProps {
  label?: string
  options: { value: string; label: string }[]
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  error?: string
  required?: boolean
  className?: string
  placeholder?: string
}

export function Select({ 
  label, 
  options, 
  value, 
  onChange, 
  error, 
  required, 
  className,
  placeholder = '请选择'
}: SelectProps) {
  const id = React.useId()
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      const event = {
        target: { value: optionValue }
      } as React.ChangeEvent<HTMLSelectElement>
      onChange(event)
    }
    setIsOpen(false)
  }

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5"
        >
          {label}
          {required && <span className="text-[var(--color-error)] ml-0.5">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          id={id}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border text-left',
            'flex items-center justify-between gap-2',
            'transition-all duration-200 cursor-pointer',
            isOpen 
              ? 'ring-2 ring-[var(--color-primary)] border-transparent' 
              : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]',
            error && 'border-[var(--color-error)] focus:ring-[var(--color-error)]'
          )}
        >
          <span className={cn(
            'truncate',
            !selectedOption && 'text-[var(--color-text-muted)]'
          )}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown 
            size={18} 
            className={cn(
              'text-[var(--color-text-muted)] transition-transform duration-200 shrink-0',
              isOpen && 'rotate-180'
            )} 
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1 py-1 rounded-lg bg-[#1a1a2e] border border-[var(--color-border)] shadow-xl overflow-hidden"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full px-3 py-2 text-left flex items-center justify-between gap-2',
                    'transition-colors duration-150',
                    'hover:bg-[var(--color-surface)]',
                    option.value === value 
                      ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                      : 'text-[var(--color-text)]'
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {option.value === value && (
                    <Check size={16} className="shrink-0" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && <p className="mt-1 text-sm text-[var(--color-error)]">{error}</p>}

      <select
        value={value}
        onChange={onChange}
        required={required}
        className="sr-only"
        tabIndex={-1}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
