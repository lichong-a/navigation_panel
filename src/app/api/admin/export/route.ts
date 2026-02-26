import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { readSites } from '@/lib/db'

export async function GET(request: Request) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await readSites()

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="sites-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
