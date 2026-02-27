'use client'

import { useState } from 'react'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore, type ThemeMode } from '@/stores/theme'
import { Button } from '@/components/ui'
import { Globe, Wifi, User, LogOut, Settings, Sun, Moon, Monitor, Github } from 'lucide-react'
import { LoginDialog } from '@/components/features/LoginDialog'
import { SettingsDialog } from '@/components/features/SettingsDialog'

const GITHUB_URL = 'https://github.com/lichong-a/navigation_panel'

const themeConfig: Record<ThemeMode, { icon: typeof Sun; label: string }> = {
  dark: { icon: Moon, label: '暗色模式' },
  light: { icon: Sun, label: '亮色模式' },
  system: { icon: Monitor, label: '跟随系统' },
}

export function Header() {
  const { networkMode, setNetworkMode } = useSettingsStore()
  const { isLoggedIn, logout } = useAuthStore()
  const mode = useThemeStore((state) => state.mode)
  const cycleMode = useThemeStore((state) => state.cycleMode)
  const [showLogin, setShowLogin] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleLogout = () => {
    logout()
  }

  const currentTheme = themeConfig[mode]
  const ThemeIcon = currentTheme.icon

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[var(--color-background)]/80 border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-purple-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg sm:text-xl tracking-tight">R</span>
                </div>
              </div>
              <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-[var(--color-text)] to-[var(--color-text-muted)] bg-clip-text text-transparent">
                RicPanel
              </span>
            </div>

            {/* 右侧操作区 */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* GitHub */}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                className="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] p-1.5 sm:p-2"
              >
                <Github size={18} />
              </a>

              {/* 主题切换 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={cycleMode}
                className="p-1.5 sm:p-2"
                title={currentTheme.label}
              >
                <ThemeIcon size={18} />
              </Button>

              {/* 网络模式切换 - 手机端只显示图标 */}
              <button
                onClick={() => setNetworkMode(networkMode === 'public' ? 'private' : 'public')}
                title={networkMode === 'public' ? '公网' : '内网'}
                className={`network-badge ${networkMode} flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-white transition-all hover:opacity-90 hover:scale-105 active:scale-95 cursor-pointer`}
              >
                {networkMode === 'public' ? (
                  <>
                    <Globe size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">公网</span>
                  </>
                ) : (
                  <>
                    <Wifi size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">内网</span>
                  </>
                )}
              </button>

              {/* 用户操作 - 手机端只显示图标 */}
              {isLoggedIn ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(true)}
                    className="p-1.5 sm:p-2 sm:gap-2"
                    title="管理"
                  >
                    <Settings size={18} />
                    <span className="hidden sm:inline">管理</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout} 
                    className="p-1.5 sm:p-2 sm:gap-2"
                    title="退出"
                  >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">退出</span>
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setShowLogin(true)} 
                  className="p-1.5 sm:p-2 sm:gap-2"
                  title="登录"
                >
                  <User size={18} />
                  <span className="hidden sm:inline">登录</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <LoginDialog open={showLogin} onClose={() => setShowLogin(false)} />
      <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}
