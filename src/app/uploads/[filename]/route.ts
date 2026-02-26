import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { getUploadsDir } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    const uploadsDir = getUploadsDir()
    const filepath = path.join(uploadsDir, filename)

    // 安全检查：确保文件在 uploads 目录内
    const resolvedPath = path.resolve(filepath)
    if (!resolvedPath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const fileBuffer = await fs.readFile(filepath)

    // 根据扩展名确定 MIME 类型
    const ext = filename.split('.').pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      ico: 'image/x-icon',
      webp: 'image/webp',
    }
    const contentType = mimeTypes[ext || ''] || 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
