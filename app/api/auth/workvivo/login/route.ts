export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getWorkvivoClient, generatePkce, getCookieOptions } from '@/lib/workvivo/oidc'

export async function GET() {
  try {
    if (process.env.WORKVIVO_SSO_ENABLED !== '1') {
      return NextResponse.json({ error: 'Workvivo SSO desabilitado' }, { status: 404 })
    }
    const client = await getWorkvivoClient()
    const { codeVerifier, codeChallenge } = await generatePkce()

    const state = crypto.randomUUID()
    const nonce = crypto.randomUUID()

    const url = client.authorizationUrl({
      scope: 'openid profile email',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
      nonce,
    })

    const cookieOpts = getCookieOptions()
    const jar = cookies()
    jar.set('wv_pkce_verifier', codeVerifier, cookieOpts)
    jar.set('wv_state', state, cookieOpts)
    jar.set('wv_nonce', nonce, cookieOpts)

    return NextResponse.redirect(url)
  } catch (e) {
    console.error('Workvivo login init error:', e)
    return NextResponse.json({ error: 'Falha ao iniciar login com Workvivo' }, { status: 500 })
  }
}
