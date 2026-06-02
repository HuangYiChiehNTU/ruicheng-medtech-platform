import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { getPublicFontStack, getPublicHeadingWeight, getPublicPageBackgroundStyle, usePublicSiteContent } from '../content/publicSiteContent'
import exportedProducts from '../content/exportedProducts.json'

const PRODUCT_TYPE_LABELS = {
  '3d_product': '3D 產品',
  image_product: '圖片產品',
  material: '材料本身',
  recovery: '術後恢復',
  fixator: '固定器材料',
}

export default function ProductCatalogPage() {
  const content = usePublicSiteContent()
  const { catalog = {} } = content
  const publicFontFamily = getPublicFontStack(content.fontFamily)
  const publicHeadingWeight = getPublicHeadingWeight(content.headingWeight)
  const [products, setProducts] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [filters, setFilters] = useState({ q: '', body_region: '', clinical_use: '', indication: '' })
  const [form, setForm] = useState({ requester_name: '', organization: '', email: '', phone: '', quantity: 1, message: '' })
  const [submitted, setSubmitted] = useState(false)

  const loadProducts = useCallback(async () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) params.set(key, value.trim())
    })
    const query = params.toString()
    let nextProducts = []
    try {
      const response = await api.get(`/catalog/products${query ? `?${query}` : ''}`)
      nextProducts = response.data
    } catch {
      const q = String(filters.q || '').trim().toLowerCase()
      nextProducts = exportedProducts.filter((product) => {
        const text = [
          product.name,
          product.sku,
          product.description,
          product.body_region,
          product.clinical_use,
          product.indication,
          product.product_type
        ].join(' ').toLowerCase()
        return (!q || text.includes(q))
          && (!filters.body_region || String(product.body_region || '').includes(filters.body_region))
          && (!filters.clinical_use || String(product.clinical_use || '').includes(filters.clinical_use))
          && (!filters.indication || String(product.indication || '').includes(filters.indication))
      })
    }
    setProducts(nextProducts)
    setSelectedId((current) => {
      if (nextProducts.some((product) => String(product.product_id) === String(current))) return current
      return nextProducts[0] ? String(nextProducts[0].product_id) : ''
    })
  }, [filters])

  useEffect(() => {
    Promise.resolve().then(() => loadProducts())
  }, [loadProducts])

  const selectedProduct = useMemo(
    () => products.find((product) => String(product.product_id) === String(selectedId)),
    [products, selectedId],
  )

  const submitRequest = async (event) => {
    event.preventDefault()
    const payload = {
      ...form,
      product_id: selectedId ? Number(selectedId) : null,
      quantity: Number(form.quantity || 1),
      request_source: 'web',
      request_type: 'inquiry',
    }
    try {
      await api.post('/catalog/requests', payload)
    } catch {
      const saved = JSON.parse(window.localStorage.getItem('ruicheng_public_catalog_requests') || '[]')
      window.localStorage.setItem('ruicheng_public_catalog_requests', JSON.stringify([...saved, { ...payload, created_at: new Date().toISOString() }]))
    }
    setSubmitted(true)
    setForm({ requester_name: '', organization: '', email: '', phone: '', quantity: 1, message: '' })
  }

  const setCatalogFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value || '' }))
  }

  const clearFilters = () => {
    setFilters({ q: '', body_region: '', clinical_use: '', indication: '' })
  }

  const hasActiveFilter = Object.values(filters).some((value) => value.trim())

  return (
    <div
      className="ops-page public-catalog-page"
      style={{
        fontFamily: publicFontFamily,
        '--public-heading-weight': publicHeadingWeight,
        ...getPublicPageBackgroundStyle(content, 'catalog')
      }}
    >
      <header className="ops-topbar">
        <div className="ops-brand">
          <span className="ops-brand-mark">睿</span>
          <span>睿程生醫 產品型錄</span>
        </div>
        <nav className="ops-nav">
          <Link to="/">首頁</Link>
          <Link to="/order">直接訂購</Link>
          <Link to="/login">內部登入</Link>
        </nav>
      </header>

      <main className="ops-main catalog-layout">
        <section className="ops-title-row">
          <h1>{catalog.pageTitle}</h1>
          <p>{catalog.intro}</p>
          <Link className="catalog-order-entry" to="/order">{catalog.orderEntryLabel}</Link>
        </section>

        <section className="ops-panel catalog-filter-panel">
          <div>
            <strong>{catalog.searchTitle}</strong>
            <span>{catalog.searchHint}</span>
          </div>
          <input value={filters.q} onChange={(event) => setCatalogFilter('q', event.target.value)} placeholder={catalog.searchPlaceholder} />
          <div className="catalog-filter-row">
            {filters.body_region && <button type="button" className="catalog-filter-chip active" onClick={() => setCatalogFilter('body_region', '')}>部位：{filters.body_region}</button>}
            {filters.clinical_use && <button type="button" className="catalog-filter-chip active" onClick={() => setCatalogFilter('clinical_use', '')}>用途：{filters.clinical_use}</button>}
            {filters.indication && <button type="button" className="catalog-filter-chip active" onClick={() => setCatalogFilter('indication', '')}>情境：{filters.indication}</button>}
            {hasActiveFilter && <button type="button" className="catalog-filter-chip" onClick={clearFilters}>清除篩選</button>}
          </div>
        </section>

        <section className="catalog-grid">
          <div className="ops-table-panel">
            <div className="ops-section-heading">
              <h2>{catalog.resultsTitle}</h2>
              <span>{products.length} 件結果</span>
            </div>
            <div className="catalog-products">
              {products.length === 0 && <div className="ops-empty">{catalog.emptyText}</div>}
              {products.map((product) => (
                <button
                  key={product.product_id}
                  className={String(product.product_id) === String(selectedId) ? 'catalog-product active' : 'catalog-product'}
                  onClick={() => setSelectedId(String(product.product_id))}
                >
                  <strong>{product.name}</strong>
                  <span>{PRODUCT_TYPE_LABELS[product.product_type] || '3D 產品'} · {product.sku}</span>
                  {product.body_region && <span>{product.body_region}</span>}
                  <p>{product.senior_note || product.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="ops-table-panel">
            <div className="ops-section-heading">
              <h2>{selectedProduct?.name || catalog.selectedFallbackTitle}</h2>
              <span>公開展示資料</span>
            </div>
            {selectedProduct && (
              <div className="ops-context-grid">
                <div><span>產品類型</span><strong>{PRODUCT_TYPE_LABELS[selectedProduct.product_type] || '3D 產品'}</strong></div>
                <div><span>使用部位</span><strong>{selectedProduct.body_region || '未設定'}</strong>{selectedProduct.body_region && <button type="button" className="catalog-filter-chip" onClick={() => setCatalogFilter('body_region', selectedProduct.body_region)}>查相同部位</button>}</div>
                <div><span>臨床用途</span><strong>{selectedProduct.clinical_use || '未設定'}</strong>{selectedProduct.clinical_use && <button type="button" className="catalog-filter-chip" onClick={() => setCatalogFilter('clinical_use', selectedProduct.clinical_use)}>查相似用途</button>}</div>
                <div><span>使用階段</span><strong>{selectedProduct.surgical_stage || '未設定'}</strong></div>
                <div><span>適應症</span><strong>{selectedProduct.indication || '未設定'}</strong>{selectedProduct.indication && <button type="button" className="catalog-filter-chip" onClick={() => setCatalogFilter('indication', selectedProduct.indication)}>查相似情境</button>}</div>
              </div>
            )}
            {selectedProduct && (
              <div className="catalog-selected-summary">
                {selectedProduct.image_url && <ProductMedia url={selectedProduct.image_url} name={selectedProduct.name} />}
                <p>{selectedProduct.description}</p>
                <Link to="/order">{catalog.orderProductLabel}</Link>
              </div>
            )}
            <div className="catalog-public-boundary">
              <strong>公開網站僅提供總覽資訊</strong>
              <p>
                BOM、材料成本、製造參數、模型版本、報告與稽核紀錄屬於內部醫材版本控制系統，
                需登入並取得權限後才可查看。
              </p>
            </div>
          </div>
        </section>

        <section className="ops-panel">
          <div className="ops-section-heading inline-heading">
            <h2>{catalog.requestTitle}</h2>
            <span>{catalog.requestHint}</span>
          </div>
          {submitted && <div className="catalog-success">{catalog.successMessage}</div>}
          <form className="catalog-request-form" onSubmit={submitRequest}>
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              {products.map((product) => <option key={product.product_id} value={product.product_id}>{product.name}</option>)}
            </select>
            <input required value={form.requester_name} onChange={(event) => setForm((value) => ({ ...value, requester_name: event.target.value }))} placeholder="申請人姓名" />
            <input value={form.organization} onChange={(event) => setForm((value) => ({ ...value, organization: event.target.value }))} placeholder="單位/公司" />
            <input type="email" value={form.email} onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))} placeholder="Email（可不填）" />
            <input value={form.phone} onChange={(event) => setForm((value) => ({ ...value, phone: event.target.value }))} placeholder="電話" />
            <input min="1" type="number" value={form.quantity} onChange={(event) => setForm((value) => ({ ...value, quantity: event.target.value }))} placeholder="數量" />
            <textarea value={form.message} onChange={(event) => setForm((value) => ({ ...value, message: event.target.value }))} placeholder="規格、交期或補充說明" />
            <button className="ops-primary" type="submit">{catalog.submitLabel}</button>
          </form>
        </section>
      </main>
    </div>
  )
}

function ProductMedia({ url, name }) {
  const isVideo = url.startsWith('data:video') || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)
  return isVideo ? (
    <video src={url} title={name} autoPlay muted loop playsInline controls />
  ) : (
    <img src={url} alt={name} />
  )
}
