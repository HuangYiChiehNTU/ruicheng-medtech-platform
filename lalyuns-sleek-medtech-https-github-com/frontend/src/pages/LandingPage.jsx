import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Link } from 'react-router-dom'
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import * as THREE from 'three'
import { defaultPublicSiteContent, usePublicSiteContent } from '../content/publicSiteContent'
import '../styles/landing.css'

const MODEL_ZOOM_MIN = 0.6
const MODEL_ZOOM_MAX = 4
const MODEL_ZOOM_STEP = 0.05
const MODEL_ZOOM_DEFAULT = 1.35
const MODEL_CAMERA_POSITION = [2.85, 1.92, 3.72]
const MODEL_CAMERA_TARGET = [0, 0, 0]

export default function LandingPage() {
  const content = usePublicSiteContent()
  const landing = content.landing
  const imageItems = getShowcaseImages(content.publicImageGallery)
  const featuredStories = [
    {
      number: '01',
      label: '3D Modeling',
      title: '模型，一眼看懂',
      text: '用公開模型快速對齊醫師、醫院與製造端',
      points: ['模型溝通', '術前討論', '製造協作'],
      image: imageItems[0],
    },
    {
      number: '02',
      label: 'Surgical Support',
      title: '輔具，清楚討論',
      text: '導引、定位與固定概念公開說明，細節留在內部系統',
      points: ['導引輔具', '固定材料', '骨釘方向'],
      image: imageItems[1],
    },
    {
      number: '03',
      label: 'Recovery',
      title: '追蹤，持續溝通',
      text: '用簡潔圖片說明恢復輔助與追蹤場景',
      points: ['術後恢復', '病患理解', '追蹤溝通'],
      image: imageItems[3],
    },
  ]

  useScrollDrivenMotion()

  useEffect(() => {
    document.title = content.siteTitle || `${content.brand} | 骨科 3D 建模與客製化醫療器材`
  }, [content.brand, content.siteTitle])

  return (
    <main className="landing-page">
      <PublicNav brand={content.brand} logoUrl={content.logoUrl} logoAlt={content.logoAlt} />

      <section className="landing-hero nable-hero" data-scroll-scene data-nb-section="hero">
        <MedtechBubbleField />
        <div className="landing-hero__copy">
          <p className="landing-kicker">{landing.heroKicker}</p>
          <h1>睿程生醫</h1>
          <p>用 3D 模型、材料證據與可追溯流程，讓客製化醫療器材從需求到簽核都更清楚</p>
          <div className="landing-actions">
            <Link className="landing-button landing-button--primary" to="/showcase">探索展示</Link>
            <Link className="landing-button landing-button--ghost" to="/order">產品訂購</Link>
          </div>
        </div>
        <div className="landing-scroll-cue" aria-hidden="true">
          <span>向下捲動</span>
          <i />
        </div>
      </section>

      <section className="landing-statement" data-scroll-scene>
        <p>模型版本、材料、回饋、報告與 BOM，集中在同一條可追溯證據鏈</p>
      </section>

      <section className="landing-showcase-track" data-showcase-track data-scroll-scene>
        <div className="landing-showcase-panel">
          <div className="landing-showcase-counter" aria-hidden="true">01</div>
          {featuredStories.map((story, index) => (
            <article
              className={`landing-showcase-slide${index === 0 ? ' is-active' : ''}`}
              data-showcase-slide
              key={story.number}
            >
              <div className="landing-showcase-copy">
                <p className="landing-kicker">{story.label}</p>
                <h2>{story.title}</h2>
                <p>{story.text}</p>
                <ul>
                  {story.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
                <Link className="landing-button landing-button--white-ghost" to={index === 0 ? '/showcase' : '/catalog'}>
                  了解更多
                </Link>
              </div>
              <VisualSurface item={story.image} tone={index + 1} />
            </article>
          ))}
          <nav className="landing-showcase-dots" aria-label="展示段落">
            {featuredStories.map((story, index) => (
              <button
                className={index === 0 ? 'is-active' : ''}
                data-showcase-dot
                type="button"
                aria-label={`${story.label} ${story.title}`}
                key={story.number}
              />
            ))}
          </nav>
        </div>
      </section>

      <section className="product-story product-story--legacy">
        {featuredStories.map((story) => (
          <article className="product-story-card" data-scroll-scene key={story.number}>
            <VisualSurface item={story.image} tone={Number(story.number)} />
            <div className="product-story-card__copy">
              <span>{story.number}</span>
              <p className="landing-kicker">{story.label}</p>
              <h2>{story.title}</h2>
              <p>{story.text}</p>
              <div>
                {story.points.map((point) => <strong key={point}>{point}</strong>)}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="impact-strip" data-scroll-scene>
        {[
          ['3D', '模型協作'],
          ['BOM', '成本與材料'],
          ['Trace', '版本溯源'],
          ['Sign', '簽核留痕'],
        ].map(([value, label]) => (
          <article key={value}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>

      <section className="landing-final-cta" data-scroll-scene>
        <div>
          <p className="landing-kicker">Ready</p>
          <h2>公開展示建立信任，內部系統管理版本變更</h2>
        </div>
        <div>
          <Link className="landing-button landing-button--primary" to="/showcase">觀看展示</Link>
          <Link className="landing-button landing-button--ghost" to="/order">產品訂購</Link>
        </div>
      </section>

      <section className="landing-section landing-compare compact" id="access">
        <div className="landing-section__heading">
          <p className="landing-kicker">Access</p>
          <h2>公開看方向，內部看細節</h2>
        </div>
        <div className="compare-grid">
          {[
            ['公開網站', '公司、展示、產品與訂購入口'],
            ['內部系統', '模型版本、材料參數、BOM、報告與稽核紀錄'],
          ].map(([title, text]) => (
            <article className="access-column access-column--public" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <Footer content={content} />
    </main>
  )
}

function VisualSurface({ item, tone = 0 }) {
  return (
    <div className={`visual-surface visual-surface--${tone % 6}`}>
      {item?.imageUrl ? (
        <img src={item.imageUrl} alt={item.imageAlt || item.title} />
      ) : (
        <div className="visual-surface__fallback" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      )}
    </div>
  )
}

function MedtechBubbleField() {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0xffffff, 0)
    renderer.domElement.className = 'landing-bubble-canvas'
    renderer.domElement.setAttribute('aria-hidden', 'true')
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 80)
    camera.position.z = 15

    scene.add(new THREE.AmbientLight(0xffffff, 1.25))
    const cyan = new THREE.PointLight(0x70e8ff, 8, 36)
    cyan.position.set(-5, -2, 8)
    scene.add(cyan)
    const violet = new THREE.PointLight(0x8f7bff, 6, 34)
    violet.position.set(5, 5, 7)
    scene.add(violet)
    const warm = new THREE.PointLight(0xffe8c7, 3.4, 26)
    warm.position.set(1, 7, 10)
    scene.add(warm)

    const geometry = new THREE.SphereGeometry(1, 32, 32)
    const colors = [0x7dd3fc, 0x8b5cf6, 0x22d3ee, 0xd8b4fe, 0xfde68a, 0x93c5fd]
    const bubbles = Array.from({ length: window.innerWidth < 760 ? 26 : 58 }, (_, index) => {
      const radius = 0.055 + Math.random() * 0.28
      const material = new THREE.MeshPhysicalMaterial({
        color: colors[index % colors.length],
        transparent: true,
        opacity: 0.25 + Math.random() * 0.32,
        roughness: 0.05,
        metalness: 0,
        transmission: 0.35,
        thickness: 0.9,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
      })
      const bubble = new THREE.Mesh(geometry, material)
      bubble.scale.setScalar(radius)
      bubble.position.set((Math.random() - 0.5) * 18, -7 - Math.random() * 13, (Math.random() - 0.5) * 5)
      bubble.userData = {
        radius,
        speed: 0.18 + Math.random() * 0.62,
        wobble: 0.35 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        opacity: material.opacity,
      }
      scene.add(bubble)
      return bubble
    })

    let frame = 0
    let last = performance.now()
    let mx = 0
    let my = 0
    let targetX = 0
    let targetY = 0

    const resize = () => {
      const rect = host.getBoundingClientRect()
      const width = Math.max(1, rect.width || window.innerWidth)
      const height = Math.max(1, rect.height || window.innerHeight)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    const onPointerMove = (event) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 1.8
      targetY = (event.clientY / window.innerHeight - 0.5) * -1.1
    }

    const tick = (now) => {
      frame = window.requestAnimationFrame(tick)
      const delta = Math.min((now - last) / 1000, 0.05)
      last = now
      mx += (targetX - mx) * 0.045
      my += (targetY - my) * 0.045
      camera.position.x += (mx - camera.position.x) * 0.04
      camera.position.y += (my - camera.position.y) * 0.04
      camera.lookAt(0, 0, 0)

      bubbles.forEach((bubble, index) => {
        const data = bubble.userData
        bubble.position.y += data.speed * delta
        bubble.position.x += Math.sin(now * 0.0007 * data.wobble + data.phase) * delta * 0.42
        bubble.rotation.x += delta * 0.08
        bubble.rotation.y += delta * 0.12
        bubble.material.opacity = data.opacity * (0.82 + Math.sin(now * 0.001 + index) * 0.12)
        if (bubble.position.y > 8.4) {
          bubble.position.y = -8.6 - Math.random() * 4
          bubble.position.x = (Math.random() - 0.5) * 18
          bubble.position.z = (Math.random() - 0.5) * 5
        }
      })

      renderer.render(scene, camera)
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    if (!reduceMotion.matches) frame = window.requestAnimationFrame(tick)
    else renderer.render(scene, camera)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      bubbles.forEach((bubble) => {
        bubble.material.dispose()
        scene.remove(bubble)
      })
      geometry.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div className="landing-bubble-field" ref={hostRef} aria-hidden="true">
      {Array.from({ length: 22 }, (_, index) => (
        <span
          className="landing-css-bubble"
          key={index}
          style={{
            '--bubble-left': `${(index * 37) % 94 + 2}%`,
            '--bubble-top': `${(index * 29) % 86 + 4}%`,
            '--bubble-size': `${14 + ((index * 17) % 46)}px`,
            '--bubble-delay': `${(index % 8) * -0.7}s`,
          }}
        />
      ))}
    </div>
  )
}

function useScrollDrivenMotion() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduceMotion.matches) return undefined

    let frame = 0
    const clamp = (value) => Math.min(1, Math.max(0, value))
    const updateShowcase = () => {
      const tracks = document.querySelectorAll('[data-showcase-track]')
      tracks.forEach((track) => {
        const slides = Array.from(track.querySelectorAll('[data-showcase-slide]'))
        const dots = Array.from(track.querySelectorAll('[data-showcase-dot]'))
        const counter = track.querySelector('.landing-showcase-counter')
        if (!slides.length) return

        const rect = track.getBoundingClientRect()
        const scrollable = track.offsetHeight - window.innerHeight
        const raw = scrollable > 0 ? clamp(-rect.top / scrollable) : 0
        const activeIndex = Math.min(slides.length - 1, Math.floor(raw * slides.length))

        slides.forEach((slide, index) => {
          slide.classList.toggle('is-active', index === activeIndex)
          slide.classList.toggle('is-before', index < activeIndex)
        })
        dots.forEach((dot, index) => dot.classList.toggle('is-active', index === activeIndex))
        if (counter) counter.textContent = `0${activeIndex + 1}`
      })
    }

    const update = () => {
      frame = 0
      const viewportHeight = window.innerHeight || 1
      const scenes = document.querySelectorAll('[data-scroll-scene]')
      scenes.forEach((scene) => {
        const rect = scene.getBoundingClientRect()
        const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height))
        scene.style.setProperty('--scroll-progress', progress.toFixed(3))
        scene.toggleAttribute('data-scene-active', progress > 0.08 && progress < 0.92)
      })
      updateShowcase()
    }

    const requestUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    const dotClickCleanups = Array.from(document.querySelectorAll('[data-showcase-track]')).flatMap((track) => {
      const dots = Array.from(track.querySelectorAll('[data-showcase-dot]'))
      const onClicks = dots.map((dot, index) => {
        const onClick = () => {
          const scrollable = track.offsetHeight - window.innerHeight
          window.scrollTo({ top: track.offsetTop + (index / dots.length) * scrollable + 1, behavior: 'smooth' })
        }
        dot.addEventListener('click', onClick)
        return () => dot.removeEventListener('click', onClick)
      })
      return onClicks
    })
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      dotClickCleanups.forEach((cleanup) => cleanup())
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])
}

export function PublicShowcasePage() {
  const content = usePublicSiteContent()
  const landing = content.landing
  const imageItems = getShowcaseImages(content.publicImageGallery)

  useEffect(() => {
    document.title = `展示中心 | ${content.brand}`
  }, [content.brand])

  return (
    <main className="landing-page">
      <PublicNav brand={content.brand} logoUrl={content.logoUrl} logoAlt={content.logoAlt} />

      <section className="landing-section showcase-hero">
        <div className="landing-section__heading">
          <p className="landing-kicker">Showcase</p>
          <h1>3D 模型與靜態產品展示</h1>
          <p>這裡集中放公開可看的產品概念展示；詳細材料參數、模型版本、報告與稽核紀錄仍需登入內部系統</p>
        </div>
      </section>

      <section className="landing-section public-3d-section" id="public-3d">
        <div className="landing-section__heading">
          <p className="landing-kicker">Public 3D Concept Viewer</p>
          <h2>{landing.public3dTitle}</h2>
          <p>{landing.public3dIntro}</p>
        </div>
        <PublicProductViewer models={content.publicConceptModels} />
      </section>

      <section className="landing-section public-image-section" id="public-images">
        <div className="landing-section__heading">
          <p className="landing-kicker">Static Product Gallery</p>
          <h2>{landing.imageGalleryTitle || defaultPublicSiteContent.landing.imageGalleryTitle}</h2>
          <p>{landing.imageGalleryIntro || defaultPublicSiteContent.landing.imageGalleryIntro}</p>
        </div>
        <PublicImageGallery items={imageItems} />
      </section>

      <Footer content={content} />
    </main>
  )
}

function PublicNav({ brand, logoUrl, logoAlt }) {
  return (
    <header className="public-nav">
      <Link className="public-brand" to="/">
        {logoUrl ? <img src={logoUrl} alt={logoAlt || brand} /> : <span />}
        {brand}
      </Link>
      <nav>
        <Link to="/">首頁</Link>
        <Link to="/showcase">展示</Link>
        <Link to="/catalog">產品</Link>
        <Link to="/order">訂購</Link>
        <Link to="/join-us">加入我們</Link>
        <Link to="/login">登入</Link>
      </nav>
    </header>
  )
}

function PublicImageGallery({ items }) {
  if (!items.length) return null

  return (
    <div className="public-image-grid">
      {items.map((item) => (
        <article className="public-image-card" key={item.id || item.title}>
          <div className="public-image-card__media">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.imageAlt || item.title} />
            ) : (
              <div className="public-image-placeholder" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>
          <div className="public-image-card__copy">
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        </article>
      ))}
    </div>
  )
}

function PublicProductViewer({ models }) {
  const [activeModelId, setActiveModelId] = useState(models[0]?.id)
  const activeModel = models.find((model) => model.id === activeModelId) || models[0]
  const [autoRotate, setAutoRotate] = useState(true)
  const [modelZoom, setModelZoom] = useState(MODEL_ZOOM_DEFAULT)
  const [resetViewToken, setResetViewToken] = useState(0)

  const stopAutoRotate = useCallback(() => {
    setAutoRotate(false)
  }, [])

  const updateModelZoom = (nextZoom) => {
    setModelZoom(Math.min(MODEL_ZOOM_MAX, Math.max(MODEL_ZOOM_MIN, nextZoom)))
    stopAutoRotate()
  }

  const resetModelView = () => {
    setModelZoom(MODEL_ZOOM_DEFAULT)
    setAutoRotate(true)
    setResetViewToken((token) => token + 1)
  }

  if (!activeModel) return null

  return (
    <div className="public-3d-layout">
      <div
        className="public-3d-stage"
        aria-label="公開互動式 3D 產品概念展示"
        onPointerDown={stopAutoRotate}
        onWheel={stopAutoRotate}
        onTouchStart={stopAutoRotate}
      >
        <Canvas camera={{ position: MODEL_CAMERA_POSITION, fov: 34 }} dpr={[1, 2]} gl={{ antialias: true }}>
          <color attach="background" args={['#eef5fb']} />
          <ambientLight intensity={0.62} />
          <directionalLight position={[4, 6, 5]} intensity={1.6} />
          <directionalLight position={[-4, 2, -3]} intensity={0.55} />
          <Suspense fallback={null}>
            {activeModel.modelUrl ? (
              <PublicSTLModel key={activeModel.id} url={activeModel.modelUrl} autoRotate={autoRotate} modelZoom={modelZoom} />
            ) : (
              <ConceptModel key={activeModel.id} type={activeModel.id} autoRotate={autoRotate} modelZoom={modelZoom} />
            )}
          </Suspense>
          <PublicOrbitControls onUserInteract={stopAutoRotate} resetViewToken={resetViewToken} />
        </Canvas>
      </div>
      <aside className="public-3d-panel">
        <div>
          <p className="landing-kicker">Concept Only</p>
          <h3>{activeModel.title}</h3>
          <p>{activeModel.description}</p>
        </div>
        <div className="public-3d-buttons">
          {models.map((model) => (
            <button
              key={model.id}
              type="button"
              aria-pressed={activeModel.id === model.id}
              onClick={() => {
                setActiveModelId(model.id)
                setAutoRotate(true)
                setModelZoom(MODEL_ZOOM_DEFAULT)
                setResetViewToken((token) => token + 1)
              }}
            >
              {model.title}
            </button>
          ))}
        </div>
        <div className="public-3d-zoom">
          <div className="public-3d-zoom__heading">
            <strong>模型縮放</strong>
            <span>{Math.round(modelZoom * 100)}%</span>
          </div>
          <div className="public-3d-zoom__controls">
            <button
              type="button"
              aria-label="縮小模型"
              onClick={() => updateModelZoom(modelZoom - 0.15)}
              disabled={modelZoom <= MODEL_ZOOM_MIN}
            >
              -
            </button>
            <input
              type="range"
              min={MODEL_ZOOM_MIN}
              max={MODEL_ZOOM_MAX}
              step={MODEL_ZOOM_STEP}
              value={modelZoom}
              aria-label="調整模型縮放大小"
              onChange={(event) => updateModelZoom(Number(event.target.value))}
            />
            <button
              type="button"
              aria-label="放大模型"
              onClick={() => updateModelZoom(modelZoom + 0.15)}
              disabled={modelZoom >= MODEL_ZOOM_MAX}
            >
              +
            </button>
          </div>
          <button type="button" className="public-3d-zoom__reset" onClick={resetModelView}>
            重設視角與大小
          </button>
          <p>可拖曳旋轉、滾輪縮放，也可以用滑桿控制公開模型大小</p>
        </div>
        <div className="public-3d-note">
          <strong>公開展示範圍</strong>
          <span>
            {activeModel.modelUrl
              ? `目前顯示公開上傳模型${activeModel.fileName ? `：${activeModel.fileName}` : ''}詳細材料與版本資料仍需登入內部系統`
              : '可旋轉、縮放與切換概念模型詳細幾何、材料與版本資料需登入內部系統'}
          </span>
        </div>
      </aside>
    </div>
  )
}

function PublicSTLModel({ url, autoRotate, modelZoom }) {
  const groupRef = useRef(null)
  const loadedGeometry = useLoader(STLLoader, url)
  const geometry = useMemo(() => {
    const nextGeometry = loadedGeometry.clone()
    nextGeometry.center()
    nextGeometry.computeBoundingBox()
    return nextGeometry
  }, [loadedGeometry])

  const scale = useMemo(() => {
    const box = geometry.boundingBox
    if (!box) return 1
    const size = new THREE.Vector3()
    box.getSize(size)
    return 2.9 / Math.max(size.x, size.y, size.z, 1)
  }, [geometry])

  useEffect(() => {
    return () => geometry.dispose()
  }, [geometry])

  useFrame((_, delta) => {
    if (!autoRotate || !groupRef.current) return
    groupRef.current.rotation.y += delta * 0.16
  })

  return (
    <group ref={groupRef} scale={modelZoom}>
      <mesh geometry={geometry} scale={scale} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#60a5fa" roughness={0.36} metalness={0.08} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function PublicOrbitControls({ onUserInteract, resetViewToken }) {
  const { camera, gl } = useThree()
  const controls = useMemo(() => {
    const instance = new ThreeOrbitControls(camera, gl.domElement)
    instance.enableDamping = true
    instance.enablePan = false
    instance.minDistance = 1.25
    instance.maxDistance = 8.5
    instance.target.set(...MODEL_CAMERA_TARGET)
    return instance
  }, [camera, gl.domElement])

  useFrame(() => controls.update(), -1)

  useEffect(() => {
    camera.position.set(...MODEL_CAMERA_POSITION)
    controls.target.set(...MODEL_CAMERA_TARGET)
    controls.update()
  }, [camera, controls, resetViewToken])

  useEffect(() => {
    controls.addEventListener('start', onUserInteract)
    return () => controls.removeEventListener('start', onUserInteract)
  }, [controls, onUserInteract])

  useEffect(() => {
    return () => controls.dispose()
  }, [controls])

  return null
}

function ConceptModel({ type, autoRotate, modelZoom }) {
  const groupRef = useRef(null)

  useFrame((_, delta) => {
    if (!autoRotate || !groupRef.current) return
    groupRef.current.rotation.y += delta * 0.16
  })

  return (
    <group ref={groupRef} rotation={[0.18, -0.45, 0]} position={[0, 0, 0]} scale={modelZoom}>
      {type === 'implant' ? <ImplantConcept /> : type === 'planning' ? <PlanningConcept /> : <GuideConcept />}
    </group>
  )
}

function GuideConcept() {
  return (
    <group>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[2.7, 0.32, 1.45]} />
        <meshStandardMaterial color="#d8e4ef" roughness={0.46} metalness={0.08} />
      </mesh>
      <mesh position={[-0.62, 0.42, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 1.65, 42]} />
        <meshStandardMaterial color="#2563eb" roughness={0.34} metalness={0.18} />
      </mesh>
      <mesh position={[0.48, 0.48, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 1.52, 42]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.3} metalness={0.08} />
      </mesh>
      <mesh position={[0.88, -0.08, 0.86]} rotation={[0.25, 0.15, 0]}>
        <boxGeometry args={[0.84, 0.48, 0.18]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh position={[-1.1, -0.02, -0.76]} rotation={[0, 0.25, 0]}>
        <torusGeometry args={[0.36, 0.045, 18, 72]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.25} />
      </mesh>
    </group>
  )
}

function ImplantConcept() {
  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[0, 0, -0.22]}>
        <boxGeometry args={[2.65, 0.24, 0.72]} />
        <meshStandardMaterial color="#b7c5d5" roughness={0.42} metalness={0.18} />
      </mesh>
      {[-0.9, 0, 0.9].map((x) => (
        <mesh key={x} position={[x, 0.04, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.82, 36]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.28} metalness={0.24} />
        </mesh>
      ))}
      <mesh position={[1.24, -0.28, 0.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.16, 1.22, 36]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.22} metalness={0.12} />
      </mesh>
      <mesh position={[-1.25, 0.28, 0.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.16, 1.12, 36]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.22} metalness={0.12} />
      </mesh>
    </group>
  )
}

function PlanningConcept() {
  return (
    <group>
      <mesh position={[-0.72, 0.08, 0]}>
        <sphereGeometry args={[0.74, 48, 24]} />
        <meshStandardMaterial color="#dce8f4" roughness={0.52} metalness={0.04} />
      </mesh>
      <mesh position={[0.35, 0.02, 0]} scale={[1.25, 0.68, 0.86]}>
        <sphereGeometry args={[0.72, 48, 24]} />
        <meshStandardMaterial color="#c4d4e4" roughness={0.5} metalness={0.04} />
      </mesh>
      <mesh position={[0.95, 0.44, 0]} rotation={[0, 0, 0.32]}>
        <boxGeometry args={[1.2, 0.08, 0.08]} />
        <meshStandardMaterial color="#2563eb" roughness={0.26} />
      </mesh>
      <mesh position={[0.95, -0.34, 0.04]} rotation={[0, 0, -0.28]}>
        <boxGeometry args={[1.12, 0.08, 0.08]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.26} />
      </mesh>
      <mesh position={[-0.15, 0.74, 0]}>
        <torusGeometry args={[0.42, 0.035, 16, 72]} />
        <meshStandardMaterial color="#0f172a" roughness={0.36} metalness={0.08} />
      </mesh>
    </group>
  )
}

function Footer({ content }) {
  return (
    <footer className="landing-footer">
      <div>
        <h2>{content.brand}</h2>
        <p>{content.landing.footerText}</p>
      </div>
      <nav>
        <Link to="/">首頁</Link>
        <Link to="/showcase">展示中心</Link>
        <Link to="/catalog">產品目錄</Link>
        <Link to="/order">產品訂購</Link>
        <Link to="/join-us">加入我們</Link>
        <Link to="/login">內部系統登入</Link>
      </nav>
      <p className="disclaimer">
        {content.landing.disclaimer}
      </p>
    </footer>
  )
}

function getShowcaseImages(savedImages) {
  const defaults = defaultPublicSiteContent.publicImageGallery
  if (!Array.isArray(savedImages) || savedImages.length === 0) return defaults

  const savedIds = new Set(savedImages.map((item) => item.id || item.title))
  const missingDefaults = defaults.filter((item) => !savedIds.has(item.id || item.title))
  return [...savedImages, ...missingDefaults]
}
