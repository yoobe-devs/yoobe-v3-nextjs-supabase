import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifySsoJwt } from '@/lib/jwt'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const state = searchParams.get('state') || '/'
  if (!token) return NextResponse.json({ error: 'Token ausente' }, { status: 400 })

  try {
    const payload = verifySsoJwt(token)
    // opcional: validar claims (aud, iss, exp, iat)
    cookies().set('yoobe_sso_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 8, // 8h
    })
    return NextResponse.redirect(new URL(state, process.env.NEXT_PUBLIC_APP_URL))
  } catch (e) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }
}


