import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { writeSites } from '@/lib/db'
import type { SitesData } from '@/types'

export async function POST(request: Request) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: SitesData = await request.json()

    // 验证数据结构
    if (!body.groups || !Array.isArray(body.groups)) {
      return NextResponse.json({ error: 'Invalid data: groups array required' }, { status: 400 })
    }

    if (!body.sites || !Array.isArray(body.sites)) {
      return NextResponse.json({ error: 'Invalid data: sites array required' }, { status: 400 })
    }

    // 直接覆盖
    await writeSites(body)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
