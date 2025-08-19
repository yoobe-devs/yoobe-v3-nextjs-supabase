import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  cookies().delete('yoobe_sso_token')
  return NextResponse.json({ ok: true })
}


