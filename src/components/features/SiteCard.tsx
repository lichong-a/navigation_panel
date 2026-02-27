'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Icon } from '@/components/icons/Icon'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { getUrlByMode, cn } from '@/lib/utils'
import { IframeModal } from '@/components/layout/IframeModal'
import { SiteEditDialog } from './SiteEditDialog'
import { Button } from '@/components/ui'
import type { Site } from '@/types'
import { Edit, Trash2 } from 'lucide-react'

interface SiteCardProps {
  site: Site
  index?: number
  onEdit?: (site: Site) => void
  onDelete?: (id: string) => void
}

export function SiteCard({ site, index = 0, onEdit, onDelete }: SiteCardProps) {
  const { networkMode } = useSettingsStore()
  const { isLoggedIn } = useAuthStore()
  const [showIframe, setShowIframe] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: site.id,
    disabled: !isLoggedIn,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const url = getUrlByMode(site, networkMode)

  const handleClick = (e: React.MouseEvent) => {
    // 如果是管理员模式，不执行跳转
    if (isLoggedIn) return

    e.preventDefault()

    if (site.openMode === 'modal') {
      setShowIframe(true)
    } else if (site.openMode === 'blank') {
      window.open(url, '_blank')
    } else {
      window.location.href = url
    }
  }

  // 3D 倾斜效果
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || isLoggedIn) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = (y - centerY) / 10
    const rotateY = (centerX - x) / 10

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
  }

  if (!site.enabled) {
    return null
  }

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.4, 
          delay: index * 0.05,
          ease: [0, 0, 0.2, 1]
        }}
        whileHover={{ scale: isLoggedIn ? 1.02 : 1.05 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'group relative',
          isDragging && 'opacity-30'
        )}
        {...attributes}
        {...listeners}
      >
        <div
          ref={cardRef}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cn(
            'card-3d-inner relative p-4 rounded-xl bg-[var(--color-surface)]/75 border border-[var(--color-border)]',
            'transition-all duration-300 cursor-pointer',
            !isLoggedIn && 'hover:border-[var(--color-primary)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]',
            isLoggedIn && 'cursor-grab active:cursor-grabbing'
          )}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* 图标 */}
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <Icon icon={site.icon} size={40} />
          </div>

          {/* 标题 */}
          <h3 className="text-center text-sm font-medium text-[var(--color-text)] truncate">
            {site.title}
          </h3>

          {/* 描述 (悬停显示) */}
          {site.description && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {site.description}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </div>
          )}

          {/* 管理按钮 */}
          {isLoggedIn && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="p-1"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEdit(true)
                }}
              >
                <Edit size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 text-[var(--color-error)] hover:text-[var(--color-error)]"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.(site.id)
                }}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      <IframeModal
        open={showIframe}
        onClose={() => setShowIframe(false)}
        url={url}
        title={site.title}
      />

      <SiteEditDialog
        open={showEdit}
        onClose={() => setShowEdit(false)}
        site={site}
        onSave={(updated) => {
          onEdit?.(updated)
          setShowEdit(false)
        }}
      />
    </>
  )
}
