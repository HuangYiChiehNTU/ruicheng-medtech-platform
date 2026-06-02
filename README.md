# 睿程生醫公開官網

這是一份和內部醫材版本控制雲端平台切開的公開官網專案。

官網負責：

- 對外首頁
- 圖片展示
- 3D 展示
- 產品目錄
- 簡化訂購入口
- 加入我們
- LINE Bot 入口
- AI 小睿官網問答
- 輕量 CMS

內部雲端平台負責：

- 專案管理
- STL 模型版本
- 材料詳細參數
- BOM 成本
- 報告文件
- 醫師回饋
- 稽核紀錄
- Traceability Graph

公開官網不應直接公開內部平台的敏感資料。

## 本機啟動

```bash
npm install
npm run dev
```

## Vercel 部署

建議直接把這個資料夾作為 Vercel 專案根目錄。

Build command:

```bash
npm run build
```

Output directory:

```bash
dist
```

## 環境變數

### `VITE_CMS_PASSCODE`

CMS 入口 `/cms` 的簡易密碼。

如果沒有設定，預設為：

```text
ruicheng-cms
```

正式上線建議改用 Vercel Protection、公司 SSO 或正式後端驗證。

### `VITE_INTERNAL_PLATFORM_URL`

內部雲端平台登入入口。

官網 `/login` 會引導使用者前往這個網址。

### `VITE_INTERNAL_PLATFORM_API_BASE`

朋友維護的內部雲端平台 API base URL。

若有設定，官網會嘗試讀：

```text
{VITE_INTERNAL_PLATFORM_API_BASE}/api/v1/public-site-content
{VITE_INTERNAL_PLATFORM_API_BASE}/api/v1/catalog/products
{VITE_INTERNAL_PLATFORM_API_BASE}/api/v1/catalog/requests
{VITE_INTERNAL_PLATFORM_API_BASE}/api/v1/join-us/applications
{VITE_INTERNAL_PLATFORM_API_BASE}/api/v1/public-ai/chat
```

若沒有設定或 API 尚未開放，官網會使用打包進專案的 CMS 內容與公開產品資料。

## 內建內容來源

這份專案已經內建你之前手動修改過的 CMS 匯出內容：

```text
src/content/exportedPublicSiteContent.json
```

也內建公開產品資料：

```text
src/content/exportedProducts.json
```

這樣 Vercel 部署時不依賴本機 localStorage 或 SQLite，也能先顯示你目前整理好的官網版本。

## 資料邊界

官網只能顯示「允許公開」的摘要資料，例如產品名稱、公開圖片、公開描述、類型、是否可訂購。

不要從官網直接讀取或顯示：

- STL 詳細版本
- 材料參數
- BOM 成本
- 報告
- 稽核紀錄
- Traceability Graph
- 內部專案檔案
