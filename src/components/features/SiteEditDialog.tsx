'use client'

import { useState, useEffect } from 'react'
import { Dialog, Input, Button, Select, Switch } from '@/components/ui'
import { IconPicker } from './IconPicker'
import { useAuthStore } from '@/stores/auth'
import { useSitesStore } from '@/stores/sites'
import { api } from '@/lib/api'
import type { Site, SiteIcon, OpenMode } from '@/types'

interface SiteEditDialogProps {
  open: boolean
  onClose: () => void
  site: Site | null
  onSave: (site: Site) => void
}

export function SiteEditDialog({ open, onClose, site, onSave }: SiteEditDialogProps) {
  const { token } = useAuthStore()
  const { groups, addSite, updateSite } = useSitesStore()

  const [formData, setFormData] = useState<{
    groupId: string
    title: string
    description: string
    icon: SiteIcon
    publicUrl: string
    privateUrl: string
    openMode: OpenMode
    tags: string[]
    enabled: boolean
  }>({
    groupId: '',
    title: '',
    description: '',
    icon: { type: 'iconify', value: 'mdi:link' },
    publicUrl: '',
    privateUrl: '',
    openMode: 'blank',
    tags: [],
    enabled: true,
  })
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && site) {
      setFormData({
        groupId: site.groupId,
        title: site.title,
        description: site.description || '',
        icon: site.icon,
        publicUrl: site.publicUrl,
        privateUrl: site.privateUrl || '',
        openMode: site.openMode,
        tags: site.tags || [],
        enabled: site.enabled,
      })
    } else if (open) {
      setFormData({
        groupId: groups[0]?.id || '',
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
  }, [open, site, groups])

  const handleIconChange = (icon: SiteIcon) => {
    setFormData((prev) => ({ ...prev, icon }))
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setLoading(true)
    try {
      if (site?.id) {
        // 更新
        const updated = await api.admin.updateSite(token, site.id, formData)
        updateSite(site.id, updated as Site)
        onSave(updated as Site)
      } else {
        // 创建
        const created = await api.admin.createSite(token, formData)
        addSite(created as Site)
        onSave(created as Site)
      }
      onClose()
    } catch (err) {
      console.error('Save site error:', err)
      alert(err instanceof Error ? err.message : '保存失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={site?.id ? '编辑网站' : '添加网站'}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 基本信息 */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="所属分组"
            value={formData.groupId}
            onChange={(e) => setFormData((prev) => ({ ...prev, groupId: e.target.value }))}
            options={groups.map((g) => ({ value: g.id, label: g.name }))}
            required
          />
          <Input
            label="标题"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="网站标题"
            required
          />
        </div>

        <Input
          label="描述"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="网站描述（可选）"
        />

        {/* 图标选择 */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">
            图标
            <span className="text-[var(--color-error)] ml-0.5">*</span>
          </label>
          <IconPicker value={formData.icon} onChange={handleIconChange} />
        </div>

        {/* URL */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="公网地址"
            type="url"
            value={formData.publicUrl}
            onChange={(e) => setFormData((prev) => ({ ...prev, publicUrl: e.target.value }))}
            placeholder="https://example.com"
            required
          />
          <Input
            label="内网地址"
            type="url"
            value={formData.privateUrl}
            onChange={(e) => setFormData((prev) => ({ ...prev, privateUrl: e.target.value }))}
            placeholder="http://192.168.1.1:8080"
          />
        </div>

        {/* 打开方式 */}
        <Select
          label="打开方式"
          value={formData.openMode}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, openMode: e.target.value as OpenMode }))
          }
          options={[
            { value: 'blank', label: '新窗口打开' },
            { value: 'current', label: '当前页面打开' },
            { value: 'modal', label: '弹窗打开 (iframe)' },
          ]}
        />

        {formData.openMode === 'modal' && (
          <p className="text-sm text-[var(--color-warning)] -mt-3">
            注意：部分网站禁止被嵌入，弹窗模式可能无法正常显示
          </p>
        )}

        {/* 标签 */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">
            标签
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="输入标签"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={handleAddTag} className="shrink-0">
              添加
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--color-surface)] text-sm text-[var(--color-text-muted)]"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-[var(--color-text)]"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 启用状态 */}
        <Switch
          checked={formData.enabled}
          onChange={(checked) => setFormData((prev) => ({ ...prev, enabled: checked }))}
          label="启用"
        />

        {/* 按钮 */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
