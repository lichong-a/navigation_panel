'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/stores/theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)

  // 首次挂载时从 localStorage 恢复主题
  useEffect(() => {
    const stored = localStorage.getItem('ric-panel-theme')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed?.state?.theme) {
          setTheme(parsed.state.theme)
        }
      } catch {
        // ignore
      }
    }
  }, [setTheme])

  // 主题变化时更新 DOM
  useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'light' : ''
  }, [theme])

  return <>{children}</>
}
