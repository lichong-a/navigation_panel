import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { getUploadsDir } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params
    const uploadsDir = getUploadsDir()
    const filePath = path.join(uploadsDir, ...pathSegments)

    // 安全检查：确保文件在 uploads 目录内
    const resolvedPath = path.resolve(filePath)
    if (!resolvedPath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const file = await fs.readFile(resolvedPath)

    // 简单的 MIME 类型检测
    const ext = path.extname(resolvedPath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.webp': 'image/webp',
    }

    const contentType = mimeTypes[ext] || 'application/octet-stream'

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
