# AI NEWS CENTER Article Generation API v1

更新日期：2026-07-04

這份文件是給「文章機器人」使用的內容生成合約。它不是目前站內已存在的 HTTP server，而是一份可直接落地到目前純靜態網站的 API 規格：機器人吃來源資料，輸出符合 `data/news.json` 的文章 JSON，通過驗證後才由人工核准進站。

目前站台以 `data/news.json` 為唯一文章資料來源，`npm run build:static` 會根據每筆資料產生：

- `articles/<id>/index.html`：`content_type` 為 `news` 或 `column`
- `research/<id>/index.html`：`content_type` 為 `research`
- `sitemap.xml`
- `robots.txt`
- `rss.xml`

## 1. API 目標

文章機器人必須完成三件事：

1. 把外部來源整理成中文文章資料，不重刊全文。
2. 產出可直接進入 `data/news.json` 的 JSON item。
3. 保留人工審核關卡，避免未審內容自動發布。

本文定義的 API 可以先用「檔案模式」實作，未來也可以搬成 HTTP endpoint。

## 2. 目前站台硬規則

### 2.1 內容邊界

每篇內容都必須符合以下規則：

- 只保存 metadata、中文摘要、分類、原文連結與必要的調研整理。
- 不重刊全文。
- 不繞 paywall。
- 不把摘要寫成可替代原文的完整翻譯。
- 不做投資建議。
- 不做價格預測。
- 不做買賣訊號。
- 不使用情緒標籤，例如「正面」、「負面」、「中立」、「觀察中」。
- 涉及市場、股票、加密資產、ETF、資金流、財報或估值時，必須避免方向判斷，並視情況設 `disclaimer_required: true`。

### 2.2 合法分類

`vertical` 只允許：

```json
["ai", "finance"]
```

`content_type` 只允許：

```json
["news", "column", "research"]
```

注意：`market` 不是合法的 `content_type`。市場、資金流、ETF、科技股、加密市場等題材，依文章性質歸到 `news` 或 `research`。

`subcategory` 只允許以下 7 個：

```json
[
  "算力與晶片",
  "AI 資本與雲端",
  "AI 公司與產品",
  "科技股",
  "加密與穩定幣",
  "監管與政策",
  "AI 應用與人才"
]
```

每篇文章只能選一個 `subcategory`。次要主題放進 `topics`、`companies`、`tickers`、`coins`。

## 3. 文章生成工作流

### 3.1 檔案模式，現階段建議

```text
來源候選
  -> drafts/inbox/<candidate-id>.json
  -> 文章機器人產生 drafts/pending/<id>.json
  -> 人工審核與修改
  -> 寫入 data/news.json
  -> npm run validate
  -> npm run build:static
```

目前 repo 還沒有 `drafts/` 目錄，實作機器人時可依這份規格新增。

### 3.2 HTTP 模式，未來可用

```text
POST /v1/article-drafts
POST /v1/article-drafts/validate
POST /v1/articles/approve
GET  /v1/articles/:id
```

目前先把 HTTP endpoint 當成介面設計，不要求站台已經有後端。

## 4. API Object：ArticleSourceCandidate

這是機器人的輸入。它代表一則外部來源或編輯選題。

```json
{
  "source_name": "Rest of World",
  "source_url": "https://restofworld.org/category/artificial-intelligence/",
  "canonical_url": "https://restofworld.org/category/artificial-intelligence/",
  "title_original": "Original English headline",
  "published_at": "2026-07-04T09:00:00+08:00",
  "fetched_at": "2026-07-04T09:20:00+08:00",
  "language": "en",
  "region": "Global",
  "source_summary": "Short source-provided summary or editor note.",
  "source_excerpt": "Optional short excerpt used only for summarization, not stored as article body.",
  "editor_notes": "Optional angle, warning, or classification hint.",
  "companies": ["OpenAI"],
  "tickers": [],
  "coins": [],
  "topics": ["AI agents", "enterprise AI"],
  "image_url": "https://images.unsplash.com/..."
}
```

### 4.1 輸入欄位規則

| 欄位 | 必填 | 規則 |
| --- | --- | --- |
| `source_name` | 是 | 原始媒體、官方來源或內部欄目名稱。 |
| `source_url` | 是 | 真實原文 URL，不可用 `example.com` 佔位。 |
| `canonical_url` | 建議 | 若不提供，預設等於 `source_url`。 |
| `title_original` | 是 | 原文標題或官方標題。 |
| `published_at` | 是 | ISO datetime，含時區。 |
| `fetched_at` | 建議 | ISO datetime，含時區；若不提供，由系統帶入。 |
| `language` | 是 | 原文語言，例如 `en`、`zh-Hant`、`ja`。 |
| `region` | 是 | 事件主要地區，例如 `Global`、`United States`、`Europe`、`China`。 |
| `source_summary` | 建議 | 來源提供的摘要或 RSS description。 |
| `source_excerpt` | 可選 | 只作為生成參考，不得整段複製到輸出。 |
| `editor_notes` | 可選 | 編輯指定角度或分類提示。 |
| `companies` | 可選 | 公司名稱陣列。 |
| `tickers` | 可選 | 股票代號陣列，使用大寫，例如 `NVDA`。 |
| `coins` | 可選 | 幣種代號陣列，使用大寫，例如 `BTC`、`USDC`。 |
| `topics` | 可選 | 英文或標準化主題詞，2 到 6 個較佳。 |
| `image_url` | 可選 | 主圖 URL。可先用可信任圖庫或空字串，但正式發布前建議補圖。 |

## 5. API Object：ArticleItem

這是機器人的核心輸出。它必須可以直接放入 `data/news.json`。

```json
{
  "id": "ai-agent-workflow-enterprise-adoption",
  "title_zh": "企業 agent 工具競爭，正在從功能展示轉向工作流落地",
  "title_original": "Enterprise AI agents shift from feature demos to workflow adoption",
  "summary_zh": "企業採用 agent 工具時，焦點正從單次功能展示轉向權限、日誌、審批與跨系統整合。",
  "why_matters_zh": "這代表 agent 市場的競爭重點不只在模型能力，也在企業能否安全管理、稽核與重複使用這些工作流。",
  "body_zh": [
    "第一段說明發生什麼事，保留來源事實，不加入未被支持的推論。",
    "第二段說明影響對象，例如企業客戶、平台商、供應鏈、監管機構或開發者。",
    "第三段說明後續可追蹤訊號，例如財報、監管文件、產品功能、供應鏈交付或 API 條款。"
  ],
  "vertical": "ai",
  "content_type": "news",
  "subcategory": "AI 公司與產品",
  "source_name": "Example Source",
  "source_url": "https://example-source.com/story",
  "canonical_url": "https://example-source.com/story",
  "published_at": "2026-07-04T09:00:00+08:00",
  "fetched_at": "2026-07-04T09:20:00+08:00",
  "language": "en",
  "region": "Global",
  "companies": ["OpenAI", "Microsoft"],
  "tickers": ["MSFT"],
  "coins": [],
  "topics": ["AI agents", "workflow automation", "enterprise AI"],
  "authors": ["Example Source"],
  "image_url": "https://images.unsplash.com/...",
  "is_original_research": false,
  "disclaimer_required": false
}
```

### 5.1 必填欄位

以下欄位目前被 `scripts/validate-news.js` 視為必填：

```json
[
  "id",
  "title_zh",
  "title_original",
  "summary_zh",
  "why_matters_zh",
  "vertical",
  "content_type",
  "subcategory",
  "source_name",
  "source_url",
  "canonical_url",
  "published_at",
  "fetched_at",
  "language",
  "region",
  "companies",
  "tickers",
  "coins",
  "topics",
  "authors",
  "image_url",
  "is_original_research",
  "disclaimer_required"
]
```

`body_zh` 目前不是驗證器硬性必填，但文章頁會使用它；文章機器人必須產出。

### 5.2 欄位規格

| 欄位 | 型別 | 生成規則 |
| --- | --- | --- |
| `id` | string | URL slug。小寫英文、數字、連字號。不可重複。建議由英文主題產生，不用日期除非必要。 |
| `title_zh` | string | 繁中標題，一句話講完事件。避免驚嘆號、誇張詞、情緒詞。 |
| `title_original` | string | 原文標題。若是站內原創調研，可用英文翻譯標題。 |
| `summary_zh` | string | 1 到 2 句事實摘要。不可寫成評論或結論。 |
| `why_matters_zh` | string | 1 到 2 句，回答讀者為什麼需要看。可講影響與機制，不可講漲跌方向或投資建議。 |
| `body_zh` | array[string] | 1 到 3 段改寫整理，建議固定 3 段。不得複製原文完整句段。 |
| `vertical` | enum | `ai` 或 `finance`。 |
| `content_type` | enum | `news`、`column` 或 `research`。 |
| `subcategory` | enum | 7 主題白名單擇一。 |
| `source_name` | string | 原始來源或站內欄目名。 |
| `source_url` | string | 真實原文 URL。 |
| `canonical_url` | string | canonical URL，通常等於 `source_url`。 |
| `published_at` | string | ISO datetime，原文發布時間。 |
| `fetched_at` | string | ISO datetime，本站抓取或整理時間。 |
| `language` | string | 原文語言。 |
| `region` | string | 事件主要地區。 |
| `companies` | array[string] | 涉及公司名稱。沒有就空陣列。 |
| `tickers` | array[string] | 股票代號，大寫。沒有就空陣列。 |
| `coins` | array[string] | 幣種代號，大寫。沒有就空陣列。 |
| `topics` | array[string] | 2 到 6 個標準主題詞，供 Archive 與專題匹配。 |
| `authors` | array[string] | 原作者、來源名或站內作者。沒有明確作者時可用 `source_name`。 |
| `image_url` | string | 主圖 URL。沒有圖時仍放空字串，但正式發布前建議補上。 |
| `is_original_research` | boolean | 只有站內原創調研或多來源深度整理才設 `true`。 |
| `disclaimer_required` | boolean | 涉及金融市場、投資資產、調研、市場分析時通常設 `true`。 |

## 6. 分類決策表

### 6.1 vertical

| 情境 | `vertical` |
| --- | --- |
| 模型、agent、平台、開發者工具、AI 產品 | `ai` |
| AI 基礎建設、資料中心、GPU、HBM、先進封裝 | `ai` |
| AI 監管、模型治理、企業導入、AI 教育與人才 | `ai` |
| 科技股財報、股價以外的公司市場事件、IPO、併購 | `finance` |
| Bitcoin、Ethereum、Solana、ETF、穩定幣、交易所 | `finance` |
| Fed、利率、宏觀政策，且主要影響科技股或加密市場 | `finance` |
| AI 公司融資或雲端合約 | 看主軸。產品與平台主軸用 `ai`；資金、市場與資本配置主軸用 `finance`。 |

### 6.2 content_type

| 情境 | `content_type` |
| --- | --- |
| 最新事件、公告、產品發布、監管新聞、財報新聞 | `news` |
| 固定欄目、週記、編輯觀察、作者觀點 | `column` |
| 深度研究、多來源整理、市場結構分析、產業研究 | `research` |
| 市場動態、ETF 流入流出、資金流、併購 | 多數是 `news`；若有深度分析才用 `research`。 |

### 6.3 subcategory

| 主軸 | `subcategory` |
| --- | --- |
| GPU、HBM、CoWoS、資料中心、能源、伺服器、主權雲 | `算力與晶片` |
| 雲端合約、資本開支、AI 融資、折舊、現金流、商業模式 | `AI 資本與雲端` |
| 模型、agent、平台、開發者工具、公司產品動態 | `AI 公司與產品` |
| 科技公司財報、IPO、併購、裝置週期、科技股供應鏈事件 | `科技股` |
| Bitcoin、Ethereum、Solana、ETF、交易所、穩定幣、支付 | `加密與穩定幣` |
| AI 法規、金融監管、產業政策、SEC、CFTC、歐盟政策 | `監管與政策` |
| 企業導入、教育、醫療、創作、勞動市場、人才供需 | `AI 應用與人才` |

## 7. 寫作結構 API

### 7.1 news

`news` 是事實整理，不加入未被來源支持的主觀判斷。

`body_zh` 建議三段：

1. 發生什麼事。
2. 影響哪些公司、使用者、產業或監管方。
3. 後續可追蹤的訊號。

### 7.2 column

`column` 可以有編輯觀察，但仍需保留來源與限制。

`body_zh` 建議三段：

1. 本週或本篇觀察的主線。
2. 這條主線背後的產品、產業或市場機制。
3. 接下來可觀察的節點。

標題可包含欄目名，例如：

- `AI Weekly：...`
- `Finance Brief：...`
- `Crypto Ledger：...`
- `Policy Watch：...`

欄目名不要放進 `subcategory`。

### 7.3 research

`research` 是深度整理或站內調研。它可以有分析，但不能變成投資建議。

`body_zh` 建議三段：

1. 核心問題與背景。
2. 主要結構、數據、公司或市場機制。
3. 後續追蹤指標與限制。

`research` 的額外規則：

- 路由會生成到 `research/<id>/`。
- JSON-LD `@type` 會是 `Report`。
- 建議 `disclaimer_required: true`，尤其涉及股票、加密、ETF、財報、市場分析。
- 若是站內原創或多來源深度整理，設 `is_original_research: true`。

## 8. Endpoint 規格

### 8.1 POST /v1/article-drafts

用途：輸入來源候選，產生待審文章草稿。

Request：

```json
{
  "candidate": {
    "source_name": "Rest of World",
    "source_url": "https://restofworld.org/example",
    "canonical_url": "https://restofworld.org/example",
    "title_original": "Original headline",
    "published_at": "2026-07-04T09:00:00+08:00",
    "fetched_at": "2026-07-04T09:20:00+08:00",
    "language": "en",
    "region": "Global",
    "source_summary": "Short source summary.",
    "source_excerpt": "Optional short excerpt.",
    "companies": [],
    "tickers": [],
    "coins": [],
    "topics": ["AI education"],
    "image_url": ""
  },
  "options": {
    "preferred_vertical": null,
    "preferred_content_type": "news",
    "preferred_subcategory": null,
    "force_disclaimer": false,
    "now": "2026-07-04T10:00:00+08:00"
  }
}
```

Response：

```json
{
  "status": "needs_review",
  "api_version": "article-generation.v1",
  "draft": {
    "id": "example-generated-id",
    "title_zh": "中文標題",
    "title_original": "Original headline",
    "summary_zh": "中文摘要。",
    "why_matters_zh": "為什麼重要。",
    "body_zh": ["第一段。", "第二段。", "第三段。"],
    "vertical": "ai",
    "content_type": "news",
    "subcategory": "AI 應用與人才",
    "source_name": "Rest of World",
    "source_url": "https://restofworld.org/example",
    "canonical_url": "https://restofworld.org/example",
    "published_at": "2026-07-04T09:00:00+08:00",
    "fetched_at": "2026-07-04T09:20:00+08:00",
    "language": "en",
    "region": "Global",
    "companies": [],
    "tickers": [],
    "coins": [],
    "topics": ["AI education"],
    "authors": ["Rest of World"],
    "image_url": "",
    "is_original_research": false,
    "disclaimer_required": false
  },
  "review": {
    "requires_human_approval": true,
    "source_used": true,
    "copied_full_text": false,
    "investment_advice_detected": false,
    "classification_notes": "主軸是教育與 AI 人才供給，因此歸入 AI 應用與人才。",
    "warnings": []
  }
}
```

### 8.2 POST /v1/article-drafts/validate

用途：檢查草稿是否能進 `data/news.json`。

Request：

```json
{
  "draft": "<ArticleItem>",
  "existing_ids": ["ai-weekly-agent-market-map"],
  "existing_urls": ["https://restofworld.org/category/artificial-intelligence/"]
}
```

Response：

```json
{
  "status": "valid",
  "errors": [],
  "warnings": [
    "image_url is empty; add an image before publishing if this is a lead story."
  ],
  "computed": {
    "route": "articles/generated-article-id/",
    "public_url_kind": "article",
    "topic_matches": ["ai-regulation"],
    "reading_minutes_estimate": 1
  }
}
```

Validation error examples：

```json
[
  {
    "code": "INVALID_CONTENT_TYPE",
    "message": "content_type must be news, column, or research. market is not allowed."
  },
  {
    "code": "DUPLICATE_ID",
    "message": "id already exists in data/news.json."
  },
  {
    "code": "SOURCE_URL_REQUIRED",
    "message": "source_url must be a real original source URL."
  }
]
```

### 8.3 POST /v1/articles/approve

用途：人工審核後，把草稿加入正式資料。

Request：

```json
{
  "draft": "<ArticleItem>",
  "reviewer": "editor",
  "approval_notes": "Checked source link and classification.",
  "append_to": "data/news.json",
  "run_build": true
}
```

Response：

```json
{
  "status": "approved",
  "article_id": "generated-article-id",
  "written_to": "data/news.json",
  "commands": [
    "npm run validate",
    "npm run build:static"
  ],
  "generated_paths": [
    "articles/generated-article-id/index.html",
    "sitemap.xml",
    "rss.xml"
  ]
}
```

審核前不得直接寫入 `data/news.json`。

## 9. 機器人輸出格式

文章機器人回傳時，預設只輸出 JSON，不要包 Markdown，不要加解釋文字。

```json
{
  "api_version": "article-generation.v1",
  "status": "needs_review",
  "draft": "<ArticleItem>",
  "review": {
    "requires_human_approval": true,
    "classification_notes": "string",
    "source_risk_notes": "string",
    "warnings": []
  }
}
```

若無法生成，輸出：

```json
{
  "api_version": "article-generation.v1",
  "status": "rejected",
  "reason_code": "INSUFFICIENT_SOURCE",
  "message": "來源資訊不足，無法產生可發布摘要。",
  "missing_fields": ["source_url", "published_at"]
}
```

## 10. 錯誤碼

| code | 說明 |
| --- | --- |
| `INSUFFICIENT_SOURCE` | 來源資訊不足。 |
| `SOURCE_URL_REQUIRED` | 缺少真實原文 URL。 |
| `DUPLICATE_ID` | `id` 與既有文章重複。 |
| `DUPLICATE_SOURCE_URL` | `source_url` 或 `canonical_url` 已存在。 |
| `INVALID_VERTICAL` | `vertical` 不在白名單。 |
| `INVALID_CONTENT_TYPE` | `content_type` 不在白名單，常見錯誤是輸出 `market`。 |
| `INVALID_SUBCATEGORY` | `subcategory` 不在 7 主題白名單。 |
| `MISSING_WHY_MATTERS` | 缺少 `why_matters_zh`。 |
| `BODY_TOO_LONG` | `body_zh` 超過 3 段或摘要過長。 |
| `COPYRIGHT_RISK` | 內容疑似複製原文句段或過度接近原文。 |
| `INVESTMENT_ADVICE_RISK` | 內容含投資建議、價格預測或買賣訊號。 |
| `NEEDS_HUMAN_REVIEW` | 可生成草稿，但需人工確認來源、分類或風險。 |

## 11. 重複與 slug 規則

### 11.1 id 產生

`id` 使用英文小寫 slug：

```text
<main-entity>-<topic>-<event>
```

範例：

- `msft-openai-cloud-contract`
- `bitcoin-etf-inflows-institutional`
- `eu-foundation-model-audit`
- `ai-chip-supply-chain-research`

規則：

- 只用 `a-z`、`0-9`、`-`。
- 不用底線。
- 不用中文。
- 不用過長標題，建議 4 到 7 個英文詞。
- 寫入前必須檢查 `data/news.json` 是否已有同名 `id`。

### 11.2 duplicate check

正式發布前至少檢查：

- `id`
- `source_url`
- `canonical_url`
- `title_original`

若同一來源已有文章，不要生成第二篇，除非編輯明確要求做後續更新或專欄整理。

## 12. 專題匹配 API

`data/topics.json` 會用以下欄位匹配文章：

- `subcategory`
- `tickers`
- `coins`
- `topics`

任一命中即可掛入專題。文章機器人不需要直接修改 `data/topics.json`，但應產生足夠準確的 metadata。

範例：

```json
{
  "subcategory": "算力與晶片",
  "tickers": ["NVDA", "TSM"],
  "coins": [],
  "topics": ["AI chips", "HBM", "advanced packaging", "data center"]
}
```

這類文章會命中 `nvidia-supply-chain`。

## 13. 發布前 checklist

人工審核或自動驗證都應檢查：

- [ ] `source_url` 是真實原文。
- [ ] `canonical_url` 是真實 URL。
- [ ] 沒有重刊全文。
- [ ] `body_zh` 沒有整段翻譯或複製原文。
- [ ] `vertical` 是 `ai` 或 `finance`。
- [ ] `content_type` 是 `news`、`column` 或 `research`。
- [ ] `subcategory` 在 7 主題白名單內。
- [ ] `summary_zh` 是事實摘要。
- [ ] `why_matters_zh` 不含投資建議或價格方向。
- [ ] `companies`、`tickers`、`coins` 不把無關實體硬塞進去。
- [ ] 涉及市場或調研時，`disclaimer_required` 設定合理。
- [ ] `npm run validate` 通過。
- [ ] `npm run build:static` 通過。

## 14. 可直接交給文章機器人的系統提示

```text
你是 AI NEWS CENTER 的文章生成器。你只能輸出符合 article-generation.v1 的 JSON。

任務：
1. 根據輸入來源，產生一筆可放入 data/news.json 的 ArticleItem。
2. 使用繁體中文寫 title_zh、summary_zh、why_matters_zh、body_zh。
3. body_zh 最多三段，必須是改寫整理，不可複製原文段落，不可重刊全文。
4. vertical 只能是 ai 或 finance。
5. content_type 只能是 news、column、research；market 不是合法值。
6. subcategory 只能從以下七個選一個：算力與晶片、AI 資本與雲端、AI 公司與產品、科技股、加密與穩定幣、監管與政策、AI 應用與人才。
7. 不做投資建議、價格預測、買賣訊號，不使用正面/負面/中立/觀察中等情緒標籤。
8. source_url 必須保留原文連結，canonical_url 預設等於 source_url。
9. companies、tickers、coins、topics 必須只放和文章直接相關的項目。
10. 回傳 status=needs_review，不得宣稱已發布。

輸出格式：
{
  "api_version": "article-generation.v1",
  "status": "needs_review",
  "draft": { ...ArticleItem },
  "review": {
    "requires_human_approval": true,
    "classification_notes": "...",
    "source_risk_notes": "...",
    "warnings": []
  }
}
```

## 15. 本 repo 的實際驗證命令

```bash
npm run validate
npm run build:static
```

目前 `package.json` 已定義：

```json
{
  "scripts": {
    "validate": "node scripts/validate-news.js",
    "build:static": "npm run validate && node scripts/build-static.js"
  }
}
```

## 16. 實作建議

第一版文章機器人可以只做三個檔案動作：

1. 讀 `data/news.json` 做 duplicate check。
2. 根據 `ArticleSourceCandidate` 產生 `drafts/pending/<id>.json`。
3. 人工審核後把 draft append 到 `data/news.json`，再跑 `npm run build:static`。

等這條路穩定後，再把 `POST /v1/article-drafts`、`POST /v1/article-drafts/validate`、`POST /v1/articles/approve` 實作成真正後端 API。
