import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { readSites, getUploadsDir } from '@/lib/db'
// @ts-expect-error archiver types
import archiver from 'archiver'
import fs from 'fs/promises'
import { Buffer } from 'buffer'

export async function GET(request: Request) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const sitesData = await readSites()
    const uploadsDir = getUploadsDir()

    const archive = archiver('zip', { zlib: { level: 9 } })

    const chunks: Buffer[] = []
    archive.on('data', (chunk: Buffer) => chunks.push(chunk))

    const archiveDone = new Promise<Buffer>((resolve, reject) => {
      archive.on('end', () => resolve(Buffer.concat(chunks)))
      archive.on('error', reject)
    })

    archive.append(JSON.stringify(sitesData, null, 2), { 
      name: 'sites.json',
      date: new Date()
    })

    try {
      const files = await fs.readdir(uploadsDir)
      for (const file of files) {
        const filePath = `${uploadsDir}/${file}`
        const stat = await fs.stat(filePath)
        if (stat.isFile()) {
          const fileBuffer = await fs.readFile(filePath)
          archive.append(fileBuffer, { 
            name: `uploads/${file}`,
            date: stat.mtime
          })
        }
      }
    } catch {
      // uploads 目录不存在或为空，跳过
    }

    await archive.finalize()
    const zipBuffer = await archiveDone

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="nav-panel-backup-${new Date().toISOString().slice(0, 10)}.zip"`,
      },
    })
  } catch (error) {
    console.error('Export all error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
