import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { saveUploadFile } from '@/lib/db'

export async function POST(request: Request) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 检查文件类型
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // 检查文件大小 (最大 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 2MB)' }, { status: 400 })
    }

    const url = await saveUploadFile(file)
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
