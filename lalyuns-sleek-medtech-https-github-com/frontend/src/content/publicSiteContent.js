import { useEffect, useState } from 'react'
import api from '../api/client'

export const PUBLIC_SITE_CONTENT_KEY = 'sleek_public_site_content'
export const PUBLIC_SITE_PENDING_KEY = 'sleek_public_site_pending_publish'

export const defaultPublicSiteContent = {
  brand: '睿程生醫股份有限公司',
  siteTitle: '睿程生醫股份有限公司 | 骨科 3D 建模與客製化醫療器材',
  logoUrl: '',
  logoAlt: '睿程生醫股份有限公司 logo',
  landing: {
    heroKicker: 'Orthopedic MedTech Collaboration',
    heroTitle: '以 3D 建模與拓樸優化，推動骨科醫療器材的客製化設計',
    heroSubtitle: '我們協助醫師、醫院與製造合作方，將臨床需求轉化為可視化、可追蹤、可協作的醫療輔助器材開發流程',
    heroImageUrl: '',
    heroImageAlt: '骨科醫療科技產品展示',
    overviewKicker: 'Company Overview',
    overviewTitle: '把高溝通成本的醫療器材開發，整理成可協作的數位流程',
    overviewText:
      '骨科醫療器材設計常牽涉臨床需求、模型版本、材料選擇、製造限制與醫師回饋睿程生醫股份有限公司將這些資訊分層管理：公開官網負責建立信任與提供總覽；內部資料庫系統負責呈現詳細參數、版本、材料、報告與稽核紀錄',
    technologyTitle: '核心技術',
    technologyIntro: '',
    public3dTitle: '公開 3D 產品概念展示',
    public3dIntro:
      '這個展示只呈現骨科醫療輔助器材的概念模型，協助外部訪客理解技術方向；不公開 STL 模型版本、材料參數、BOM 成本或專案報告',
    imageGalleryTitle: '靜態產品與應用圖片展示',
    imageGalleryIntro:
      '以公開圖片呈現產品概念、應用情境與合作流程視覺，不包含內部專案參數、模型版本、BOM 成本或臨床報告',
    applicationTitle: '應用場景',
    applicationIntro: '這裡僅呈現概念性場景，不公開材料配方、模型版本、成本或專案報告',
    accessTitle: '取得更多權限，查看完整專案資料',
    accessIntro: '公開官網只提供公司、技術與合作流程總覽；若需要模型版本、材料參數、報告、BOM、稽核紀錄與溯源圖，請透過 LINE Bot 申請帳號並通過審核後進入內部系統查看',
    internalPreviewTitle: '內部系統能力預覽',
    internalPreviewIntro: '以下僅為模組總覽，不串接內部資料，也不公開任何專案細節',
    processTitle: '合作流程',
    accountTitle: '申請內部系統帳號',
    accountIntro: '此表單供醫師、醫院、投資人與合作廠商申請查看詳細專案資料送出後需經身分與需求審核',
    accountSuccess: '申請已送出，我們將審核您的身分與需求後提供內部系統帳號',
    footerText: '小型骨科醫療科技團隊，專注於 3D 建模、拓樸優化、客製化醫療輔助器材與數位協作流程',
    disclaimer: '本網站內容僅作技術與合作資訊展示，實際醫療器材使用、法規審查與臨床判斷仍需依正式流程辦理'
  },
  technologies: [
    {
      title: '3D Modeling',
      text: '協助醫師、病患與製造合作方理解模型結構，讓抽象臨床需求轉化為可討論的視覺化設計'
    },
    {
      title: 'Topology Optimization',
      text: '依據功能、材料與受力需求進行結構優化，支援更輕量、更貼近臨床情境的醫療輔助器材設計方向'
    },
    {
      title: 'Personalized Medical Devices',
      text: '支援客製化模型、手術輔助器材與骨釘開發方向，讓個案需求能被系統化整理與協作'
    },
    {
      title: 'Traceable Collaboration',
      text: '將版本、材料、回饋與報告串成可追蹤流程，讓醫師、醫院、廠商與投資人取得適合權限的資訊'
    }
  ],
  scenarios: [
    {
      phase: '術前',
      text: '3D 模型展示、醫病溝通與手術規劃，協助團隊在進入專案細節前先建立共同理解'
    },
    {
      phase: '術中',
      text: '手術輔助器材、固定器與拉線輔助設計，用概念設計支持臨床與製造端溝通'
    },
    {
      phase: '術後',
      text: '復健模型、病患理解與後續追蹤，讓專案資訊能延伸到復健與長期管理情境'
    }
  ],
  publicConceptModels: [
    {
      id: 'guide',
      title: '手術導引輔具概念',
      description: '以簡化幾何呈現導引面、定位孔與固定方向，僅作公開視覺展示',
      modelUrl: '',
      fileName: ''
    },
    {
      id: 'implant',
      title: '客製化骨釘與固定片概念',
      description: '呈現骨釘、固定片與受力方向的概念關係，不含尺寸、材料與實際規格',
      modelUrl: '',
      fileName: ''
    },
    {
      id: 'planning',
      title: '術前規劃模型概念',
      description: '展示醫師與廠商溝通用的模型分區概念，不連接內部專案資料',
      modelUrl: '',
      fileName: ''
    }
  ],
  publicImageGallery: [
    {
      id: 'modeling',
      title: '3D 建模溝通',
      text: '用概念圖片協助醫師、醫院與製造端快速理解模型方向',
      imageUrl: '',
      imageAlt: '3D 建模溝通概念圖片'
    },
    {
      id: 'guide-photo',
      title: '手術輔助器材概念',
      text: '展示導引、定位與固定方向的公開視覺，不含實際尺寸與材料參數',
      imageUrl: '',
      imageAlt: '手術輔助器材概念圖片'
    },
    {
      id: 'workflow',
      title: '數位協作流程',
      text: '呈現從需求確認、版本討論到權限審核的合作流程概念',
      imageUrl: '',
      imageAlt: '數位協作流程概念圖片'
    },
    {
      id: 'post-op-recovery',
      title: '術後恢復輔助',
      text: '以公開圖片說明術後恢復、復健溝通與追蹤模型的應用方向',
      imageUrl: '',
      imageAlt: '術後恢復輔助概念圖片'
    },
    {
      id: 'fixator-material',
      title: '固定器材料展示',
      text: '呈現固定器材料、骨釘周邊材料與材料包的公開展示方向',
      imageUrl: '',
      imageAlt: '固定器材料展示概念圖片'
    },
    {
      id: 'clinical-communication',
      title: '醫病溝通情境',
      text: '用非敏感的視覺素材協助外部訪客理解醫師、病患與製造端的協作情境',
      imageUrl: '',
      imageAlt: '醫病溝通情境概念圖片'
    }
  ],
  publicItems: ['公司介紹', '技術概念', '應用場景', '部分概念案例', '合作流程', 'LINE Bot 帳號申請入口'],
  privateItems: [
    'STL 模型版本',
    '材料詳細參數',
    '3D 模型檢視',
    '醫師回饋',
    '報告文件',
    'BOM 成本',
    '稽核紀錄',
    'Traceability Graph'
  ],
  internalModules: [
    { title: 'Projects', text: '管理合作專案、成員權限與開發狀態' },
    { title: '3D Review', text: '在內部系統檢視模型並支援回饋討論' },
    { title: 'Materials', text: '保存材料參數與專案使用紀錄' },
    { title: 'Feedback', text: '彙整醫師、醫院與廠商的審閱意見' },
    { title: 'Reports', text: '集中管理專案報告與文件版本' },
    { title: 'BOM', text: '支援成本估算與製造協作所需資料' },
    { title: 'Audit Log', text: '保存關鍵操作紀錄，支援管理與稽核' },
    { title: 'Traceability', text: '用溯源圖串接模型、材料、文件與回饋' }
  ],
  processSteps: [
    '初步洽詢',
    '需求確認',
    '帳號申請與權限設定',
    '上傳或查看專案資料',
    '醫師 / 廠商回饋',
    '模型版本確認與後續合作'
  ],
  customSections: [
    {
      id: 'quality',
      kicker: 'Quality Direction',
      title: '以可追蹤流程支援醫療器材開發溝通',
      text: '每個公開模塊只呈現合作方向、概念案例與流程價值；實際材料參數、模型版本、報告與稽核紀錄仍保留在登入後的內部系統',
      imageUrl: '',
      layout: 'text'
    }
  ],
  join: {
    pageTitle: '加入我們 | 睿程生醫股份有限公司',
    heroTitle: '加入我們，一起推動客製化骨科醫療科技',
    heroSubtitle:
      '我們結合 3D 建模、拓樸優化、材料參數與臨床需求，開發更精準、更可溝通的醫療輔助器材與數位協作流程',
    whyTitle: '在小型醫療科技新創中，直接參與產品與系統成形',
    rolesTitle: '目前歡迎以下方向的人才或合作夥伴',
    fitTitle: '適合一起合作的人',
    applicationTitle: '加入我們 / 合作申請',
    applicationIntro: '這個表單給人才、實習生與合作夥伴使用，和內部系統帳號申請不同',
    success: '申請已送出，我們將依照目前專案需求與您聯繫',
    footerText: '加入我們頁面僅作人才與合作申請使用，不提供內部專案參數、材料、模型版本或稽核資料',
    reasons: [
      '接觸真實骨科醫療應用',
      '參與 3D 建模與醫療器材設計',
      '接觸拓樸優化與客製化骨釘開發方向',
      '小團隊，能直接參與產品與系統建置'
    ],
    roles: [
      { title: '3D 建模 / 醫療模型設計助理', text: '協助模型整理、概念視覺化與醫療器材設計溝通' },
      { title: '前端 / 資料庫系統開發實習生', text: '參與內部資料庫、權限與專案協作流程的前端建置' },
      { title: '產品設計 / 工業設計合作夥伴', text: '協助輔助器材外型、使用流程與製造溝通設計' },
      { title: '業務開發 / 醫療合作助理', text: '協助醫院、廠商、投資人與跨領域合作需求整理' }
    ],
    fit: [
      '對醫療科技有興趣',
      '願意參與跨領域合作',
      '具備設計、工程、資訊系統、醫療管理或商業開發背景者佳',
      '能適應小型新創彈性工作模式'
    ]
  }
}

function mergeContent(base, saved) {
  if (!saved || typeof saved !== 'object') return base

  return Object.entries(saved).reduce((content, [key, value]) => {
    if (Array.isArray(value)) return { ...content, [key]: value }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return { ...content, [key]: mergeContent(content[key] || {}, value) }
    }
    return { ...content, [key]: value }
  }, base)
}

export function getPublicSiteContent() {
  if (typeof window === 'undefined') return defaultPublicSiteContent

  try {
    const saved = window.localStorage.getItem(PUBLIC_SITE_CONTENT_KEY)
    return saved ? mergeContent(defaultPublicSiteContent, JSON.parse(saved)) : defaultPublicSiteContent
  } catch {
    return defaultPublicSiteContent
  }
}

export async function fetchPublicSiteContent() {
  const response = await fetch('/api/v1/public-site-content')
  if (!response.ok) throw new Error('Unable to load public site content')
  const data = await response.json()
  return data.content && Object.keys(data.content).length > 0
    ? mergeContent(defaultPublicSiteContent, data.content)
    : defaultPublicSiteContent
}

export function savePublicSiteContent(content) {
  window.localStorage.setItem(PUBLIC_SITE_CONTENT_KEY, JSON.stringify(content))
  window.dispatchEvent(new Event('public-site-content-updated'))
}

export async function savePublicSiteContentToServer(content) {
  const { data } = await api.put('/public-site-content', { content })
  return mergeContent(defaultPublicSiteContent, data.content)
}

export function resetPublicSiteContent() {
  window.localStorage.removeItem(PUBLIC_SITE_CONTENT_KEY)
  window.localStorage.removeItem(PUBLIC_SITE_PENDING_KEY)
  window.dispatchEvent(new Event('public-site-content-updated'))
}

export function usePublicSiteContent() {
  const [content, setContent] = useState(() => getPublicSiteContent())

  useEffect(() => {
    const sync = () => setContent(getPublicSiteContent())
    window.addEventListener('storage', sync)
    window.addEventListener('public-site-content-updated', sync)
    fetchPublicSiteContent()
      .then((serverContent) => {
        setContent(serverContent)
        window.localStorage.setItem(PUBLIC_SITE_CONTENT_KEY, JSON.stringify(serverContent))
      })
      .catch(() => {})
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('public-site-content-updated', sync)
    }
  }, [])

  return content
}
