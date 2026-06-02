import axios from 'axios'

function buildApiBaseUrl(baseUrl) {
  return baseUrl ? `${String(baseUrl).replace(/\/$/, '')}/api/v1` : '/api/v1'
}

const publicSiteApiBaseUrl = import.meta.env.VITE_PUBLIC_SITE_API_BASE || ''
const internalPlatformReadApiBaseUrl = import.meta.env.VITE_INTERNAL_PLATFORM_READ_API_BASE || import.meta.env.VITE_INTERNAL_PLATFORM_API_BASE || ''

const api = axios.create({ baseURL: buildApiBaseUrl(publicSiteApiBaseUrl) })

export const readPlatformApi = axios.create({
  baseURL: buildApiBaseUrl(internalPlatformReadApiBaseUrl)
})

api.interceptors.request.use((config) => {
  const cmsToken = localStorage.getItem('ruicheng_public_cms_token')
  if (cmsToken) config.headers.Authorization = `Bearer ${cmsToken}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
)

export default api
