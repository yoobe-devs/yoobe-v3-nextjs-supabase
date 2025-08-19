import jwt from 'jsonwebtoken'

const JWT_PUBLIC_KEY = process.env.SSO_JWT_PUBLIC_KEY?.replace(/\\n/g, '\n') || ''

export function verifySsoJwt(token: string): any {
  if (!JWT_PUBLIC_KEY) throw new Error('SSO_JWT_PUBLIC_KEY não configurada')
  return jwt.verify(token, JWT_PUBLIC_KEY, { algorithms: ['RS256', 'HS256'] })
}


