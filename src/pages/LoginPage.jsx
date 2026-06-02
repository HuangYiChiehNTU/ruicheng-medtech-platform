import { Link } from 'react-router-dom'
import { getPublicFontStack, getPublicHeadingWeight, getPublicPageBackgroundStyle, usePublicSiteContent } from '../content/publicSiteContent'

export default function LoginPage() {
  const content = usePublicSiteContent()
  const { login: loginContent = {} } = content
  const publicFontFamily = getPublicFontStack(content.fontFamily)
  const publicHeadingWeight = getPublicHeadingWeight(content.headingWeight)
  const internalPlatformUrl = import.meta.env.VITE_INTERNAL_PLATFORM_URL || ''

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: 24,
        fontFamily: publicFontFamily,
        ...getPublicPageBackgroundStyle(content, 'login', '#0f172a', '15, 23, 42')
      }}
    >
      <section style={{ background: '#1e293b', padding: 40, borderRadius: 8, width: 'min(440px, 100%)', color: '#f1f5f9' }}>
        <p style={{ margin: '0 0 10px', color: '#93c5fd', fontWeight: 800 }}>Internal Cloud Platform</p>
        <h1 style={{ margin: '0 0 16px', fontSize: 32, lineHeight: 1.25, fontWeight: publicHeadingWeight }}>
          {loginContent.title || '內部雲端系統入口'}
        </h1>
        <p style={{ margin: '0 0 24px', color: '#cbd5e1', lineHeight: 1.8 }}>
          官網已和內部醫材版本控制雲端平台切開。若您是醫師、醫院、廠商、投資人或內部人員，請前往正式內部平台登入查看專案資料。
        </p>
        {internalPlatformUrl ? (
          <a
            href={internalPlatformUrl}
            style={{ display: 'block', width: '100%', padding: '12px 16px', borderRadius: 6, background: '#3b82f6', color: '#fff', fontWeight: 800, textAlign: 'center', textDecoration: 'none' }}
          >
            前往內部雲端平台
          </a>
        ) : (
          <p style={{ margin: '0 0 20px', padding: 14, borderRadius: 6, background: '#0f172a', color: '#cbd5e1' }}>
            尚未設定內部平台網址。請在 Vercel 環境變數設定 <strong>VITE_INTERNAL_PLATFORM_URL</strong>。
          </p>
        )}
        <Link to="/" style={{ display: 'inline-block', marginTop: 20, color: '#bfdbfe', fontWeight: 700 }}>
          返回官網首頁
        </Link>
      </section>
    </div>
  )
}
