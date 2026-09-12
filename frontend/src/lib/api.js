const rawApiBaseUrl = String(
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ''
).trim()

const normalizedApiBaseUrl = rawApiBaseUrl.replace(/\/$/, '')

// `/api` is the internal proxy path used by Docker/nginx. The endpoint
// callers already include `/api`, so keep it relative instead of producing
// `/api/api/...`.
export const API_BASE_URL = normalizedApiBaseUrl === '/api'
  ? ''
  : normalizedApiBaseUrl

export function apiUrl(path) {
  const normalizedPath = path ? (path.startsWith('/') ? path : `/${path}`) : ''
  if (!API_BASE_URL) return normalizedPath || '/'
  return `${API_BASE_URL}${normalizedPath}`
}
