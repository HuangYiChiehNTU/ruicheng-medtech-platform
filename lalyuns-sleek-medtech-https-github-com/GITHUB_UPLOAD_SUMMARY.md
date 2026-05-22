# 睿程生醫股份有限公司 GitHub 上傳整理

本文件整理目前專案版本，方便上傳 GitHub 後讓團隊快速理解本次合併內容、系統入口、啟動方式與驗證狀態。

## 專案定位

本專案目前包含兩個主要使用情境：

1. 對外官方網站
   - 提供公司介紹、技術方向、應用場景、公開 3D 概念展示、產品型錄、加入我們與合作申請入口。
   - 官網只公開概念性資訊，不公開內部詳細醫療參數、模型版本、BOM 成本、報告與稽核紀錄。

2. 內部資料庫系統
   - 提供已審核帳號登入後使用。
   - 管理專案、STL 模型版本、材料參數、3D 檢視、醫師回饋、報告文件、BOM 成本、稽核紀錄與 Traceability Graph。

核心邏輯：

> 外部官網負責建立信任與提供總覽；內部資料庫系統負責呈現詳細參數、版本、材料、報告與稽核紀錄。

## 本次合併內容

本次已將原本的公開官網與隱藏 CMS 後台，和團隊新增的產品型錄 / 產品管理功能合併。

### 保留的原有功能

- 公開 Landing Page `/`
- 加入我們頁面 `/join-us`
- 內部登入 `/login`
- 內部專案系統 `/projects`
- 專案詳情 `/projects/:id`
- Traceability `/projects/:id/traceability`
- 材料管理 `/admin/materials`
- 使用者管理 `/admin/users`
- 稽核紀錄 `/admin/audit`
- 隱藏官網 CMS 後台 `/admin/public-site`
- 官網內容可由後台編輯
- 官網 Logo、網站名稱、Hero 圖片、官網圖片、3D 展示模型可由後台替換
- 後台未儲存變更時，離開頁面會提醒

### 新增的團隊功能

- 公開產品型錄 `/catalog`
- 產品管理後台 `/product-admin`
- 產品資料模型 `Product`
- 組件資料模型 `Component`
- 產品 BOM 資料模型 `ProductBOMItem`
- 外部產品申請資料模型 `ProductRequest`
- 專案可連結產品 `projects.product_id`
- BOM 回傳可帶出產品與模型版本上下文
- 產品型錄示範資料 seed

## 主要頁面與路由

### 公開頁面

| 路由 | 說明 |
| --- | --- |
| `/` | 對外官方網站首頁 |
| `/catalog` | 對外產品型錄 |
| `/join-us` | 加入我們 / 合作夥伴申請 |
| `/careers` | 重新導向到 `/join-us` |
| `/login` | 內部系統登入 |

### 內部系統

| 路由 | 權限 | 說明 |
| --- | --- | --- |
| `/projects` | 登入後 | 專案列表與專案建立 |
| `/projects/:id` | 登入後 | 專案詳細資料、版本、BOM、回饋、報告 |
| `/projects/:id/traceability` | 登入後 | 溯源圖 |
| `/admin/materials` | 登入後 | 材料管理 |
| `/admin/users` | 登入後 | 使用者管理 |
| `/admin/audit` | 登入後 | 稽核紀錄 |
| `/admin/public-site` | 高權限 | 官網內容 CMS |
| `/product-admin` | 高權限 | 產品、組件、產品 BOM 與外部申請管理 |

## 主要 API

### 公開 API

| Method | Endpoint | 說明 |
| --- | --- | --- |
| `GET` | `/api/v1/catalog/products` | 取得公開產品型錄 |
| `POST` | `/api/v1/catalog/requests` | 送出產品需求申請 |
| `GET` | `/api/v1/public-site-content` | 取得官網 CMS 內容 |

### 需登入 API

| Method | Endpoint | 說明 |
| --- | --- | --- |
| `GET` | `/api/v1/products` | 取得全部產品 |
| `POST` | `/api/v1/products` | 新增產品 |
| `PUT` | `/api/v1/products/:product_id` | 更新產品 |
| `DELETE` | `/api/v1/products/:product_id` | 軟刪除產品 |
| `GET` | `/api/v1/components` | 取得組件 |
| `POST` | `/api/v1/components` | 新增組件 |
| `POST` | `/api/v1/products/:product_id/bom` | 新增產品 BOM item |
| `DELETE` | `/api/v1/products/:product_id/bom/:item_id` | 刪除產品 BOM item |
| `GET` | `/api/v1/product-requests` | 取得外部產品申請 |
| `PUT` | `/api/v1/product-requests/:request_id` | 更新產品申請狀態 |

## 重要檔案

### Frontend

| 檔案 | 說明 |
| --- | --- |
| `frontend/src/App.jsx` | 路由設定 |
| `frontend/src/pages/LandingPage.jsx` | 公開官網首頁 |
| `frontend/src/pages/JoinUsPage.jsx` | 加入我們頁面 |
| `frontend/src/pages/PublicSiteAdminPage.jsx` | 官網 CMS 後台 |
| `frontend/src/pages/ProductCatalogPage.jsx` | 公開產品型錄 |
| `frontend/src/pages/ProductAdminPage.jsx` | 產品管理後台 |
| `frontend/src/pages/ProjectsPage.jsx` | 專案列表 |
| `frontend/src/pages/ProjectDetailPage.jsx` | 專案詳細頁 |
| `frontend/src/components/BOMPanel.jsx` | BOM 顯示元件 |
| `frontend/src/content/publicSiteContent.js` | 官網 CMS 預設內容與儲存邏輯 |

### Backend

| 檔案 | 說明 |
| --- | --- |
| `backend/app/main.py` | FastAPI 入口與 router 註冊 |
| `backend/app/models/product.py` | 產品、組件、產品 BOM、產品申請模型 |
| `backend/app/models/project.py` | 專案模型，已新增 `product_id` |
| `backend/app/routers/products.py` | 產品型錄與產品管理 API |
| `backend/app/routers/versions.py` | BOM 回傳產品與版本上下文 |
| `backend/app/schemas/product.py` | 產品相關 schema |
| `backend/app/schemas/cost.py` | BOM schema，已加入產品與版本 context |
| `backend/seed_product_catalog.py` | 匯入產品型錄示範資料 |

### Database Migration

| Migration | 說明 |
| --- | --- |
| `d2b9c47a9012_add_products_components_requests.py` | 新增產品、組件、產品 BOM、產品申請 |
| `e4f6a9201d4b_link_projects_to_products.py` | 專案連結產品 |
| `7d81f0c9b2aa_add_product_clinical_context.py` | 產品新增臨床應用欄位 |

## 本機啟動方式

### Backend

```bash
cd backend
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Backend health check:

```bash
curl http://127.0.0.1:8000/health
```

### Frontend

```bash
cd frontend
npm run dev -- --host 127.0.0.1
```

Frontend 預設入口：

```text
http://127.0.0.1:5173/
```

## 本機資料庫初始化

如果本機 SQLite 已經存在，但還沒有新的產品資料表，可先讓 SQLAlchemy 建立缺少的 tables：

```bash
cd backend
.venv/bin/python -c "from app.models import Base; from app.database import engine; Base.metadata.create_all(bind=engine); print('tables ready')"
```

如果舊資料庫的 `projects` table 還沒有 `product_id` 欄位，可補欄位：

```bash
cd backend
.venv/bin/python -c "from app.database import engine; from sqlalchemy import text; conn=engine.connect(); cols=[row[1] for row in conn.execute(text('PRAGMA table_info(projects)'))]; missing='product_id' not in cols; conn.close(); conn=engine.connect(); trans=conn.begin(); conn.execute(text('ALTER TABLE projects ADD COLUMN product_id INTEGER')) if missing else None; trans.commit(); conn.close(); print('product_id ready')"
```

匯入示範產品型錄：

```bash
cd backend
.venv/bin/python seed_product_catalog.py
```

## 驗證指令

### Backend compile

```bash
cd backend
.venv/bin/python -m compileall app seed_product_catalog.py
```

### Frontend build

```bash
cd frontend
npm run build
```

### ESLint

```bash
cd frontend
npm run lint
```

### API 測試

```bash
curl http://127.0.0.1:8000/api/v1/catalog/products
```

成功時會回傳公開產品型錄 JSON。

## 本次已完成驗證

- Backend Python compile 通過
- Frontend Vite build 通過
- ESLint 通過
- `/api/v1/catalog/products` 回傳 `200`
- `/catalog` 可正常載入
- 產品型錄目前有 3 筆 seed 資料

## 上傳 GitHub 前注意事項

請確認不要上傳以下本機或敏感檔案：

- `backend/.venv/`
- `frontend/node_modules/`
- `frontend/dist/`
- `.env`
- `backend/.env`
- `backend/sleek_dev.db`
- 任何真實帳號、密碼、JWT secret、API key

建議上傳：

- 原始碼
- `README.md`
- `GITHUB_UPLOAD_SUMMARY.md`
- `.env.example`
- Alembic migrations
- Seed scripts

## 建議 GitHub commit message

```text
Merge public website CMS with product catalog and product admin features
```

或中文：

```text
合併官網 CMS、產品型錄與產品管理功能
```
