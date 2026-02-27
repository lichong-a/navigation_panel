'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, title, description, children, footer, className }: DialogProps) {
  // ESC 键关闭
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      window.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm dark:bg-black/60"
            onClick={onClose}
          />

          {/* 内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'relative bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden',
              className
            )}
          >
            {/* 头部 - 磨砂背景 */}
            {(title || description) && (
              <div className="sticky top-0 z-10 px-6 py-4 border-b border-[var(--color-border)] flex items-start justify-between bg-[var(--color-surface)]/80 backdrop-blur-xl">
                <div>
                  {title && <h2 className="text-lg font-semibold text-[var(--color-text)]">{title}</h2>}
                  {description && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
                  <X size={20} />
                </Button>
              </div>
            )}

            {/* 内容区 - 可滚动 */}
            <div className="flex-1 overflow-auto p-6">{children}</div>

            {/* 底部 - 磨砂背景 */}
            {footer && (
              <div className="sticky bottom-0 z-10 px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
