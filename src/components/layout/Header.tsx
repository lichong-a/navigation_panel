'use client'

import { useState } from 'react'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { Button } from '@/components/ui'
import { Globe, Wifi, User, LogOut, Settings, Sun, Moon } from 'lucide-react'
import { LoginDialog } from '@/components/features/LoginDialog'
import { SettingsDialog } from '@/components/features/SettingsDialog'

export function Header() {
  const { networkMode, setNetworkMode } = useSettingsStore()
  const { isLoggedIn, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [showLogin, setShowLogin] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[var(--color-background)]/80 border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-purple-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl tracking-tight">R</span>
                </div>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-[var(--color-text)] to-[var(--color-text-muted)] bg-clip-text text-transparent">
                RicPanel
              </span>
            </div>

            {/* 右侧操作区 */}
            <div className="flex items-center gap-3">
              {/* 主题切换 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2"
                title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </Button>

              {/* 网络模式切换 */}
              <button
                onClick={() => setNetworkMode(networkMode === 'public' ? 'private' : 'public')}
                className={`network-badge ${networkMode} flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white transition-all hover:opacity-90 hover:scale-105 active:scale-95`}
              >
                {networkMode === 'public' ? (
                  <>
                    <Globe size={16} />
                    <span>公网</span>
                  </>
                ) : (
                  <>
                    <Wifi size={16} />
                    <span>内网</span>
                  </>
                )}
              </button>

              {/* 用户操作 */}
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(true)}
                    className="gap-2"
                  >
                    <Settings size={18} />
                    <span className="hidden sm:inline">管理</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                    <LogOut size={18} />
                    <span className="hidden sm:inline">退出</span>
                  </Button>
                </div>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setShowLogin(true)} className="gap-2">
                  <User size={18} />
                  登录
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
