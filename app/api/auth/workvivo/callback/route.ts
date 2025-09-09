export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { getWorkvivoClient } from '@/lib/workvivo/oidc'
import { getServiceClient } from '@/lib/supabase/admin'

function siteUrl() {
  // Prefer explicit SITE URL, fallback to NEXT_PUBLIC_SITE_URL
  return (
    process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  )
}

export async function GET(req: Request) {
  try {
    if (process.env.WORKVIVO_SSO_ENABLED !== '1') {
      return NextResponse.json({ error: 'Workvivo SSO desabilitado' }, { status: 404 })
    }
    const url = new URL(req.url)
    const code = url.searchParams.get('code') || undefined
    const state = url.searchParams.get('state') || undefined

    if (!code || !state) {
      return NextResponse.json({ error: 'Código/state ausente' }, { status: 400 })
    }

    const jar = cookies()
    const savedState = jar.get('wv_state')?.value
    const verifier = jar.get('wv_pkce_verifier')?.value
    const nonce = jar.get('wv_nonce')?.value

    if (!savedState || !verifier || !nonce) {
      return NextResponse.json({ error: 'Sessão de login inválida/expirada' }, { status: 400 })
    }
    if (state !== savedState) {
      return NextResponse.json({ error: 'State inválido' }, { status: 400 })
    }

    const client = await getWorkvivoClient()
    const params = {
      code,
      state,
    }
    const checks = { state, nonce, code_verifier: verifier }

    const tokenSet = await client.callback(process.env.WORKVIVO_OIDC_REDIRECT_URI!, params, checks)
    const claims = tokenSet.claims()

    const email = (claims.email as string) || ''
    const sub = (claims.sub as string) || ''

    if (!email) {
      return NextResponse.json({ error: 'Email não presente no ID Token' }, { status: 400 })
    }

    // Log in the user to Supabase by issuing a magic link after successful OIDC verification
    const supabase = getServiceClient()

    // Ensure application user exists and propagate role/company to auth metadata
    try {
      // Upsert into app users table
      const defaultCompany = process.env.DEFAULT_COMPANY_ID || null
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, role, company_id')
        .eq('email', email)
        .single()

      let appUserId = existingUser?.id
      let role = existingUser?.role || 'user'
      let companyId = existingUser?.company_id || defaultCompany

      if (!existingUser) {
        const { data: inserted } = await supabase
          .from('users')
          .insert({
            email,
            name: claims.name || email,
            full_name: claims.name || email,
            role,
            status: 'active',
            company_id: companyId,
          })
          .select('id, role, company_id')
          .single()
        appUserId = inserted?.id || null
        role = inserted?.role || role
        companyId = inserted?.company_id || companyId
      }

      // Ensure auth user exists and has metadata role/company
      const { data: authUserByEmail } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1,
        email: email,
      })
      const authUser = authUserByEmail?.users?.[0]
      if (authUser) {
        await supabase.auth.admin.updateUserById(authUser.id, {
          user_metadata: { provider: 'workvivo', workvivo_sub: sub, role, company_id: companyId },
        })
      }
    } catch (userSyncErr) {
      console.warn('Workvivo SSO user sync warning:', userSyncErr)
    }

    // Try to generate magic link directly. If user does not exist, create and retry.
    const redirectTo = `${siteUrl()}/choose-environment`

    async function generateMagicLink() {
      return await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo,
          data: { workvivo_sub: sub, provider: 'workvivo' },
        },
      })
    }

    let link = await generateMagicLink()
    if (link.error) {
      // Attempt to create user, then try again
      await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { workvivo_sub: sub, provider: 'workvivo' },
      })
      link = await generateMagicLink()
      if (link.error) {
        console.error('Erro ao gerar magiclink:', link.error)
        return NextResponse.json({ error: 'Não foi possível autenticar no Supabase' }, { status: 500 })
      }
    }

    // Cleanup transient cookies
    jar.delete('wv_state')
    jar.delete('wv_pkce_verifier')
    jar.delete('wv_nonce')

    const actionLink = (link.data as any)?.properties?.action_link || (link.data as any)?.action_link
    if (!actionLink) {
      return NextResponse.json({ error: 'Magic link inválido' }, { status: 500 })
    }

    return NextResponse.redirect(actionLink)
  } catch (e) {
    console.error('Workvivo callback error:', e)
    return NextResponse.json({ error: 'Falha no callback Workvivo' }, { status: 500 })
  }
}
