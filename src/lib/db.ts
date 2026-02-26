import fs from 'fs/promises'
import path from 'path'
import type { Config, SitesData } from '@/types'

const DATA_DIR = path.join(process.cwd(), 'data')
const CONFIG_PATH = path.join(DATA_DIR, 'config.json')
const SITES_PATH = path.join(DATA_DIR, 'sites.json')
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads')

// 确保数据目录存在
async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.mkdir(UPLOADS_DIR, { recursive: true })
}

// 初始化默认配置
function getDefaultConfig(): Config {
  return {
    initialized: false,
    admin: {
      username: '',
      passwordHash: '',
    },
    jwtSecret: generateSecret(),
    createdAt: Date.now(),
  }
}

// 初始化默认站点数据
function getDefaultSites(): SitesData {
  return {
    groups: [],
    sites: [],
  }
}

// 生成随机密钥
function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// ============ Config 操作 ============

export async function readConfig(): Promise<Config> {
  await ensureDataDir()
  try {
    const content = await fs.readFile(CONFIG_PATH, 'utf-8')
    return JSON.parse(content)
  } catch {
    const defaultConfig = getDefaultConfig()
    await fs.writeFile(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2))
    return defaultConfig
  }
}

export async function writeConfig(config: Config): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2))
}

export async function isInitialized(): Promise<boolean> {
  const config = await readConfig()
  return config.initialized === true
}

// ============ Sites 操作 ============

export async function readSites(): Promise<SitesData> {
  await ensureDataDir()
  try {
    const content = await fs.readFile(SITES_PATH, 'utf-8')
    return JSON.parse(content)
  } catch {
    const defaultSites = getDefaultSites()
    await fs.writeFile(SITES_PATH, JSON.stringify(defaultSites, null, 2))
    return defaultSites
  }
}

export async function writeSites(data: SitesData): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(SITES_PATH, JSON.stringify(data, null, 2))
}

// ============ 上传文件 ============

export function getUploadsDir(): string {
  return UPLOADS_DIR
}

export async function saveUploadFile(file: File): Promise<string> {
  await ensureDataDir()

  const ext = file.name.split('.').pop() || 'bin'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const filepath = path.join(UPLOADS_DIR, filename)

  const arrayBuffer = await file.arrayBuffer()
  await fs.writeFile(filepath, Buffer.from(arrayBuffer))

  return `/uploads/${filename}`
}

export async function fileExists(relativePath: string): Promise<boolean> {
  try {
    const fullPath = path.join(DATA_DIR, relativePath)
    await fs.access(fullPath)
    return true
  } catch {
    return false
  }
}

// ============ 数据导出 ============

export async function exportAllData(): Promise<{ sitesData: SitesData; uploads: Map<string, Buffer> }> {
  const sitesData = await readSites()
  const uploads = new Map<string, Buffer>()

  // 收集所有上传的文件
  const uploadedIcons = sitesData.sites
    .filter(site => site.icon.type === 'uploaded')
    .map(site => site.icon.value)

  for (const iconPath of uploadedIcons) {
    if (iconPath.startsWith('/uploads/')) {
      const filename = iconPath.replace('/uploads/', '')
      const fullPath = path.join(UPLOADS_DIR, filename)
      try {
        const buffer = await fs.readFile(fullPath)
        uploads.set(filename, buffer)
      } catch {
        // 文件不存在则跳过
      }
    }
  }

  return { sitesData, uploads }
}
