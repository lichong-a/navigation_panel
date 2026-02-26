import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { readSites, writeSites } from '@/lib/db'

export async function PUT(request: Request) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { groupOrders } = await request.json()

    if (!Array.isArray(groupOrders)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const data = await readSites()

    groupOrders.forEach(({ id, order }) => {
      const group = data.groups.find((g) => g.id === id)
      if (group) {
        group.order = order
      }
    })

    await writeSites(data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder groups error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
