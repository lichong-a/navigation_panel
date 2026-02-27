'use client'

import { useState, useRef } from 'react'
import { Button, Input } from '@/components/ui'
import { Icon } from '@/components/icons/Icon'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/api'
import type { SiteIcon } from '@/types'
import { Upload, Globe, Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IconPickerProps {
  value: SiteIcon
  onChange: (icon: SiteIcon) => void
}

type TabType = 'upload' | 'favicon' | 'iconify'

export function IconPicker({ value, onChange }: IconPickerProps) {
  const { token } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabType>('iconify')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [faviconUrl, setFaviconUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 预设图标
  const presetIcons = [
    'mdi:link',
    'mdi:web',
    'mdi:github',
    'mdi:google',
    'mdi:youtube',
    'mdi:twitter',
    'mdi:facebook',
    'mdi:instagram',
    'mdi:linkedin',
    'mdi:reddit',
    'mdi:discord',
    'mdi:slack',
    'mdi:docker',
    'mdi:kubernetes',
    'mdi:aws',
    'mdi:azure',
    'mdi:google-cloud',
    'mdi:database',
    'mdi:code-tags',
    'mdi:file-document',
    'mdi:image',
    'mdi:video',
    'mdi:music',
    'mdi:gamepad-variant',
  ]

  // 上传图标
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return

    setLoading(true)
    try {
      const result = await api.admin.uploadIcon(token, file)
      onChange({ type: 'uploaded', value: result.url })
    } catch (err) {
      console.error('Upload error:', err)
      alert('上传失败')
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 获取 Favicon
  const handleFetchFavicon = async () => {
    if (!faviconUrl || !token) return

    setLoading(true)
    try {
      const result = await api.admin.getFavicon(token, faviconUrl)
      if ('url' in result) {
        onChange({ type: 'favicon', value: result.url })
      } else {
        alert('获取 Favicon 失败: ' + result.error)
      }
    } catch (err) {
      console.error('Favicon error:', err)
      alert('获取 Favicon 失败')
    } finally {
      setLoading(false)
    }
  }

  // 搜索 Iconify
  const handleSearchIconify = async () => {
    if (!searchQuery || !token) return

    setLoading(true)
    setHasSearched(true)
    try {
      const result = await api.admin.searchIconify(token, searchQuery)
      setSearchResults(result.icons)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 当前图标预览 */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-[var(--color-background)]">
          <Icon icon={value} size={48} />
        </div>
        <div className="text-sm text-[var(--color-text-muted)]">
          <p>
            类型：
            {value.type === 'iconify'
              ? 'Iconify 图标'
              : value.type === 'uploaded'
                ? '上传图标'
                : 'Favicon'}
          </p>
          <p className="truncate max-w-xs">{value.value}</p>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2">
        {[
          { key: 'iconify', label: 'Iconify', icon: Search },
          { key: 'upload', label: '上传', icon: Upload },
          { key: 'favicon', label: 'Favicon', icon: Globe },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as TabType)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Iconify 搜索 */}
      {activeTab === 'iconify' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索图标..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchIconify()
              }}
            />
            <Button type="button" onClick={handleSearchIconify} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            </Button>
          </div>

          {/* 搜索结果或预设图标 */}
          <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 rounded-lg bg-[var(--color-surface)] justify-items-center">
            {hasSearched && searchResults.length === 0 ? (
              <div className="col-span-8 text-center text-sm text-[var(--color-text-muted)] py-4">
                未找到相关图标
              </div>
            ) : (
              (searchResults.length > 0 ? searchResults : presetIcons).map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => onChange({ type: 'iconify', value: icon })}
                  className={cn(
                    'p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors',
                    value.type === 'iconify' && value.value === icon && 'bg-[var(--color-primary)]/20 ring-1 ring-[var(--color-primary)]'
                  )}
                  title={icon}
                >
                  <Icon icon={{ type: 'iconify', value: icon }} size={24} />
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* 上传 */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Upload size={18} />
                选择图片上传
              </>
            )}
          </Button>
          <p className="text-xs text-[var(--color-text-muted)]">
            支持 PNG、JPG、SVG、ICO，最大 2MB
          </p>
        </div>
      )}

      {/* Favicon */}
      {activeTab === 'favicon' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={faviconUrl}
              onChange={(e) => setFaviconUrl(e.target.value)}
              placeholder="输入网站地址，如 https://example.com"
            />
            <Button type="button" onClick={handleFetchFavicon} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
            </Button>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            自动获取网站的 favicon 图标
          </p>
        </div>
      )}
    </div>
  )
}
