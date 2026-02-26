import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'
import { isInitialized } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const initialized = await isInitialized()
    if (!initialized) {
      return NextResponse.json({ success: false, error: 'Not initialized' }, { status: 400 })
    }

    const body = await request.json()
    const { username, password } = body

    const result = await login(username, password)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 })
    }

    return NextResponse.json({ token: result.token })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
