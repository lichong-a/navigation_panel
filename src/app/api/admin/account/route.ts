import { NextResponse } from 'next/server'
import { verifyAuth, updateAccount } from '@/lib/auth'
import { readConfig } from '@/lib/db'

// 获取当前账户信息
export async function GET(request: Request) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const config = await readConfig()
    return NextResponse.json({ username: config.admin.username })
  } catch (error) {
    console.error('Get account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 更新账户信息
export async function PUT(request: Request) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { username, password } = body

    if (!username && !password) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const result = await updateAccount(user.username, { username, password })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
