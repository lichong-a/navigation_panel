import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  networkMode: 'public' | 'private'
  setNetworkMode: (mode: 'public' | 'private') => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      networkMode: 'public',
      setNetworkMode: (mode) => set({ networkMode: mode }),
    }),
    {
      name: 'nav-settings',
    }
  )
)
