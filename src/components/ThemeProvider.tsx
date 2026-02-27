'use client'

import { useEffect, useState } from 'react'
import { useThemeStore, getSystemTheme, resolveTheme, type ResolvedTheme } from '@/stores/theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((state) => state.mode)
  const setMode = useThemeStore((state) => state.setMode)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark')

  // 首次挂载时从 localStorage 恢复主题
  useEffect(() => {
    const stored = localStorage.getItem('ric-panel-theme')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed?.state?.mode) {
          setMode(parsed.state.mode)
        }
      } catch {
        // ignore
      }
    }
  }, [setMode])

  // 监听系统主题变化
  useEffect(() => {
    if (mode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      setResolvedTheme(getSystemTheme())
    }

    setResolvedTheme(getSystemTheme())
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [mode])

  // 计算实际主题
  useEffect(() => {
    setResolvedTheme(resolveTheme(mode))
  }, [mode])

  // 主题变化时更新 DOM
  useEffect(() => {
    document.documentElement.className = resolvedTheme === 'light' ? 'light' : ''
  }, [resolvedTheme])

  return <>{children}</>
}
