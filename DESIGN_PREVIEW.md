# CYBERNEWS Design Preview Notes

這份文件給設計師與後續 session 檢查版型用。正式資料尚未接入時，站點會自動以 fixture 內容填充首頁與分類頁；正式 `data/news.json` 一旦有資料，就會停止 fallback。

正式環境的 fallback 只能用來避免版面空白，不得顯示任何「設計檢查」、「假資料」、「Design fixture」等前台字樣，也不得把一般文章連結導到 `preview=design`。`preview=design` 只允許在本機 `localhost`、`127.0.0.1` 或 `file:` 預覽時生效。

## Preview URLs

本地：

- `http://127.0.0.1:5174/index.html?preview=design`
- `http://127.0.0.1:5174/latest.html?preview=design`
- `http://127.0.0.1:5174/latest.html?type=column&preview=design`
- `http://127.0.0.1:5174/latest.html?type=research&preview=design`
- `http://127.0.0.1:5174/research.html?id=ai-weekly-agent-market-map&preview=design`

正式環境上傳後：

- `https://d2iwyj37fdufgt.cloudfront.net/index.html?preview=design`
- `https://d2iwyj37fdufgt.cloudfront.net/latest.html?type=column&preview=design`
- `https://d2iwyj37fdufgt.cloudfront.net/latest.html?type=research&preview=design`

## Fixture Boundary

- 假資料檔案：`data/design-preview-news.json`
- 正式資料檔案：`data/news.json`
- 目前正式資料維持空陣列，等待文章 API 或正式資料同步服務提供。
- 每筆假資料都帶有：
  - `is_design_fixture: true`
  - `editorial_status: "design-preview-only"`
  - `preview_note_zh`
  - `preview_note_en`
  - `source_url` / `canonical_url` 使用 `design-fixture://...`
- 前台會隱藏 `design-fixture://` source link，避免使用者誤以為有正式來源。
- `preview=design` 或正式資料為空時的 fixture fallback 會自動加上 `noindex,nofollow,noarchive`。`robots.txt` 也封鎖 preview query。
- 只有本機明確 `preview=design` 才會顯示設計檢查 banner、badge 與 fixture note；正式 CloudFront / GitHub Pages 不啟用這個 UI。
- 正式 fallback 的 fixture 文章點擊會進入 `research.html?id=...` 的一般 detail shell，不得出現 `preview=design`、設計檢查 banner、badge、fixture note、`CYBERNEWS DESIGN FIXTURE` 來源字樣，或含 `DESIGN FIXTURE` 字樣的檢查圖。

## Current Fixture Mix

- 全部：13 篇
- 新聞：8 篇
- 專欄：2 篇
- 調研：3 篇

這批內容只用來檢查排版、資訊密度、分類狀態、分享按鈕、RWD 與繁中/簡中/英文 UI。不可拿來發布、SEO 收錄、社群發文或正式內容驗收。

每筆 fixture 也提供 `locales` 與 `sources_by_locale`，目的只是讓設計師檢查三語資訊密度；正式站仍需由文章 API 提供 reviewed production content。
