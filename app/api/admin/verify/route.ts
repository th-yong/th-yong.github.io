import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    const isValid = verifyPassword(password)
    
    return NextResponse.json({ valid: isValid })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}

