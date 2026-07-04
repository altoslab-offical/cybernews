# AI NEWS CENTER

AI NEWS CENTER 是一個純靜態的 AI 與科技財經新聞網站。內容資料放在 `data/news.json`，網站只保存 metadata、中文摘要、分類、原文連結與必要的調研整理，不重刊全文、不繞 paywall、不做投資建議。

## 目前架構

主頻道：

- AI 新聞
- 金融

內容型態：

- 新聞
- 專欄
- 調研

子分類白名單：

- 算力與晶片
- AI 資本與雲端
- AI 公司與產品
- 科技股
- 加密與穩定幣
- 監管與政策
- AI 應用與人才

## 主要檔案

- `DEVELOPER_HANDOFF.md`：開發交接摘要、目前狀態、待辦與驗證方式。
- `ARTICLE_GENERATION_API.md`：文章機器人的內容生成 API 與 JSON 合約。
- `DEPLOYMENT.md`：新 GitHub Pages、全新 GA/GTM、全新 AWS 靜態站部署方式。
- `data/news.json`：新聞、專欄、調研內容資料。
- `data/topics.json`：專題追蹤規則。
- `data/site.json`：站名、網域、預設語言與 RSS 描述。
- `script.js`：前端資料渲染、篩選、語言切換。
- `scripts/validate-news.js`：內容資料驗證。
- `scripts/build-static.js`：產生 `articles/`、`research/`、`sitemap.xml`、`robots.txt`、`rss.xml`、`llms.txt`、`llms-full.txt`。
- `scripts/apply-site-metadata.js`：替頂層頁面注入 canonical、OG/Twitter、JSON-LD、GA/GTM snippet。
- `scripts/validate-site.js`：檢查 HTML metadata 與本地連結目標。

## 內容新增流程

1. 若用文章機器人產文，先依 `ARTICLE_GENERATION_API.md` 產生待審草稿。
2. 人工審核草稿內容、來源、分類與內容邊界。
3. 編輯 `data/news.json`。
4. 確認 `vertical` 是 `ai` 或 `finance`。
5. 確認 `content_type` 是 `news`、`column` 或 `research`。
6. 確認 `subcategory` 使用白名單中的名稱。
7. 補上 `why_matters_zh`、`body_zh`、`locales.zh-Hant`、`locales.zh-Hans`、`locales.en`。
8. 補上 `sources_by_locale.zh-Hant`、`sources_by_locale.zh-Hans`、`sources_by_locale.en`，讓台灣、中國與其他地區能顯示對應來源名稱與地區。
9. 執行驗證：

```bash
npm run validate
```

9. 產生靜態頁：

```bash
npm run build:static
```

目前 `data/news.json` 可以是空陣列；正式文章由外部文章 API 產生並通過審核後再 append。正式發布前必須使用 strict gate，避免佔位來源或不完整欄位進站：

```bash
STRICT_SOURCES=1 npm run validate
npm run build:static
npm run validate:site
```

## 本地預覽

因為前端會用 `fetch()` 載入 `data/news.json` 與 `data/topics.json`，建議使用本地 HTTP server 預覽，不要直接用 `file://`。

```bash
python3 -m http.server 5173 --bind 127.0.0.1
```

開啟：

```text
http://127.0.0.1:5173/
```

## 目前暫緩

- i18n 已支援繁中、簡中、英文三語文章欄位；長期仍可改成完整 key-based 字典。
- Archive 是否重新接回主導航。
- 專題頁是否統一改成 `topic.html?slug=` 或靜態生成。
- Newsletter 目前只有前端確認互動，尚未接 email provider 或後端 API。
- 正式文章內容尚未接 API；目前站內不保留 seed 假資料。
