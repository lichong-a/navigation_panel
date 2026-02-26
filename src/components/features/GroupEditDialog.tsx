'use client'

import { useState, useEffect } from 'react'
import { Dialog, Input, Button } from '@/components/ui'
import type { Group } from '@/types'

interface GroupEditDialogProps {
  open: boolean
  onClose: () => void
  group?: Group
  onSave: (name: string) => void
  isAddingSite?: boolean
  groupId?: string
}

export function GroupEditDialog({
  open,
  onClose,
  group,
  onSave,
  isAddingSite,
  groupId,
}: GroupEditDialogProps) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (open) {
      setName(group?.name || '')
    }
  }, [open, group])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave(name.trim())
    onClose()
  }

  // 如果是添加网站模式，渲染 SiteEditDialog
  if (isAddingSite && groupId) {
    return (
      <SiteEditDialogWrapper
        open={open}
        onClose={onClose}
        groupId={groupId}
        onSave={() => onClose()}
      />
    )
  }

  return (
    <Dialog open={open} onClose={onClose} title={group ? '编辑分组' : '创建分组'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="分组名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="请输入分组名称"
          required
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button type="submit">{group ? '保存' : '创建'}</Button>
        </div>
      </form>
    </Dialog>
  )
}

// 简单包装 SiteEditDialog
import { SiteEditDialog } from './SiteEditDialog'

function SiteEditDialogWrapper({
  open,
  onClose,
  groupId,
  onSave,
}: {
  open: boolean
  onClose: () => void
  groupId: string
  onSave: () => void
}) {
  const [newSite, setNewSite] = useState({
    groupId,
    title: '',
    description: '',
    icon: { type: 'iconify' as const, value: 'mdi:link' },
    publicUrl: '',
    privateUrl: '',
    openMode: 'blank' as const,
    tags: [] as string[],
    enabled: true,
  })

  const handleSave = () => {
    onSave()
    setNewSite({
      groupId,
      title: '',
      description: '',
      icon: { type: 'iconify', value: 'mdi:link' },
      publicUrl: '',
      privateUrl: '',
      openMode: 'blank',
      tags: [],
      enabled: true,
    })
  }

  return (
    <SiteEditDialog
      open={open}
      onClose={onClose}
      site={newSite as any}
      onSave={handleSave}
    />
  )
}
