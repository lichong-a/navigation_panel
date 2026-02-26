import type { Group, Site, SitesData } from '@/types'

const API_BASE = '/api'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  token?: string | null
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new ApiError(response.status, error.error || 'Request failed')
  }

  return response.json()
}

// 公开接口
export const api = {
  // 初始化
  getSetupStatus: () => request<{ initialized: boolean }>('/setup/status'),
  initSetup: (username: string, password: string) =>
    request<{ success: boolean }>('/setup/init', { method: 'POST', body: { username, password } }),

  // 认证
  login: (username: string, password: string) =>
    request<{ token: string }>('/auth/login', { method: 'POST', body: { username, password } }),

  // 站点数据
  getSites: () => request<SitesData>('/sites'),

  // 管理接口
  admin: {
    // 分组
    getGroups: (token: string) => request<Group[]>('/admin/groups', { token }),
    createGroup: (token: string, name: string) =>
      request<Group>('/admin/groups', { method: 'POST', body: { name }, token }),
    updateGroup: (token: string, id: string, name: string) =>
      request<Group>(`/admin/groups/${id}`, { method: 'PUT', body: { name }, token }),
    deleteGroup: (token: string, id: string) =>
      request<{ success: boolean }>(`/admin/groups/${id}`, { method: 'DELETE', token }),
    reorderGroups: (token: string, orders: { id: string; order: number }[]) =>
      request<{ success: boolean }>('/admin/groups/reorder', { method: 'PUT', body: { groupOrders: orders }, token }),

    // 网站
    getSites: (token: string) => request<Site[]>('/admin/sites', { token }),
    createSite: (token: string, site: Partial<Site>) =>
      request<Site>('/admin/sites', { method: 'POST', body: site, token }),
    updateSite: (token: string, id: string, site: Partial<Site>) =>
      request<Site>(`/admin/sites/${id}`, { method: 'PUT', body: site, token }),
    deleteSite: (token: string, id: string) =>
      request<{ success: boolean }>(`/admin/sites/${id}`, { method: 'DELETE', token }),
    reorderSites: (token: string, orders: { id: string; order: number }[]) =>
      request<{ success: boolean }>('/admin/sites/reorder', { method: 'PUT', body: { siteOrders: orders }, token }),

    // 图标
    uploadIcon: async (token: string, file: File): Promise<{ url: string }> => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch(`${API_BASE}/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      return response.json()
    },
    getFavicon: (token: string, url: string) =>
      request<{ url: string } | { error: string }>(`/admin/favicon?url=${encodeURIComponent(url)}`, { token }),
    searchIconify: (token: string, query: string) =>
      request<{ icons: string[] }>(`/admin/iconify/search?q=${encodeURIComponent(query)}`, { token }),

    // 账户
    getAccount: (token: string) => request<{ username: string }>('/admin/account', { token }),
    updateAccount: (token: string, updates: { username?: string; password?: string }) =>
      request<{ success: boolean }>('/admin/account', { method: 'PUT', body: updates, token }),

    // 导入导出
    exportData: (token: string) => request<SitesData>('/admin/export', { token }),
    importData: (token: string, data: SitesData) =>
      request<{ success: boolean }>('/admin/import', { method: 'POST', body: data, token }),
    exportAll: async (token: string): Promise<Blob> => {
      const response = await fetch(`${API_BASE}/admin/export-all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.blob()
    },
  },
}

export { ApiError }
