import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api/client'
import useAuthStore from '../store/authStore'

export default function LoginPage() {
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
      setError('Email 或密碼錯誤')
    }
  }

  return (
    <div className="login-page login-page--nable">
      <div className="login-bubbles" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <form className="login-panel login-panel--nable" onSubmit={handleSubmit}>
        <div className="login-brand">
          <span className="ops-brand-mark">睿</span>
          <div>
            <strong>睿程生醫</strong>
            <span>內部協作平台</span>
          </div>
        </div>
        <h1>登入</h1>
        <p className="login-subtitle">查看模型版本、材料、BOM、報告與稽核紀錄</p>
        {error && <p className="login-error">{error}</p>}
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <label>密碼</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button className="ops-primary" type="submit">
          登入
        </button>
      </form>
    </div>
  )
}
