import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const LandingPage = lazy(() => import('./pages/LandingPage'))
const ShowcasePage = lazy(() => import('./pages/ShowcasePage'))
const JoinUsPage = lazy(() => import('./pages/JoinUsPage'))
const ProductCatalogPage = lazy(() => import('./pages/ProductCatalogPage'))
const ProductOrderPage = lazy(() => import('./pages/ProductOrderPage'))
const PublicSiteAdminPage = lazy(() => import('./pages/PublicSiteAdminPage'))

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="/catalog" element={<ProductCatalogPage />} />
          <Route path="/order" element={<ProductOrderPage />} />
          <Route path="/join-us" element={<JoinUsPage />} />
          <Route path="/careers" element={<Navigate to="/join-us" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cms" element={<CmsRoute><PublicSiteAdminPage /></CmsRoute>} />
          <Route path="/admin/public-site" element={<Navigate to="/cms" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function CmsRoute({ children }) {
  const [unlocked, setUnlocked] = useState(() => window.localStorage.getItem('ruicheng_public_cms_unlocked') === '1')
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const configuredPasscode = import.meta.env.VITE_CMS_PASSCODE || 'ruicheng-cms'

  const submit = (event) => {
    event.preventDefault()
    if (passcode !== configuredPasscode) {
      setError('CMS 密碼不正確。')
      return
    }
    window.localStorage.setItem('ruicheng_public_cms_unlocked', '1')
    setUnlocked(true)
  }

  if (unlocked) return children

  return (
    <main className="cms-gate">
      <form className="cms-gate__panel" onSubmit={submit}>
        <p>Hidden CMS</p>
        <h1>公開官網內容後台</h1>
        <label>
          CMS 密碼
          <input type="password" value={passcode} onChange={(event) => setPasscode(event.target.value)} />
        </label>
        {error && <strong>{error}</strong>}
        <button type="submit">進入 CMS</button>
        <small>正式上線時建議改用 Vercel Protection 或公司 SSO；這裡只保護公開官網 CMS，不處理內部雲端平台登入。</small>
      </form>
    </main>
  )
}

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}

function PageLoading() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0f172a', color: '#94a3b8' }}>
      Loading...
    </div>
  )
}
