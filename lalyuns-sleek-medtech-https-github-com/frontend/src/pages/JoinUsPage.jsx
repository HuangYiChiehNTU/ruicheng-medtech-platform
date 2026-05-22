import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePublicSiteContent } from '../content/publicSiteContent'
import '../styles/landing.css'

export default function JoinUsPage() {
  const [submitted, setSubmitted] = useState(false)
  const content = usePublicSiteContent()
  const join = content.join

  useEffect(() => {
    document.title = join.pageTitle || `加入我們 | ${content.brand}`
  }, [content.brand, join.pageTitle])

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
    event.currentTarget.reset()
  }

  return (
    <main className="landing-page join-page">
      <header className="public-nav">
        <Link className="public-brand" to="/">
          {content.logoUrl ? <img src={content.logoUrl} alt={content.logoAlt || content.brand} /> : <span />}
          {content.brand}
        </Link>
        <nav>
          <Link to="/">官方網站</Link>
          <a href="#roles">合作方向</a>
          <a href="#join-application">申請</a>
          <Link to="/login">登入</Link>
        </nav>
      </header>

      <section className="landing-hero join-hero">
        <div className="landing-hero__copy">
          <p className="landing-kicker">Join Us</p>
          <h1>{join.heroTitle}</h1>
          <p>{join.heroSubtitle}</p>
          <div className="landing-actions">
            <a className="landing-button landing-button--primary" href="#join-application">填寫加入申請</a>
            <Link className="landing-button landing-button--ghost" to="/">了解公司</Link>
          </div>
        </div>
      </section>

      <section className="landing-section landing-band">
        <div className="landing-section__heading">
          <p className="landing-kicker">Why Join Us</p>
          <h2>{join.whyTitle}</h2>
        </div>
        <div className="landing-card-grid four">
          {join.reasons.map((reason) => (
            <article className="landing-card" key={reason}>
              <h3>{reason}</h3>
              <p>你會接觸醫療、工程、設計與資料系統的交會處，和團隊一起把需求變成可用流程</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section" id="roles">
        <div className="landing-section__heading">
          <p className="landing-kicker">Open Roles / 合作方向</p>
          <h2>{join.rolesTitle}</h2>
        </div>
        <div className="landing-card-grid two">
          {join.roles.map(({ title, text }) => (
            <article className="landing-card landing-card--large" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-compare">
        <div className="landing-section__heading">
          <p className="landing-kicker">Who We Are Looking For</p>
          <h2>{join.fitTitle}</h2>
        </div>
        <div className="fit-list">
          {join.fit.map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>

      <section className="landing-section application-section" id="join-application">
        <div className="landing-section__heading">
          <p className="landing-kicker">Application Form</p>
          <h2>{join.applicationTitle}</h2>
          <p>{join.applicationIntro}</p>
        </div>
        {submitted ? (
          <div className="success-panel">{join.success}</div>
        ) : (
          <form className="landing-form" onSubmit={handleSubmit}>
            <FormInput label="姓名" name="name" required />
            <FormInput label="Email" name="email" type="email" required />
            <FormInput label="電話" name="phone" />
            <FormSelect label="身份類型" name="role" options={['學生', '工程師', '設計師', '醫療背景', '業務開發', '其他']} />
            <FormInput label="感興趣方向" name="interest" required />
            <FormInput label="履歷或作品集連結" name="portfolio" />
            <label className="full">
              自我介紹
              <textarea name="intro" rows="5" required />
            </label>
            <button className="landing-button landing-button--primary" type="submit">送出申請</button>
          </form>
        )}
      </section>

      <footer className="landing-footer">
        <div>
          <h2>{content.brand}</h2>
          <p>{join.footerText}</p>
        </div>
        <nav>
          <Link to="/">官方網站</Link>
          <Link to="/login">內部系統登入</Link>
        </nav>
      </footer>
    </main>
  )
}

function FormInput({ label, ...props }) {
  return (
    <label>
      {label}
      <input {...props} />
    </label>
  )
}

function FormSelect({ label, options, ...props }) {
  return (
    <label>
      {label}
      <select {...props}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  )
}
