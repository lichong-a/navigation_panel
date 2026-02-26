import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { readSites, writeSites } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// 更新分组
export async function PUT(request: Request, { params }: RouteParams) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { name } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const data = await readSites()
    const groupIndex = data.groups.findIndex(g => g.id === id)

    if (groupIndex === -1) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    data.groups[groupIndex] = {
      ...data.groups[groupIndex],
      name: name.trim(),
      updatedAt: Date.now(),
    }

    await writeSites(data)
    return NextResponse.json(data.groups[groupIndex])
  } catch (error) {
    console.error('Update group error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 删除分组
export async function DELETE(request: Request, { params }: RouteParams) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await readSites()

    const groupIndex = data.groups.findIndex(g => g.id === id)
    if (groupIndex === -1) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // 删除分组及其下所有网站
    data.groups.splice(groupIndex, 1)
    data.sites = data.sites.filter(s => s.groupId !== id)

    await writeSites(data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete group error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
