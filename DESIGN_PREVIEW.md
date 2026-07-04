# CYBERNEWS Design Preview Notes

這份文件給設計師與後續 session 檢查版型用。`preview=design` 只載入假資料文章，正式站不會顯示這批內容。

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
- `preview=design` 會自動加上 `noindex,nofollow,noarchive`，`robots.txt` 也封鎖 preview query。

## Current Fixture Mix

- 全部：13 篇
- 新聞：8 篇
- 專欄：2 篇
- 調研：3 篇

這批內容只用來檢查排版、資訊密度、分類狀態、分享按鈕、RWD 與中英文 UI。不可拿來發布、SEO 收錄、社群發文或正式內容驗收。
