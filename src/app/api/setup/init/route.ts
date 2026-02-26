import { NextResponse } from 'next/server'
import { initializeAdmin } from '@/lib/auth'
import { isInitialized } from '@/lib/db'

export async function POST(request: Request) {
  try {
    // 检查是否已初始化
    const initialized = await isInitialized()
    if (initialized) {
      return NextResponse.json({ success: false, error: 'Already initialized' }, { status: 400 })
    }

    const body = await request.json()
    const { username, password } = body

    const result = await initializeAdmin(username, password)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
