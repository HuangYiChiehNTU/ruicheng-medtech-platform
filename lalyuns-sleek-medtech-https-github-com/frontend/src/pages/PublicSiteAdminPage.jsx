import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  defaultPublicSiteContent,
  fetchPublicSiteContent,
  getPublicSiteContent,
  PUBLIC_SITE_PENDING_KEY,
  resetPublicSiteContent,
  savePublicSiteContent,
  savePublicSiteContentToServer
} from '../content/publicSiteContent'
import useAuthStore from '../store/authStore'
import '../styles/publicSiteAdmin.css'

const LEAVE_MESSAGE = '你有尚未儲存的官網內容變更，確定要離開嗎？'

export default function PublicSiteAdminPage() {
  const { user, logout } = useAuthStore()
  const [draft, setDraft] = useState(() => getPublicSiteContent())
  const [jsonText, setJsonText] = useState(() => JSON.stringify(getPublicSiteContent(), null, 2))
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(getPublicSiteContent()))
  const [status, setStatus] = useState(() => (
    window.localStorage.getItem(PUBLIC_SITE_PENDING_KEY) === '1'
      ? '目前瀏覽器有尚未發布到資料庫的草稿。請重新登入高權限帳號後按「儲存內容」發布。'
      : ''
  ))
  const [activeTab, setActiveTab] = useState('home')

  const roleLabel = useMemo(() => user?.role || user?.user_role || 'admin', [user])
  const draftSnapshot = useMemo(() => JSON.stringify(draft), [draft])
  const isDirty = draftSnapshot !== savedSnapshot || jsonText !== JSON.stringify(draft, null, 2)

  useEffect(() => {
    if (!isDirty) return undefined

    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = LEAVE_MESSAGE
      return LEAVE_MESSAGE
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    if (window.localStorage.getItem(PUBLIC_SITE_PENDING_KEY) === '1') {
      return
    }

    fetchPublicSiteContent()
      .then((serverContent) => {
        setDraft(serverContent)
        setJsonText(JSON.stringify(serverContent, null, 2))
        setSavedSnapshot(JSON.stringify(serverContent))
      })
      .catch(() => {})
  }, [])

  const confirmLeave = () => !isDirty || window.confirm(LEAVE_MESSAGE)

  const guardNavigation = (event) => {
    if (!confirmLeave()) event.preventDefault()
  }

  const guardedLogout = () => {
    if (confirmLeave()) logout()
  }

  const updateLanding = (field, value) => {
    setDraft((current) => ({ ...current, landing: { ...current.landing, [field]: value } }))
  }

  const updateJoin = (field, value) => {
    setDraft((current) => ({ ...current, join: { ...current.join, [field]: value } }))
  }

  const updateCustomSection = (index, field, value) => {
    setDraft((current) => ({
      ...current,
      customSections: getCustomSections(current).map((section, sectionIndex) => (
        sectionIndex === index ? { ...section, [field]: value } : section
      ))
    }))
  }

  const updatePublicModel = (index, field, value) => {
    setDraft((current) => ({
      ...current,
      publicConceptModels: current.publicConceptModels.map((model, modelIndex) => (
        modelIndex === index ? { ...model, [field]: value } : model
      ))
    }))
  }

  const updatePublicImage = (index, field, value) => {
    setDraft((current) => ({
      ...current,
      publicImageGallery: getPublicImages(current).map((image, imageIndex) => (
        imageIndex === index ? { ...image, [field]: value } : image
      ))
    }))
  }

  const uploadPublicModel = (index, file) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.stl')) {
      setStatus('目前公開 3D 展示先支援 STL 檔案，請選擇 .stl。')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      updatePublicModel(index, 'modelUrl', reader.result)
      updatePublicModel(index, 'fileName', file.name)
      setStatus(`已載入公開展示模型：${file.name}。請按「儲存內容」發布。`)
    }
    reader.onerror = () => setStatus('模型檔案讀取失敗，請重新選擇。')
    reader.readAsDataURL(file)
  }

  const uploadPublicGalleryImage = (index, file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setStatus('靜態展示圖片請上傳圖片檔，例如 PNG、JPG、WEBP 或 SVG。')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      updatePublicImage(index, 'imageUrl', reader.result)
      updatePublicImage(index, 'imageAlt', file.name)
      setStatus(`已載入靜態展示圖片：${file.name}。請按「儲存內容」發布。`)
    }
    reader.onerror = () => setStatus('靜態展示圖片讀取失敗，請重新選擇。')
    reader.readAsDataURL(file)
  }

  const uploadLogo = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setStatus('Logo 請上傳圖片檔，例如 PNG、JPG、WEBP 或 SVG。')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setDraft((current) => ({ ...current, logoUrl: reader.result, logoAlt: file.name }))
      setStatus(`已載入 Logo：${file.name}。請按「儲存內容」發布。`)
    }
    reader.onerror = () => setStatus('Logo 圖片讀取失敗，請重新選擇。')
    reader.readAsDataURL(file)
  }

  const uploadLandingImage = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setStatus('首頁主視覺請上傳圖片檔，例如 PNG、JPG、WEBP 或 SVG。')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      updateLanding('heroImageUrl', reader.result)
      updateLanding('heroImageAlt', file.name)
      setStatus(`已載入首頁主視覺：${file.name}。請按「儲存內容」發布。`)
    }
    reader.onerror = () => setStatus('首頁主視覺圖片讀取失敗，請重新選擇。')
    reader.readAsDataURL(file)
  }

  const uploadCustomSectionImage = (index, file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setStatus('模塊圖片請上傳圖片檔，例如 PNG、JPG、WEBP 或 SVG。')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      updateCustomSection(index, 'imageUrl', reader.result)
      updateCustomSection(index, 'layout', 'image')
      setStatus(`已載入模塊圖片：${file.name}。請按「儲存內容」發布。`)
    }
    reader.onerror = () => setStatus('模塊圖片讀取失敗，請重新選擇。')
    reader.readAsDataURL(file)
  }

  const addCustomSection = () => {
    setDraft((current) => ({
      ...current,
      customSections: [
        ...getCustomSections(current),
        {
          id: `section-${Date.now()}`,
          kicker: 'New Module',
          title: '新的官網模塊',
          text: '請在這裡填入對外可公開的概念性說明。',
          imageUrl: '',
          layout: 'text'
        }
      ]
    }))
  }

  const addPublicImage = () => {
    setDraft((current) => ({
      ...current,
      publicImageGallery: [
        ...getPublicImages(current),
        {
          id: `gallery-${Date.now()}`,
          title: '新的靜態圖片展示',
          text: '請填入對外可公開的圖片說明，不要放入內部專案參數。',
          imageUrl: '',
          imageAlt: '公開靜態展示圖片'
        }
      ]
    }))
  }

  const removePublicImage = (index) => {
    setDraft((current) => ({
      ...current,
      publicImageGallery: getPublicImages(current).filter((_, imageIndex) => imageIndex !== index)
    }))
  }

  const removeCustomSection = (index) => {
    setDraft((current) => ({
      ...current,
      customSections: getCustomSections(current).filter((_, sectionIndex) => sectionIndex !== index)
    }))
  }

  const save = async (nextDraft = draft) => {
    try {
      setStatus('儲存中...')
      const serverContent = await savePublicSiteContentToServer(nextDraft)
      savePublicSiteContent(serverContent)
      window.localStorage.removeItem(PUBLIC_SITE_PENDING_KEY)
      setDraft(serverContent)
      setJsonText(JSON.stringify(serverContent, null, 2))
      setSavedSnapshot(JSON.stringify(serverContent))
      setStatus('已儲存公開官網內容，Safari 與其他瀏覽器重新整理後也會看到同一版。')
    } catch (error) {
      const statusCode = error?.response?.status
      const nextMessage = statusCode === 401 || statusCode === 403
        ? '資料庫儲存失敗：登入權限已過期或不是高權限帳號。請重新登入後再儲存。'
        : '資料庫儲存失敗，已先嘗試儲存在目前瀏覽器。請確認後端 API 有啟動。'
      setStatus(nextMessage)
      savePublicSiteContent(nextDraft)
      window.localStorage.setItem(PUBLIC_SITE_PENDING_KEY, '1')
      setDraft(nextDraft)
      setJsonText(JSON.stringify(nextDraft, null, 2))
      setSavedSnapshot(JSON.stringify(nextDraft))
    }
  }

  const reset = () => {
    if (!confirmLeave()) return
    resetPublicSiteContent()
    window.localStorage.removeItem(PUBLIC_SITE_PENDING_KEY)
    setDraft(defaultPublicSiteContent)
    setJsonText(JSON.stringify(defaultPublicSiteContent, null, 2))
    setSavedSnapshot(JSON.stringify(defaultPublicSiteContent))
    setStatus('已恢復預設內容。')
  }

  const saveJson = () => {
    try {
      const parsed = JSON.parse(jsonText)
      void save(parsed)
    } catch {
      setStatus('JSON 格式有誤，請確認括號、逗號與引號。')
    }
  }

  return (
    <main className="public-site-admin">
      <header className="public-site-admin__bar">
        <div>
          <p>Hidden CMS</p>
          <h1>公開官網內容後台</h1>
        </div>
        <nav>
          <Link to="/" onClick={guardNavigation}>查看官網</Link>
          <Link to="/join-us" onClick={guardNavigation}>查看加入我們</Link>
          <Link to="/projects" onClick={guardNavigation}>內部系統</Link>
          <button type="button" onClick={guardedLogout}>登出</button>
        </nav>
      </header>

      <section className="admin-notice">
        <strong>登入角色：{roleLabel}</strong>
        {isDirty && <strong className="dirty-indicator">尚未儲存變更</strong>}
        <span>
          這個後台只開放高權限帳號，且不會出現在公開網站導覽列。請只編輯對外可公開的概念性內容，不要放入材料參數、STL
          版本、BOM 成本、報告或稽核紀錄。
        </span>
      </section>

      <nav className="admin-tabs" aria-label="公開網站編輯分頁">
        <button type="button" aria-pressed={activeTab === 'home'} onClick={() => setActiveTab('home')}>官網首頁</button>
        <button type="button" aria-pressed={activeTab === 'join'} onClick={() => setActiveTab('join')}>加入我們</button>
        <button type="button" aria-pressed={activeTab === 'modules'} onClick={() => setActiveTab('modules')}>自訂模塊</button>
        <button type="button" aria-pressed={activeTab === 'advanced'} onClick={() => setActiveTab('advanced')}>進階 JSON</button>
      </nav>

      <section className="admin-grid">
        <div className="admin-tab-content">
          {activeTab === 'home' && (
            <>
              <EditorPanel title="01 共用品牌與首頁 Hero">
                <TextInput label="品牌名稱" value={draft.brand} onChange={(value) => setDraft((current) => ({ ...current, brand: value }))} />
                <TextInput label="官網分頁名稱" value={draft.siteTitle || ''} onChange={(value) => setDraft((current) => ({ ...current, siteTitle: value }))} />
                <TextInput label="Logo 圖片 URL" value={draft.logoUrl || ''} onChange={(value) => setDraft((current) => ({ ...current, logoUrl: value }))} />
                <TextInput label="Logo 替代文字" value={draft.logoAlt || ''} onChange={(value) => setDraft((current) => ({ ...current, logoAlt: value }))} />
                <label className="file-upload-field">
                  上傳公司 Logo
                  <span className="file-upload-control">
                    <input type="file" accept="image/*" onChange={(event) => uploadLogo(event.target.files?.[0])} />
                  </span>
                </label>
                {draft.logoUrl && (
                  <div className="admin-logo-preview">
                    <img src={draft.logoUrl} alt={draft.logoAlt || draft.brand} />
                    <button type="button" className="secondary" onClick={() => setDraft((current) => ({ ...current, logoUrl: '', logoAlt: '' }))}>
                      移除 Logo
                    </button>
                  </div>
                )}
                <TextInput label="Hero 標題" value={draft.landing.heroTitle} onChange={(value) => updateLanding('heroTitle', value)} />
                <TextArea label="Hero 副標題" value={draft.landing.heroSubtitle} onChange={(value) => updateLanding('heroSubtitle', value)} />
                <label className="file-upload-field">
                  上傳 Hero Section 照片檔案
                  <span className="file-upload-control">
                    <input type="file" accept="image/*" onChange={(event) => uploadLandingImage(event.target.files?.[0])} />
                  </span>
                  <span className="admin-helper">上傳後會取代官網首頁右側主視覺；記得按「儲存內容」才會發布到其他瀏覽器。</span>
                </label>
                <TextInput label="Hero 照片 URL" value={draft.landing.heroImageUrl} onChange={(value) => updateLanding('heroImageUrl', value)} />
                <TextInput label="Hero 照片替代文字" value={draft.landing.heroImageAlt} onChange={(value) => updateLanding('heroImageAlt', value)} />
                {draft.landing.heroImageUrl && (
                  <>
                    <img className="admin-image-preview" src={draft.landing.heroImageUrl} alt={draft.landing.heroImageAlt} />
                    <button type="button" className="secondary" onClick={() => {
                      updateLanding('heroImageUrl', '')
                      updateLanding('heroImageAlt', '')
                    }}>
                      移除首頁照片
                    </button>
                  </>
                )}
              </EditorPanel>

              <EditorPanel title="02 公司總覽">
                <TextInput label="公司總覽標題" value={draft.landing.overviewTitle} onChange={(value) => updateLanding('overviewTitle', value)} />
                <TextArea label="公司總覽文字" value={draft.landing.overviewText} onChange={(value) => updateLanding('overviewText', value)} />
              </EditorPanel>

              <EditorPanel title="03 核心技術">
                <TextInput label="核心技術標題" value={draft.landing.technologyTitle} onChange={(value) => updateLanding('technologyTitle', value)} />
                <TextArea label="核心技術說明" value={draft.landing.technologyIntro || ''} onChange={(value) => updateLanding('technologyIntro', value)} />
                <LineEditor
                  label="核心技術卡片"
                  help="每行格式：標題｜說明"
                  value={cardsToLines(draft.technologies)}
                  onChange={(value) => setDraft((current) => ({ ...current, technologies: linesToCards(value) }))}
                />
              </EditorPanel>

              <EditorPanel title="04 公開 3D 展示">
                <TextInput label="3D 區塊標題" value={draft.landing.public3dTitle} onChange={(value) => updateLanding('public3dTitle', value)} />
                <TextArea label="3D 區塊說明" value={draft.landing.public3dIntro} onChange={(value) => updateLanding('public3dIntro', value)} />
                <p className="admin-helper">
                  每一個模型卡片都可以維持預設概念幾何，也可以指定公開展示用 STL。這裡不要上傳內部專案的敏感版本檔。
                </p>
                <div className="module-list">
                  {draft.publicConceptModels.map((model, index) => (
                    <article className="module-editor" key={model.id || index}>
                      <div className="module-editor__header">
                        <strong>3D 展示 {index + 1}</strong>
                        {model.fileName && <span className="file-chip">{model.fileName}</span>}
                      </div>
                      <TextInput label="模型 ID" value={model.id} onChange={(value) => updatePublicModel(index, 'id', value)} />
                      <TextInput label="模型標題" value={model.title} onChange={(value) => updatePublicModel(index, 'title', value)} />
                      <TextArea label="模型說明" value={model.description} onChange={(value) => updatePublicModel(index, 'description', value)} />
                      <TextInput label="公開 STL 模型 URL" value={model.modelUrl || ''} onChange={(value) => updatePublicModel(index, 'modelUrl', value)} />
                      <label className="file-upload-field">
                        上傳 STL 展示模型
                        <span className="file-upload-control">
                          <input type="file" accept=".stl,model/stl,application/sla" onChange={(event) => uploadPublicModel(index, event.target.files?.[0])} />
                        </span>
                      </label>
                      {model.modelUrl && (
                        <button type="button" className="secondary" onClick={() => {
                          updatePublicModel(index, 'modelUrl', '')
                          updatePublicModel(index, 'fileName', '')
                        }}>
                          移除上傳模型，改用預設概念幾何
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              </EditorPanel>

              <EditorPanel title="05 靜態圖片展示">
                <TextInput label="靜態圖片展示標題" value={draft.landing.imageGalleryTitle || ''} onChange={(value) => updateLanding('imageGalleryTitle', value)} />
                <TextArea label="靜態圖片展示說明" value={draft.landing.imageGalleryIntro || ''} onChange={(value) => updateLanding('imageGalleryIntro', value)} />
                <p className="admin-helper">
                  這裡會顯示在官網 3D 展示下方。可用來放產品照片、應用情境圖或合作流程圖，但不要放內部專案參數、報告或敏感模型截圖。
                </p>
                <div className="module-list">
                  {getPublicImages(draft).map((image, index) => (
                    <article className="module-editor" key={image.id || index}>
                      <div className="module-editor__header">
                        <strong>圖片展示 {index + 1}</strong>
                        <button type="button" className="danger" onClick={() => removePublicImage(index)}>刪除</button>
                      </div>
                      <TextInput label="圖片 ID" value={image.id || ''} onChange={(value) => updatePublicImage(index, 'id', value)} />
                      <TextInput label="圖片標題" value={image.title || ''} onChange={(value) => updatePublicImage(index, 'title', value)} />
                      <TextArea label="圖片說明" value={image.text || ''} onChange={(value) => updatePublicImage(index, 'text', value)} />
                      <TextInput label="圖片 URL" value={image.imageUrl || ''} onChange={(value) => updatePublicImage(index, 'imageUrl', value)} />
                      <TextInput label="圖片替代文字" value={image.imageAlt || ''} onChange={(value) => updatePublicImage(index, 'imageAlt', value)} />
                      <label className="file-upload-field">
                        上傳靜態展示圖片
                        <span className="file-upload-control">
                          <input type="file" accept="image/*" onChange={(event) => uploadPublicGalleryImage(index, event.target.files?.[0])} />
                        </span>
                      </label>
                      {image.imageUrl && (
                        <>
                          <img className="admin-image-preview" src={image.imageUrl} alt={image.imageAlt || image.title} />
                          <button type="button" className="secondary" onClick={() => {
                            updatePublicImage(index, 'imageUrl', '')
                            updatePublicImage(index, 'imageAlt', '')
                          }}>
                            移除圖片
                          </button>
                        </>
                      )}
                    </article>
                  ))}
                </div>
                <button type="button" onClick={addPublicImage}>新增靜態圖片</button>
              </EditorPanel>

              <EditorPanel title="06 應用場景">
                <TextInput label="應用場景標題" value={draft.landing.applicationTitle} onChange={(value) => updateLanding('applicationTitle', value)} />
                <LineEditor
                  label="應用場景卡片"
                  help="每行格式：階段｜說明，例如 術前｜3D 模型展示..."
                  value={scenariosToLines(draft.scenarios)}
                  onChange={(value) => setDraft((current) => ({ ...current, scenarios: linesToScenarios(value) }))}
                />
              </EditorPanel>

              <EditorPanel title="07 取得更多權限 / 內部系統差異">
                <TextInput label="取得更多權限標題" value={draft.landing.accessTitle} onChange={(value) => updateLanding('accessTitle', value)} />
                <TextArea label="取得更多權限說明" value={draft.landing.accessIntro} onChange={(value) => updateLanding('accessIntro', value)} />
                <LineEditor
                  label="公開網站可看到"
                  help="每行一個項目"
                  value={listToLines(draft.publicItems)}
                  onChange={(value) => setDraft((current) => ({ ...current, publicItems: linesToList(value) }))}
                />
                <LineEditor
                  label="內部系統登入後可看到"
                  help="每行一個項目"
                  value={listToLines(draft.privateItems)}
                  onChange={(value) => setDraft((current) => ({ ...current, privateItems: linesToList(value) }))}
                />
              </EditorPanel>

              <EditorPanel title="08 內部系統能力預覽">
                <TextInput label="內部系統能力預覽標題" value={draft.landing.internalPreviewTitle} onChange={(value) => updateLanding('internalPreviewTitle', value)} />
                <TextArea label="內部系統能力預覽說明" value={draft.landing.internalPreviewIntro} onChange={(value) => updateLanding('internalPreviewIntro', value)} />
                <LineEditor
                  label="內部系統模組卡片"
                  help="每行格式：模組名稱｜說明"
                  value={cardsToLines(draft.internalModules)}
                  onChange={(value) => setDraft((current) => ({ ...current, internalModules: linesToCards(value) }))}
                />
              </EditorPanel>

              <EditorPanel title="09 合作流程">
                <TextInput label="合作流程標題" value={draft.landing.processTitle} onChange={(value) => updateLanding('processTitle', value)} />
                <LineEditor
                  label="合作流程步驟"
                  help="每行一個步驟，排序會照行數顯示"
                  value={listToLines(draft.processSteps)}
                  onChange={(value) => setDraft((current) => ({ ...current, processSteps: linesToList(value) }))}
                />
              </EditorPanel>

              <EditorPanel title="10 帳號申請與頁尾">
                <TextInput label="帳號申請標題" value={draft.landing.accountTitle} onChange={(value) => updateLanding('accountTitle', value)} />
                <TextArea label="帳號申請說明" value={draft.landing.accountIntro} onChange={(value) => updateLanding('accountIntro', value)} />
                <TextArea label="帳號申請成功訊息" value={draft.landing.accountSuccess} onChange={(value) => updateLanding('accountSuccess', value)} />
                <TextArea label="Footer 公司簡介" value={draft.landing.footerText} onChange={(value) => updateLanding('footerText', value)} />
                <TextArea label="Footer 免責說明" value={draft.landing.disclaimer} onChange={(value) => updateLanding('disclaimer', value)} />
              </EditorPanel>
            </>
          )}

          {activeTab === 'join' && (
            <>
              <EditorPanel title="01 Join Us Hero">
                <TextInput label="加入我們分頁名稱" value={draft.join.pageTitle || ''} onChange={(value) => updateJoin('pageTitle', value)} />
                <TextInput label="Join Us 標題" value={draft.join.heroTitle} onChange={(value) => updateJoin('heroTitle', value)} />
                <TextArea label="Join Us 副標題" value={draft.join.heroSubtitle} onChange={(value) => updateJoin('heroSubtitle', value)} />
              </EditorPanel>

              <EditorPanel title="02 Why Join Us">
                <TextInput label="Why Join Us 標題" value={draft.join.whyTitle} onChange={(value) => updateJoin('whyTitle', value)} />
                <LineEditor
                  label="Why Join Us 卡片"
                  help="每行一個原因"
                  value={listToLines(draft.join.reasons)}
                  onChange={(value) => setDraft((current) => ({ ...current, join: { ...current.join, reasons: linesToList(value) } }))}
                />
              </EditorPanel>

              <EditorPanel title="03 合作方向">
                <TextInput label="合作方向標題" value={draft.join.rolesTitle} onChange={(value) => updateJoin('rolesTitle', value)} />
                <LineEditor
                  label="合作方向"
                  help="每行格式：方向｜說明"
                  value={cardsToLines(draft.join.roles)}
                  onChange={(value) => setDraft((current) => ({ ...current, join: { ...current.join, roles: linesToCards(value) } }))}
                />
              </EditorPanel>

              <EditorPanel title="04 適合對象">
                <TextInput label="適合對象標題" value={draft.join.fitTitle} onChange={(value) => updateJoin('fitTitle', value)} />
                <LineEditor
                  label="適合對象條件"
                  help="每行一個條件"
                  value={listToLines(draft.join.fit)}
                  onChange={(value) => setDraft((current) => ({ ...current, join: { ...current.join, fit: linesToList(value) } }))}
                />
              </EditorPanel>

              <EditorPanel title="05 申請表單與頁尾">
                <TextInput label="申請表單標題" value={draft.join.applicationTitle} onChange={(value) => updateJoin('applicationTitle', value)} />
                <TextArea label="申請表單說明" value={draft.join.applicationIntro} onChange={(value) => updateJoin('applicationIntro', value)} />
                <TextArea label="申請成功訊息" value={draft.join.success} onChange={(value) => updateJoin('success', value)} />
                <TextArea label="Join Us Footer 文字" value={draft.join.footerText} onChange={(value) => updateJoin('footerText', value)} />
              </EditorPanel>
            </>
          )}

          {activeTab === 'modules' && (
            <EditorPanel title="官網自訂模塊">
              <p className="admin-helper">
                這裡會顯示在官網首頁的合作流程下方、帳號申請上方。可以新增、刪除公開官網上的額外內容模塊。
              </p>
              <div className="module-list">
                {getCustomSections(draft).map((section, index) => (
                  <article className="module-editor" key={section.id || index}>
                    <div className="module-editor__header">
                      <strong>模塊 {index + 1}</strong>
                      <button type="button" className="danger" onClick={() => removeCustomSection(index)}>刪除</button>
                    </div>
                    <TextInput label="模塊小標" value={section.kicker} onChange={(value) => updateCustomSection(index, 'kicker', value)} />
                    <TextInput label="模塊標題" value={section.title} onChange={(value) => updateCustomSection(index, 'title', value)} />
                    <TextArea label="模塊說明" value={section.text} onChange={(value) => updateCustomSection(index, 'text', value)} />
                    <TextInput label="模塊圖片 URL" value={section.imageUrl} onChange={(value) => updateCustomSection(index, 'imageUrl', value)} />
                    <label className="file-upload-field">
                      上傳模塊圖片
                      <span className="file-upload-control">
                        <input type="file" accept="image/*" onChange={(event) => uploadCustomSectionImage(index, event.target.files?.[0])} />
                      </span>
                    </label>
                    <label>
                      版型
                      <select value={section.layout || 'text'} onChange={(event) => updateCustomSection(index, 'layout', event.target.value)}>
                        <option value="text">純文字</option>
                        <option value="image">文字 + 圖片</option>
                      </select>
                    </label>
                    {section.imageUrl && (
                      <>
                        <img className="admin-image-preview" src={section.imageUrl} alt={section.title} />
                        <button type="button" className="secondary" onClick={() => updateCustomSection(index, 'imageUrl', '')}>
                          移除模塊圖片
                        </button>
                      </>
                    )}
                  </article>
                ))}
              </div>
              <button type="button" onClick={addCustomSection}>新增模塊</button>
            </EditorPanel>
          )}

          {activeTab === 'advanced' && (
            <EditorPanel title="進階 JSON 編輯">
              <p className="admin-helper">
                進階模式可一次編輯所有公開網站內容。這裡儲存的是前端內容設定；未來若接資料庫 API，可以沿用同一份 JSON 結構。
              </p>
              <textarea className="json-editor" value={jsonText} onChange={(event) => setJsonText(event.target.value)} rows="18" spellCheck="false" />
              <div className="admin-actions">
                <button type="button" onClick={saveJson}>套用 JSON</button>
                <button type="button" className="secondary" onClick={() => setJsonText(JSON.stringify(draft, null, 2))}>同步目前草稿</button>
              </div>
            </EditorPanel>
          )}
        </div>

        <aside className="admin-save-panel">
          <h2>發布控制</h2>
          <p>儲存後，公開首頁與加入我們頁會從後端資料庫讀取同一份內容，Safari、Chrome 和其他瀏覽器重新整理後都會同步。</p>
          <div className="admin-actions vertical">
            <button type="button" onClick={() => void save()}>儲存內容</button>
            <button type="button" className="secondary" onClick={reset}>恢復預設</button>
          </div>
          {status && <div className="admin-status">{status}</div>}
        </aside>
      </section>
    </main>
  )
}

function getCustomSections(content) {
  return Array.isArray(content.customSections) ? content.customSections : []
}

function getPublicImages(content) {
  return Array.isArray(content.publicImageGallery)
    ? content.publicImageGallery
    : defaultPublicSiteContent.publicImageGallery
}

function EditorPanel({ title, children }) {
  return (
    <section className="editor-panel">
      <h2>{title}</h2>
      <div className="editor-fields">{children}</div>
    </section>
  )
}

function TextInput({ label, value, onChange }) {
  return (
    <label>
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function TextArea({ label, value, onChange }) {
  return (
    <label>
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows="4" />
    </label>
  )
}

function LineEditor({ label, help, value, onChange }) {
  return (
    <label>
      {label}
      <span className="admin-helper">{help}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows="7" />
    </label>
  )
}

function linesToList(value) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean)
}

function listToLines(items) {
  return (items || []).join('\n')
}

function cardsToLines(items) {
  return (items || []).map((item) => `${item.title}｜${item.text}`).join('\n')
}

function linesToCards(value) {
  return linesToList(value).map((line) => {
    const [title, ...text] = line.split('｜')
    return { title: title.trim(), text: text.join('｜').trim() }
  }).filter((item) => item.title && item.text)
}

function scenariosToLines(items) {
  return items.map((item) => `${item.phase}｜${item.text}`).join('\n')
}

function linesToScenarios(value) {
  return linesToList(value).map((line) => {
    const [phase, ...text] = line.split('｜')
    return { phase: phase.trim(), text: text.join('｜').trim() }
  }).filter((item) => item.phase && item.text)
}
