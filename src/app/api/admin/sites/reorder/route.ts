import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { readSites, writeSites } from '@/lib/db'

interface ReorderBody {
  siteOrders: { id: string; order: number; groupId?: string }[]
}

// 批量更新网站排序
export async function PUT(request: Request) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: ReorderBody = await request.json()
    const { siteOrders } = body

    if (!Array.isArray(siteOrders)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const data = await readSites()

    for (const item of siteOrders) {
      const site = data.sites.find(s => s.id === item.id)
      if (site) {
        site.order = item.order
        if (item.groupId !== undefined) {
          site.groupId = item.groupId
        }
        site.updatedAt = Date.now()
      }
    }

    await writeSites(data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder sites error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
