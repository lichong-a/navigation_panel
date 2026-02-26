import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { readSites, writeSites } from '@/lib/db'
import type { Site, SiteIcon, OpenMode } from '@/types'
import { generateId, getCurrentTimestamp } from '@/lib/utils'

interface CreateSiteBody {
  groupId: string
  title: string
  description?: string
  icon: SiteIcon
  publicUrl: string
  privateUrl?: string
  openMode: OpenMode
  tags?: string[]
  enabled?: boolean
}

// 获取所有网站
export async function GET(request: Request) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await readSites()
    const sites = data.sites.sort((a, b) => {
      if (a.groupId !== b.groupId) {
        return a.groupId.localeCompare(b.groupId)
      }
      return a.order - b.order
    })
    return NextResponse.json(sites)
  } catch (error) {
    console.error('Get sites error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 创建网站
export async function POST(request: Request) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: CreateSiteBody = await request.json()
    const { groupId, title, description, icon, publicUrl, privateUrl, openMode, tags, enabled } = body

    if (!groupId || !title || !icon || !publicUrl || !openMode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const data = await readSites()

    // 检查分组是否存在
    const group = data.groups.find(g => g.id === groupId)
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 400 })
    }

    // 获取该分组内最大 order
    const groupSites = data.sites.filter(s => s.groupId === groupId)
    const maxOrder = Math.max(0, ...groupSites.map(s => s.order))

    const newSite: Site = {
      id: generateId(),
      groupId,
      title: title.trim(),
      description: description?.trim(),
      icon,
      publicUrl: publicUrl.trim(),
      privateUrl: privateUrl?.trim(),
      openMode,
      tags: tags || [],
      enabled: enabled !== false,
      order: maxOrder + 1,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    }

    data.sites.push(newSite)
    await writeSites(data)

    return NextResponse.json(newSite)
  } catch (error) {
    console.error('Create site error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
