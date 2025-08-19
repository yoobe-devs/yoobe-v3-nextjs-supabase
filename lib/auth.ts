import { apiFetch, setAuthToken } from '@/lib/api'

export type LoginCredentials = {
  username: string
  password: string
}

export type LoginResponse = {
  access_token: string
  token_type?: string
  expires_in?: number
  scope?: string
  created_at?: number
}

export async function loginWithPassword({ username, password }: LoginCredentials) {
  const data = await apiFetch<LoginResponse>('/spree_oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      grant_type: 'password',
      username,
      password,
    },
  })
  if (!data?.access_token) throw new Error('Falha ao autenticar')
  setAuthToken(data.access_token)
  return data
}

export async function generateApiKey(email: string, password: string) {
  const resp = await apiFetch<any>('/auth/api-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: { email, password },
  })
  return resp
}


