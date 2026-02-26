import { create } from 'zustand'
import type { Group, Site, SitesData } from '@/types'

interface SitesState {
  groups: Group[]
  sites: Site[]
  isLoading: boolean
  setData: (data: SitesData) => void
  addGroup: (group: Group) => void
  updateGroup: (id: string, updates: Partial<Group>) => void
  removeGroup: (id: string) => void
  reorderGroups: (orders: { id: string; order: number }[]) => void
  addSite: (site: Site) => void
  updateSite: (id: string, updates: Partial<Site>) => void
  removeSite: (id: string) => void
  reorderSites: (orders: { id: string; order: number; groupId?: string }[]) => void
  setLoading: (loading: boolean) => void
}

export const useSitesStore = create<SitesState>((set) => ({
  groups: [],
  sites: [],
  isLoading: true,

  setData: (data) => set({
    groups: data.groups.sort((a, b) => a.order - b.order),
    sites: data.sites,
    isLoading: false
  }),

  addGroup: (group) => set((state) => ({
    groups: [...state.groups, group].sort((a, b) => a.order - b.order)
  })),

  updateGroup: (id, updates) => set((state) => ({
    groups: state.groups.map(g => g.id === id ? { ...g, ...updates } : g)
  })),

  removeGroup: (id) => set((state) => ({
    groups: state.groups.filter(g => g.id !== id),
    sites: state.sites.filter(s => s.groupId !== id)
  })),

  reorderGroups: (orders) => set((state) => {
    const orderMap = new Map(orders.map(o => [o.id, o.order]))
    return {
      groups: state.groups.map(g => ({
        ...g,
        order: orderMap.get(g.id) ?? g.order
      })).sort((a, b) => a.order - b.order)
    }
  }),

  addSite: (site) => set((state) => ({
    sites: [...state.sites, site]
  })),

  updateSite: (id, updates) => set((state) => ({
    sites: state.sites.map(s => s.id === id ? { ...s, ...updates } : s)
  })),

  removeSite: (id) => set((state) => ({
    sites: state.sites.filter(s => s.id !== id)
  })),

  reorderSites: (orders) => set((state) => {
    const orderMap = new Map(orders.map(o => [o.id, { order: o.order, groupId: o.groupId }]))
    return {
      sites: state.sites.map(s => {
        const update = orderMap.get(s.id)
        if (update) {
          return { ...s, order: update.order, ...(update.groupId && { groupId: update.groupId }) }
        }
        return s
      })
    }
  }),

  setLoading: (loading) => set({ isLoading: loading })
}))
