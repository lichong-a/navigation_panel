import { NextResponse } from 'next/server'
import { readSites } from '@/lib/db'

export async function GET() {
  try {
    const data = await readSites()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Get sites error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
