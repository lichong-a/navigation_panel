import { NextResponse } from 'next/server'
import { isInitialized } from '@/lib/db'

export async function GET() {
  const initialized = await isInitialized()
  return NextResponse.json({ initialized })
}
