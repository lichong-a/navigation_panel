import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: Request) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ icons: [] })
  }

  try {
    // 使用 Iconify API 搜索图标
    const response = await fetch(
      `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=50`,
      {
        signal: AbortSignal.timeout(10000),
      }
    )

    if (!response.ok) {
      return NextResponse.json({ icons: [] })
    }

    const data = await response.json()
    return NextResponse.json({ icons: data.icons || [] })
  } catch (error) {
    console.error('Iconify search error:', error)
    return NextResponse.json({ icons: [] })
  }
}
