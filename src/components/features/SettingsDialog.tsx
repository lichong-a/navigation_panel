'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, Input, Button } from '@/components/ui'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/api'
import type { SitesData } from '@/types'
import { User, Download, Upload, FileDown } from 'lucide-react'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { token } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'account' | 'import-export'>('account')

  // 账户相关
  const [username, setUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [accountLoading, setAccountLoading] = useState(false)
  const [accountError, setAccountError] = useState('')
  const [accountSuccess, setAccountSuccess] = useState('')

  // 导入导出相关
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importLoading, setImportLoading] = useState(false)

  // 加载账户信息
  useEffect(() => {
    if (open && token) {
      api.admin.getAccount(token).then((data) => {
        setUsername(data.username)
      })
    }
  }, [open, token])

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setAccountError('')
    setAccountSuccess('')
    setAccountLoading(true)

    try {
      const updates: { username?: string; password?: string } = {}
      if (username) updates.username = username
      if (newPassword) updates.password = newPassword

      await api.admin.updateAccount(token!, updates)
      setAccountSuccess('更新成功')
      setNewPassword('')
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : '更新失败')
    } finally {
      setAccountLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/export', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sites-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const handleExportAll = async () => {
    try {
      const blob = await api.admin.exportAll(token!)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nav-panel-backup-${new Date().toISOString().slice(0, 10)}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export all failed:', err)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportLoading(true)
    try {
      const text = await file.text()
      const data: SitesData = JSON.parse(text)
      await api.admin.importData(token!, data)
      window.location.reload()
    } catch (err) {
      console.error('Import failed:', err)
      alert('导入失败：' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setImportLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="管理设置" className="max-w-2xl">
      {/* Tab 切换 */}
      <div className="flex gap-2 mb-6 border-b border-[var(--color-border)] pb-4">
        <button
          onClick={() => setActiveTab('account')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'account'
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <User size={16} className="inline mr-2" />
          账户设置
        </button>
        <button
          onClick={() => setActiveTab('import-export')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'import-export'
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Download size={16} className="inline mr-2" />
          导入导出
        </button>
      </div>

      {/* 账户设置 */}
      {activeTab === 'account' && (
        <form onSubmit={handleUpdateAccount} className="space-y-4">
          <Input
            label="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="用户名"
          />
          <Input
            label="新密码（留空不修改）"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="新密码"
          />
          {accountError && <p className="text-sm text-[var(--color-error)]">{accountError}</p>}
          {accountSuccess && <p className="text-sm text-[var(--color-success)]">{accountSuccess}</p>}
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={accountLoading}>
              {accountLoading ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      )}

      {/* 导入导出 */}
      {activeTab === 'import-export' && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
            <h3 className="font-medium text-[var(--color-text)] mb-3 flex items-center gap-2">
              <Download size={18} />
              导出数据
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              导出网站配置数据，可用于备份或迁移
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleExport} className="gap-2">
                <FileDown size={16} />
                导出 sites.json
              </Button>
              <Button variant="secondary" onClick={handleExportAll} className="gap-2">
                <Download size={16} />
                完整备份
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
            <h3 className="font-medium text-[var(--color-text)] mb-3 flex items-center gap-2">
              <Upload size={18} />
              导入数据
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              导入 sites.json 文件，将<strong>完全覆盖</strong>当前数据
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={importLoading}
              className="gap-2"
            >
              <Upload size={16} />
              {importLoading ? '导入中...' : '选择文件导入'}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}
