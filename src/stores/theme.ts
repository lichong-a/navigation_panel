import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: newTheme })
      },
    }),
    {
      name: 'ric-panel-theme',
      skipHydration: true,
    }
  )
)
