export type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
  signal?: AbortSignal
}

export class ApiError extends Error {
  status: number
  details?: unknown
  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

let inMemoryToken: string | null = null

export function setAuthToken(token: string | null) {
  inMemoryToken = token
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('YOOBE_API_TOKEN', token)
    else localStorage.removeItem('YOOBE_API_TOKEN')
  }
}

export function getAuthToken(): string | null {
  if (inMemoryToken) return inMemoryToken
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('YOOBE_API_TOKEN')
    if (stored) inMemoryToken = stored
  }
  return inMemoryToken
}

function buildUrl(path: string, query?: ApiRequestOptions['query']) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  const url = new URL(path.replace(/^\//, ''), baseUrl.endsWith('/') ? baseUrl : baseUrl + '/')
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return url.toString()
}

export async function apiFetch<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, query, signal } = options

  const url = buildUrl(path, query)

  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
  }

  // Optional bearer token for authenticated routes
  const apiToken = getAuthToken() || process.env.NEXT_PUBLIC_API_TOKEN || undefined
  if (apiToken) {
    defaultHeaders['Authorization'] = `Bearer ${apiToken}`
  }

  // Only set content-type when there is a JSON body
  let requestBody: BodyInit | undefined
  if (body !== undefined && body !== null) {
    defaultHeaders['Content-Type'] = 'application/json'
    requestBody = JSON.stringify(body)
  }

  const response = await fetch(url, {
    method,
    headers: { ...defaultHeaders, ...headers },
    body: requestBody,
    signal,
    // Next.js fetch cache may be tuned per endpoint if needed
    // cache: 'no-store',
  })

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const responseData = isJson ? await response.json().catch(() => undefined) : await response.text().catch(() => undefined)

  if (!response.ok) {
    const message = (isJson && responseData && (responseData.message || responseData.error))
      ? String(responseData.message || responseData.error)
      : `Request failed with status ${response.status}`
    throw new ApiError(message, response.status, responseData)
  }

  return (responseData as T)
}


