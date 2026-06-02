import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_INTERNAL_PLATFORM_API_BASE || ''

const api = axios.create({
  baseURL: apiBaseUrl ? `${apiBaseUrl.replace(/\/$/, '')}/api/v1` : '/api/v1'
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
