import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { readSites, writeSites } from '@/lib/db'
import type { Group } from '@/types'
import { generateId, getCurrentTimestamp } from '@/lib/utils'

// 获取所有分组
export async function GET(request: Request) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await readSites()
    const groups = data.groups.sort((a, b) => a.order - b.order)
    return NextResponse.json(groups)
  } catch (error) {
    console.error('Get groups error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 创建分组
export async function POST(request: Request) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const data = await readSites()
    const maxOrder = Math.max(0, ...data.groups.map(g => g.order))

    const newGroup: Group = {
      id: generateId(),
      name: name.trim(),
      order: maxOrder + 1,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    }

    data.groups.push(newGroup)
    await writeSites(data)

    return NextResponse.json(newGroup)
  } catch (error) {
    console.error('Create group error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
