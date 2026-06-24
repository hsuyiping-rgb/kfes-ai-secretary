/* ==========================================================================
   Firebase 設定檔（全校共用統計計數器用）
   --------------------------------------------------------------------------
   這是「跨裝置真實累計」三個 dashboard 數字（家長請假 / 報到下載 / AI 諮詢）
   的後端設定。設定完成後，計數器就會跨所有訪客、所有裝置一起累加。

   ⚠️ 注意：
   - 下面這組 firebaseConfig 是「網頁用公開設定」，本來就會出現在前端原始碼，
     不是機密金鑰，可以安全地 commit 進 GitHub。
   - 若這個檔案維持未設定（apiKey 還是 "貼上你的..."），網站會自動降級成
     單機 localStorage 計數，不會壞掉，只是數字不會跨裝置共用。

   ── 設定步驟（約 5 分鐘，全部在瀏覽器完成，不需要寫程式）──────────────
   1. 到 https://console.firebase.google.com/ ，用你的 Google 帳號登入，
      點「建立專案 / Add project」，取個名字（例如 kfes-ai-secretary），
      Google Analytics 可關閉。
   2. 進專案後，左側選單 → 建構 Build → Realtime Database → 建立資料庫。
      位置選「Singapore (asia-southeast1)」較近；
      安全規則先選「以鎖定模式啟動」即可（稍後第 5 步會貼上自訂規則）。
   3. 回到專案總覽，點「</>」(Web) 新增一個網頁應用程式，
      註冊後 Firebase 會給你一段 const firebaseConfig = { ... }。
   4. 把那段 { ... } 裡的值，原封不動貼到下方覆蓋 firebaseConfig，
      務必包含 databaseURL（Realtime Database 那一行，結尾通常是
      ...asia-southeast1.firebasedatabase.app）。
   5. 回到 Realtime Database → 「規則 Rules」分頁，貼上以下規則並發布，
      讓任何人都能讀、但只能「+1」遞增（防止被惡意亂改數字）：

      {
        "rules": {
          "stats": {
            ".read": true,
            "$field": {
              ".write": "newData.isNumber() && (!data.exists() || newData.val() === data.val() + 1)"
            }
          }
        }
      }

   6. 存檔、重新整理網站，三個數字就會改由 Firebase 提供並跨裝置累計。
   ========================================================================== */

const firebaseConfig = {
  apiKey: "貼上你的 apiKey",
  authDomain: "貼上你的 authDomain",
  databaseURL: "貼上你的 databaseURL",   // ← 必填，Realtime Database 網址
  projectId: "貼上你的 projectId",
  storageBucket: "貼上你的 storageBucket",
  messagingSenderId: "貼上你的 messagingSenderId",
  appId: "貼上你的 appId"
};

// 只有在「設定已填好」且「SDK 已載入」時才初始化 Firebase；
// 否則 app.js 會自動降級為單機 localStorage 計數。
try {
  const isConfigured =
    typeof firebase !== 'undefined' &&
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.startsWith('貼上') &&
    firebaseConfig.databaseURL &&
    !firebaseConfig.databaseURL.startsWith('貼上');

  if (isConfigured) {
    firebase.initializeApp(firebaseConfig);
    console.log('[Firebase] 已初始化，統計計數器將跨裝置共用。');
  } else {
    console.log('[Firebase] 尚未設定，統計計數器使用單機 localStorage（見 firebase-config.js 設定步驟）。');
  }
} catch (err) {
  console.warn('[Firebase] 初始化失敗，降級為 localStorage 計數：', err);
}
