# AI NEWS CENTER 開發交接

更新日期：2026-07-04

## 專案狀態

AI NEWS CENTER 是純靜態 AI 與科技財經新聞網站。前端直接讀 `data/news.json` 與 `data/topics.json`，文章靜態頁由 `scripts/build-static.js` 產生。

目前沒有後端、沒有資料庫、沒有真實 newsletter 服務。Newsletter 表單目前只做前端提示。

2026-07-04 補充：

- `newsletter.html` 已補上，導覽不再攔截到暫停提示。
- `scripts/build-static.js` 會產生 `llms.txt` 與 `llms-full.txt`。
- `scripts/apply-site-metadata.js` 會替頂層頁注入 canonical、OG/Twitter、JSON-LD 與可選 GA/GTM snippet。
- `scripts/validate-site.js` 會檢查 HTML metadata 與本地連結。
- 這是全新產品；不要沿用 ALTOS LAB 官方站既有 AWS runtime、GA property 或 GTM container。
- 正式靜態環境已部署到全新的 AWS S3 + CloudFront：
  `https://d2iwyj37fdufgt.cloudfront.net/`。
- GA4 / GTM 已使用 `altoslab.offical@gmail.com` 建立全新 CYBERNEWS 資源：
  GA4 `G-SX01NLQZ7F`、GTM `GTM-WD45TXLT`。

## 本地啟動

```bash
npm run validate
npm run build:static
npm run validate:site
python3 -m http.server 5173 --bind 127.0.0.1
```

開啟：

```text
http://127.0.0.1:5173/
```

## 主要檔案

- `index.html`：首頁。
- `latest.html`：全站最新內容列表。
- `ai.html`、`finance.html`：主頻道頁。
- `stocks.html`、`crypto.html`：金融子分類頁。
- `topics.html`、`topic-*.html`：專題入口與專題頁。
- `archive.html`：搜尋與篩選入口。
- `newsletter.html`：訂閱頁。
- `script.js`：資料載入、列表渲染、篩選、語言切換、前端互動。
- `styles.css`：主要樣式。
- `design-tokens.css`：品牌色、字級、間距等設計 token。
- `data/news.json`：所有文章資料。
- `data/topics.json`：專題匹配規則。
- `data/site.json`：站名、base URL、RSS 描述、GA4 / GTM IDs。
- `scripts/validate-news.js`：文章資料驗證。
- `scripts/build-static.js`：產生 `articles/`、`research/`、`sitemap.xml`、`robots.txt`、`rss.xml`、`llms.txt`、`llms-full.txt`。
- `scripts/apply-site-metadata.js`：頂層頁 SEO/GEO/analytics metadata 注入。
- `scripts/validate-site.js`：HTML metadata 與本地 link 檢查。
- `ARTICLE_GENERATION_API.md`：文章機器人輸入/輸出 JSON 合約。

Hermes 端同步規格：

```text
/Users/asdc163/LocalProjects/Hermes/docs/product-os/plans/2026-07-04-cybernews-article-api-contract.md
```

## 內容模型

`data/news.json` 每篇文章必須包含：

- `vertical`：只能是 `ai` 或 `finance`
- `content_type`：只能是 `news`、`column`、`research`
- `subcategory`：只能使用 7 個白名單分類
- `summary_zh`：1 到 2 句中文事實摘要
- `why_matters_zh`：1 到 2 句「為什麼重要」
- `body_zh`：最多 3 段中文改寫整理
- `source_url` / `canonical_url`：原始來源連結

注意：`market` 不是合法 `content_type`。市場、ETF、資金流、加密市場等題材，依內容性質歸到 `news` 或 `research`。

## 內容邊界

- 不重刊全文。
- 不繞 paywall。
- 不做投資建議。
- 不做價格預測。
- 不做買賣訊號。
- 不使用「正面 / 負面 / 中立 / 觀察中」等情緒標籤。
- 涉及股票、加密、ETF、財報或市場分析時，必要時設定 `disclaimer_required: true`。

## 生成規則

`npm run build:static` 會執行：

1. `npm run validate`
2. 從 `data/news.json` 產生文章頁
3. 更新 sitemap、robots、RSS

路由規則：

- `content_type === "research"`：產生到 `research/<id>/`
- 其他文章：產生到 `articles/<id>/`

## 目前已知待辦

1. `data/news.json` 目前刻意維持空陣列，不保留 seed 假資料；正式文章必須由文章 API 草稿、驗證、審核後 append。
2. Newsletter 表單還沒有接真實 email 服務。
3. 中英切換仍是前端字串替換，長期建議改成 key-based i18n。
4. 專題頁目前仍有手寫頁面，後續可改成完全資料驅動。

## 建議開發順序

1. 接文章 API 的 draft / validate / approve 流程，並讓正式文章 append 到 `data/news.json`。
2. 接 newsletter 服務，例如 Buttondown、MailerLite 或自建 API。
3. 把專題頁改成讀 `data/topics.json` 與 `data/news.json` 自動渲染。
4. 依 `ARTICLE_GENERATION_API.md` 建立文章機器人的草稿、審核、發布流程。

## 交接驗證

打包前已執行：

```bash
npm run validate
npm run build:static
npm run validate:site
git diff --check
```

目前驗證會通過，`data/news.json` 為 0 篇正式文章。
