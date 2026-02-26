'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { DragOverlay } from '@dnd-kit/core'
import { GroupItem } from './GroupItem'
import { GroupEditDialog } from './GroupEditDialog'
import { Button } from '@/components/ui'
import { useAuthStore } from '@/stores/auth'
import { useSitesStore } from '@/stores/sites'
import { api } from '@/lib/api'
import type { Group } from '@/types'
import { Plus } from 'lucide-react'

export function GroupList() {
  const { isLoggedIn, token } = useAuthStore()
  const { groups, sites, addGroup, reorderGroups } = useSitesStore()
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [localGroups, setLocalGroups] = useState<Group[]>([])

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

  const sortedGroups = [...groups].sort((a, b) => a.order - b.order)
  const displayGroups = localGroups.length > 0 ? localGroups : sortedGroups
  const activeGroup = sortedGroups.find((g) => g.id === activeId)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setLocalGroups(sortedGroups)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = localGroups.findIndex((g) => g.id === active.id)
    const newIndex = localGroups.findIndex((g) => g.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      setLocalGroups(arrayMove(localGroups, oldIndex, newIndex))
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { over } = event
    setActiveId(null)

    if (over && localGroups.length > 0) {
      const orders = localGroups.map((g, index) => ({
        id: g.id,
        order: index,
      }))
      reorderGroups(orders)

      if (token) {
        try {
          await api.admin.reorderGroups(token, orders)
        } catch (err) {
          console.error('Failed to reorder groups:', err)
        }
      }
    }

    setLocalGroups([])
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setLocalGroups([])
  }

  const handleAddGroup = async (name: string) => {
    if (!token) return
    const newGroup = await api.admin.createGroup(token, name)
    addGroup(newGroup as Group)
    setShowAddGroup(false)
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--color-text-muted)] mb-4">暂无分组</p>
        {isLoggedIn && (
          <Button onClick={() => setShowAddGroup(true)} className="gap-2">
            <Plus size={18} />
            创建第一个分组
          </Button>
        )}
        <GroupEditDialog
          open={showAddGroup}
          onClose={() => setShowAddGroup(false)}
          onSave={handleAddGroup}
        />
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <>
        <div className="space-y-4">
          {sortedGroups.map((group, index) => (
            <GroupItem key={group.id} group={group} sites={sites} index={index} />
          ))}
        </div>
        <GroupEditDialog
          open={showAddGroup}
          onClose={() => setShowAddGroup(false)}
          onSave={handleAddGroup}
        />
      </>
    )
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={displayGroups.map((g) => g.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {displayGroups.map((group, index) => (
              <GroupItem key={group.id} group={group} sites={sites} index={index} />
            ))}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={null}>
          {activeGroup ? (
            <div className="cursor-grabbing">
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl scale-[0.98]">
                <h2 className="text-xl font-semibold text-white">{activeGroup.name}</h2>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* 添加分组按钮 */}
      {isLoggedIn && groups.length > 0 && (
        <div className="mt-6">
          <Button variant="secondary" onClick={() => setShowAddGroup(true)} className="gap-2">
            <Plus size={18} />
            添加分组
          </Button>
        </div>
      )}

      {/* 添加分组弹窗 */}
      <GroupEditDialog
        open={showAddGroup}
        onClose={() => setShowAddGroup(false)}
        onSave={handleAddGroup}
      />
    </>
  )
}
