import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'dark' | 'light' | 'system'
export type ResolvedTheme = 'dark' | 'light'

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  cycleMode: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
      cycleMode: () => {
        const modes: ThemeMode[] = ['dark', 'light', 'system']
        const currentIndex = modes.indexOf(get().mode)
        const nextIndex = (currentIndex + 1) % modes.length
        set({ mode: modes[nextIndex] })
      },
    }),
    {
      name: 'ric-panel-theme',
      skipHydration: true,
    }
  )
)

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    return getSystemTheme()
  }
  return mode
}
