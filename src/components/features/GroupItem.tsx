'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SiteGrid } from './SiteGrid'
import { GroupEditDialog } from './GroupEditDialog'
import { Button } from '@/components/ui'
import { useAuthStore } from '@/stores/auth'
import { useSitesStore } from '@/stores/sites'
import { api } from '@/lib/api'
import type { Group, Site } from '@/types'
import { Edit, Trash2, Plus, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GroupItemProps {
  group: Group
  sites: Site[]
  index?: number
}

export function GroupItem({ group, sites, index = 0 }: GroupItemProps) {
  const { isLoggedIn, token } = useAuthStore()
  const { updateGroup, removeGroup, reorderSites, updateSite, removeSite } = useSitesStore()
  const [showEdit, setShowEdit] = useState(false)
  const [showAddSite, setShowAddSite] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isGroupDragging,
  } = useSortable({
    id: group.id,
    disabled: !isLoggedIn,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleEditGroup = async (name: string) => {
    if (!token) return
    await api.admin.updateGroup(token, group.id, name)
    updateGroup(group.id, { name })
    setShowEdit(false)
  }

  const handleDeleteGroup = async () => {
    if (!token) return
    if (!confirm(`确定删除分组「${group.name}」及其下所有网站？`)) return
    await api.admin.deleteGroup(token, group.id)
    removeGroup(group.id)
  }

  const handleReorderSites = async (orders: { id: string; order: number }[]) => {
    if (!token) return
    await api.admin.reorderSites(token, orders)
    reorderSites(orders)
  }

  const handleEditSite = (site: Site) => {
    updateSite(site.id, site)
  }

  const handleDeleteSite = async (id: string) => {
    if (!token) return
    if (!confirm('确定删除此网站？')) return
    await api.admin.deleteSite(token, id)
    removeSite(id)
  }

  const groupSites = sites.filter((s) => s.groupId === group.id)

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0, 0, 0.2, 1]
      }}
      className={cn(
        'mb-8 p-6 rounded-2xl bg-[var(--color-surface)]/50 border border-[var(--color-border)] backdrop-blur-sm',
        isGroupDragging && 'opacity-30'
      )}
      {...attributes}
      {...listeners}
    >
      {/* 分组标题 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {isLoggedIn && (
            <div className="cursor-grab active:cursor-grabbing text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
              <GripVertical size={20} />
            </div>
          )}
          <h2 className="text-xl font-semibold text-[var(--color-text)]">{group.name}</h2>
          <span className="text-sm text-[var(--color-text-muted)]">({groupSites.length})</span>
        </div>

        {/* 管理按钮 */}
        {isLoggedIn && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setShowAddSite(true)
              }}
              className="gap-1.5"
            >
              <Plus size={16} />
              添加网站
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation()
                setShowEdit(true)
              }} 
              className="p-2"
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteGroup()
              }}
              className="p-2 text-[var(--color-error)] hover:text-[var(--color-error)]"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* 网站网格 */}
      {groupSites.length > 0 ? (
        <SiteGrid
          sites={groupSites}
          onReorder={handleReorderSites}
          onEditSite={handleEditSite}
          onDeleteSite={handleDeleteSite}
        />
      ) : (
        <p className="text-center text-[var(--color-text-muted)] py-8">
          {isLoggedIn ? '点击上方按钮添加网站' : '暂无网站'}
        </p>
      )}

      {/* 编辑分组弹窗 */}
      <GroupEditDialog
        open={showEdit}
        onClose={() => setShowEdit(false)}
        group={group}
        onSave={handleEditGroup}
      />

      {/* 添加网站弹窗 */}
      <GroupEditDialog
        open={showAddSite}
        onClose={() => setShowAddSite(false)}
        group={group}
        onSave={handleEditGroup}
        isAddingSite
        groupId={group.id}
      />
    </motion.div>
  )
}
