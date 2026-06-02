function trimTrailingSlash(value) {
  return String(value || '').replace(/\/$/, '')
}

function ensureLeadingSlash(value) {
  const path = String(value || '')
  if (!path) return ''
  return path.startsWith('/') ? path : `/${path}`
}

function buildPlatformUrl(explicitUrl, fallbackPath) {
  if (explicitUrl) return explicitUrl
  const baseUrl = trimTrailingSlash(import.meta.env.VITE_INTERNAL_PLATFORM_URL || 'https://platform.iamedical.co')
  if (!baseUrl) return ''
  return `${baseUrl}${ensureLeadingSlash(fallbackPath)}`
}

export const internalPlatformLinks = {
  home: trimTrailingSlash(import.meta.env.VITE_INTERNAL_PLATFORM_URL || 'https://platform.iamedical.co'),
  catalog: buildPlatformUrl(
    import.meta.env.VITE_INTERNAL_PLATFORM_CATALOG_URL,
    import.meta.env.VITE_INTERNAL_PLATFORM_CATALOG_PATH || '/catalog'
  ),
  login: buildPlatformUrl(
    import.meta.env.VITE_INTERNAL_PLATFORM_LOGIN_URL,
    import.meta.env.VITE_INTERNAL_PLATFORM_LOGIN_PATH || '/login'
  )
}

export function isExternalUrl(url) {
  return /^https?:\/\//i.test(String(url || ''))
}
