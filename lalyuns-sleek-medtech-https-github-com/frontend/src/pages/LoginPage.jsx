import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { getPublicFontStack, getPublicHeadingWeight, getPublicPageBackgroundStyle, usePublicSiteContent } from '../content/publicSiteContent'
import useAuthStore from '../store/authStore'

export default function LoginPage() {
  const content = usePublicSiteContent()
  const { login: loginContent = {} } = content
  const publicFontFamily = getPublicFontStack(content.fontFamily)
  const publicHeadingWeight = getPublicHeadingWeight(content.headingWeight)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const nextPath = location.state?.next || '/projects'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      login(data.access_token, data.refresh_token)
      navigate(nextPath)
    } catch {
      setError(loginContent.errorMessage)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: publicFontFamily,
        ...getPublicPageBackgroundStyle(content, 'login', '#0f172a', '15, 23, 42')
      }}
    >
      <form onSubmit={handleSubmit} style={{ background: '#1e293b', padding: 40, borderRadius: 8, width: 360, color: '#f1f5f9' }}>
        <h2 style={{ marginBottom: 24, textAlign: 'center', fontWeight: publicHeadingWeight }}>{loginContent.title}</h2>
        {error && <p style={{ color: '#f87171', marginBottom: 16 }}>{error}</p>}
        <label style={{ display: 'block', marginBottom: 8 }}>{loginContent.emailLabel}</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9', marginBottom: 16 }}
        />
        <label style={{ display: 'block', marginBottom: 8 }}>{loginContent.passwordLabel}</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9', marginBottom: 24 }}
        />
        <button
          type="submit"
          style={{ width: '100%', padding: '10px', borderRadius: 6, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
        >
          {loginContent.submitLabel}
        </button>
      </form>
    </div>
  )
}
