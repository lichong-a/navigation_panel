'use client'

import { useState } from 'react'
import { Dialog, Input, Button } from '@/components/ui'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/api'

interface LoginDialogProps {
  open: boolean
  onClose: () => void
}

export function LoginDialog({ open, onClose }: LoginDialogProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await api.login(username, password)
      login(result.token)
      setUsername('')
      setPassword('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="管理员登录">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="请输入用户名"
          required
        />
        <Input
          label="密码"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="请输入密码"
          required
        />
        {error && (
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
