'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui'

interface IframeModalProps {
  open: boolean
  onClose: () => void
  url: string
  title: string
}

export function IframeModal({ open, onClose, url, title }: IframeModalProps) {
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (open) {
      setLoadError(false)
    }
  }, [open, url])

  // ESC 关闭
  useEffect(() => {
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

  const handleOpenInNewTab = () => {
    window.open(url, '_blank')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* 内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-[95vw] h-[90vh] max-w-7xl bg-[#1a1a2e] rounded-xl overflow-hidden shadow-2xl border border-[var(--color-border)]"
          >
            {/* 头部 */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-[#1a1a2e]/90 backdrop-blur-sm border-b border-[var(--color-border)] flex items-center justify-between px-4 z-10">
              <span className="text-sm font-medium text-[var(--color-text)] truncate flex-1 mr-4">
                {title}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleOpenInNewTab} className="gap-1.5">
                  <ExternalLink size={16} />
                  新窗口打开
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} className="p-1.5">
                  <X size={20} />
                </Button>
              </div>
            </div>

            {/* iframe 或错误提示 */}
            <div className="pt-12 w-full h-full">
              {loadError ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center p-8">
                  <AlertCircle size={48} className="text-[var(--color-warning)]" />
                  <div>
                    <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
                      无法在弹窗中打开此网站
                    </h3>
                    <p className="text-[var(--color-text-muted)] mb-4">
                      该网站禁止被嵌入显示，请在新窗口中打开
                    </p>
                  </div>
                  <Button onClick={handleOpenInNewTab} className="gap-2">
                    <ExternalLink size={18} />
                    在新窗口中打开
                  </Button>
                </div>
              ) : (
                <iframe
                  src={url}
                  className="w-full h-full border-0"
                  title={title}
                  onError={() => setLoadError(true)}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
