'use client'

import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  rectIntersection,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { SiteCard } from './SiteCard'
import { Icon } from '@/components/icons/Icon'
import type { Site } from '@/types'
import { useAuthStore } from '@/stores/auth'

interface SiteGridProps {
  sites: Site[]
  onReorder?: (orders: { id: string; order: number }[]) => void
  onEditSite?: (site: Site) => void
  onDeleteSite?: (id: string) => void
}

export function SiteGrid({ sites, onReorder, onEditSite, onDeleteSite }: SiteGridProps) {
  const { isLoggedIn } = useAuthStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [localSites, setLocalSites] = useState<Site[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const enabledSites = sites.filter((s) => s.enabled).sort((a, b) => a.order - b.order)
  const displaySites = localSites.length > 0 ? localSites : enabledSites
  const activeSite = enabledSites.find((s) => s.id === activeId)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setLocalSites(enabledSites)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = localSites.findIndex((s) => s.id === active.id)
    const newIndex = localSites.findIndex((s) => s.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      setLocalSites(arrayMove(localSites, oldIndex, newIndex))
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event
    setActiveId(null)

    if (over && localSites.length > 0) {
      const orders = localSites.map((s, index) => ({
        id: s.id,
        order: index,
      }))
      onReorder?.(orders)
    }

    setLocalSites([])
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setLocalSites([])
  }

  if (!isLoggedIn) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {enabledSites.map((site, index) => (
          <SiteCard
            key={site.id}
            site={site}
            index={index}
            onEdit={onEditSite}
            onDelete={onDeleteSite}
          />
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={displaySites.map((s) => s.id)} strategy={rectSortingStrategy}>
        <div ref={containerRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {displaySites.map((site, index) => (
            <SiteCard
              key={site.id}
              site={site}
              index={index}
              onEdit={onEditSite}
              onDelete={onDeleteSite}
            />
          ))}
        </div>
      </SortableContext>

      {createPortal(
        <DragOverlay dropAnimation={null}>
          {activeSite ? (
            <div className="cursor-grabbing pointer-events-none scale-90">
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Icon icon={activeSite.icon} size={40} />
                </div>
                <h3 className="text-center text-sm font-medium text-white truncate mx-auto max-w-28">
                  {activeSite.title}
                </h3>
              </div>
            </div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  )
}
