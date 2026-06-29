# CLAUDE.md

光復國小「AI 小秘書 — 小光」專案的工作指南。給未來的 Claude / 開發者快速上手用。

## 專案是什麼

新北市中和區光復國小（KFES, Kuangfu Elementary School）給**家長與訪客**用的校務問答／自助服務網站。吉祥物名叫「小光」。部署於 GitHub Pages，純前端靜態網站。

主要受眾是家長，所以文案語氣一律：**繁體中文、親切、活潑、適度 emoji**。

## 技術架構

**純前端靜態網站，無 build step、無 npm、無框架。** 直接用瀏覽器開 `index.html` 即可運行。

```
index.html          單一頁面，含 5 個 view（dashboard / parent-leave / admission-guide / digital-portal / chat）
styles.css          全部樣式，CSS 變數定義在 :root
knowledge-base.js   在地知識庫資料（全域 const chatKnowledgeBase），必須在 app.js 之前載入
app.js              全部前端邏輯（~800 行），整包包在一個 DOMContentLoaded 內
firebase-config.js  Firebase Realtime Database 設定（跨裝置統計計數器）
assets/             圖片、吉祥物、校徽，以及 latest_news.json（爬蟲產出）
scripts/
  sync_school_data.py   爬光復官網首頁公告 → 寫入 assets/latest_news.json
.github/workflows/
  sync-news.yml         GitHub Action，每日定時跑爬蟲並 commit 回 repo
```

### 五個功能 view（單頁切換，無路由）
切換邏輯在 [app.js](app.js) 開頭：點 `.nav-link[data-view]` → 切 `.view-panel.active`。

1. **儀表板 dashboard** — 歡迎卡、三個統計數字、最新消息布告欄
2. **請假信產生器 parent-leave** — 表單 → **靜態模板**字串組裝（`warm`/`brief` 兩種語氣），不呼叫 AI
3. **新生入學指南 admission-guide** — 下拉選類別 → 輸出**靜態 HTML** 模板，不呼叫 AI
4. **親師數位平台 digital-portal** — 純外部連結卡片（親師生平台、ESA、附幼專網、行事曆 PDF、午餐專區）
5. **小光對話室 chat** — 問答聊天，見下方

### 聊天問答：雙模式（這是專案核心）
`generateAIResponse()` in [app.js](app.js:468)：

- **在地知識庫模式（預設，無 API key）**：`getAIResponse()` in [app.js](app.js:453)。比對 `chatKnowledgeBase`（定義在 [knowledge-base.js](knowledge-base.js)，約 21 個主題 + 大量別名 + 午餐菜單，合計約 190 個 key，value 是預寫好的 Markdown 答案）。比對方式為 `userMessage.includes(key)`，**key 依長度由長到短排序**避免短 key 誤命中。
- **AI 智慧模式（使用者在 UI 填入 Gemini API key）**：把 `chatKnowledgeBase` 全部主題（日期類 key 除外）組成 system instruction 的 RAG 背景，連同問題打 `gemini-1.5-flash` 的 `generativelanguage.googleapis.com` REST API。失敗會自動 fallback 回在地知識庫。
- API key 存在使用者瀏覽器 `localStorage` 的 `gemini_api_key`，**不進 repo**。UI badge 會顯示目前模式。

> ⚠️ 擴充知識庫只要在 [knowledge-base.js](knowledge-base.js) 往 `chatKnowledgeBase` 加 key/value 即可，兩個模式會自動吃到（AI 模式靠 app.js 的迴圈自動納入，不需要另外註冊）。日期型 key（含數字＋「月/日/／」）只有在使用者問到該日期時才餵給 Gemini，避免 context 爆掉。

### 統計計數器（Firebase）
- 三個 dashboard 數字（leave / admission / chat）。`incrementStat()` in [app.js:110](app.js:110)。
- 若 [firebase-config.js](firebase-config.js) 已設定 → 用 Firebase Realtime Database 跨裝置累計；否則自動降級為單機 `localStorage`。
- Firebase config 是**前端公開設定，非機密**，可安全 commit。Realtime Database 規則限制成只能 +1 遞增（防惡意竄改），規則內容寫在 [firebase-config.js](firebase-config.js) 檔頭註解。

### 最新消息自動同步
- [scripts/sync_school_data.py](scripts/sync_school_data.py) 用正則爬 `kfes.ntpc.edu.tw` 首頁公告連結（`/p/406-` 或 `r23.php`），取前 8 筆寫進 `assets/latest_news.json`。
- [.github/workflows/sync-news.yml](.github/workflows/sync-news.yml) 每天 UTC 23:30 / 04:30（台灣 07:30 / 12:30）自動跑並 commit。可在 Actions 分頁手動觸發。
- 前端 `loadLatestNews()` in [app.js:731](app.js:731) 讀這個 JSON 顯示在儀表板。

## 本地預覽

無 build。任一方式皆可：

```bash
# 方式 A：Python 內建伺服器（建議，避免 file:// 抓不到 latest_news.json）
python -m http.server 8000
# 開 http://localhost:8000

# 方式 B：直接用瀏覽器開 index.html（fetch 本地 JSON 可能被 CORS 擋）
```

## 慣例與注意事項

- **不要引入框架 / build 工具 / npm 依賴**，保持純靜態，GitHub Pages 直接服務。
- 改文案請維持小光的親切活潑語氣與繁中。
- `app.js` 整包在一個 IIFE/`DOMContentLoaded` 內，新功能照既有「抓 DOM → 綁 listener」的風格加。
- 編碼一律 UTF-8（檔案含大量中文）。
- 機密（如個人 Gemini key）只放 `localStorage`，**絕不寫進原始碼或 commit**。
- 學校總機 (02) 3234-8654、請假專線 (02) 8227-6913 是真實對外電話，修改 fallback 文案時勿亂改。
```

