import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { readSites, writeSites } from '@/lib/db'
import type { Site } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

type UpdateSiteBody = Partial<Omit<Site, 'id' | 'createdAt' | 'updatedAt'>>

// 更新网站
export async function PUT(request: Request, { params }: RouteParams) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body: UpdateSiteBody = await request.json()

    const data = await readSites()
    const siteIndex = data.sites.findIndex(s => s.id === id)

    if (siteIndex === -1) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    const currentSite = data.sites[siteIndex]

    // 如果更换分组，重新计算 order
    let newOrder = currentSite.order
    if (body.groupId && body.groupId !== currentSite.groupId) {
      const groupSites = data.sites.filter(s => s.groupId === body.groupId)
      newOrder = Math.max(0, ...groupSites.map(s => s.order)) + 1
    }

    data.sites[siteIndex] = {
      ...currentSite,
      ...body,
      order: newOrder,
      updatedAt: Date.now(),
    }

    await writeSites(data)
    return NextResponse.json(data.sites[siteIndex])
  } catch (error) {
    console.error('Update site error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 删除网站
export async function DELETE(request: Request, { params }: RouteParams) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await readSites()

    const siteIndex = data.sites.findIndex(s => s.id === id)
    if (siteIndex === -1) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    data.sites.splice(siteIndex, 1)
    await writeSites(data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete site error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
