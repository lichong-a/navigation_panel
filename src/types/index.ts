// 分组
export interface Group {
  id: string
  name: string
  order: number
  createdAt: number
  updatedAt: number
}

// 图标类型
export type IconType = 'iconify' | 'uploaded' | 'favicon'

export interface SiteIcon {
  type: IconType
  value: string
}

// 打开方式
export type OpenMode = 'current' | 'blank' | 'modal'

// 网站
export interface Site {
  id: string
  groupId: string
  title: string
  description?: string
  icon: SiteIcon
  publicUrl: string
  privateUrl?: string
  openMode: OpenMode
  tags?: string[]
  enabled: boolean
  order: number
  createdAt: number
  updatedAt: number
}

// 数据存储
export interface SitesData {
  groups: Group[]
  sites: Site[]
}

// 配置
export interface Config {
  initialized: boolean
  admin: {
    username: string
    passwordHash: string
  }
  jwtSecret: string
  createdAt: number
}

// API 响应类型
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// 认证状态
export interface AuthState {
  isLoggedIn: boolean
  token: string | null
}

// 设置状态
export interface SettingsState {
  networkMode: 'public' | 'private'
}
