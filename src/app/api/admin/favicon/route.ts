import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: Request) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const targetUrl = new URL(url)

    // 尝试多种 favicon 路径
    const faviconPaths = [
      '/favicon.ico',
      '/favicon.png',
      '/favicon.svg',
      '/apple-touch-icon.png',
    ]

    for (const path of faviconPaths) {
      try {
        const faviconUrl = new URL(path, targetUrl.origin)
        const response = await fetch(faviconUrl.toString(), {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000),
        })

        if (response.ok) {
          return NextResponse.json({ url: faviconUrl.toString() })
        }
      } catch {
        continue
      }
    }

    // 尝试解析 HTML 获取 favicon
    try {
      const htmlResponse = await fetch(targetUrl.toString(), {
        signal: AbortSignal.timeout(10000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RicPanelBot/1.0)',
        },
      })

      if (htmlResponse.ok) {
        const html = await htmlResponse.text()

        // 查找 link rel="icon" 或 rel="shortcut icon"
        const iconMatch = html.match(/<link[^>]*(?:rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*href=["']([^"']+)["']|href=["']([^"']+)["'][^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'])[^>]*>/i)

        if (iconMatch) {
          const iconPath = iconMatch[1] || iconMatch[2]
          if (iconPath) {
            const faviconUrl = new URL(iconPath, targetUrl.origin)
            return NextResponse.json({ url: faviconUrl.toString() })
          }
        }
      }
    } catch {
      // 忽略解析错误
    }

    return NextResponse.json({ error: 'Favicon not found' }, { status: 404 })
  } catch (error) {
    console.error('Favicon fetch error:', error)
    return NextResponse.json({ error: 'Invalid URL or fetch failed' }, { status: 400 })
  }
}
