document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 0. 全校共用統計計數器（Firebase 後端，未設定時自動降級為 localStorage）
  // ==========================================================================
  // 預設基準值（DB 尚未有資料時的起算數字）
  const STAT_DEFAULTS = {
    leave: 0,
    admission: 0,
    chat: 0
  };
  // localStorage 降級用的 key（Firebase 未設定時才會用到）
  // 註：_live 後綴為「正式上線歸零」用的新計數鍵，與舊的假基準值脫鉤。
  const STAT_KEYS = {
    leave: 'kfes_stat_leave_live',
    admission: 'kfes_stat_admission_live',
    chat: 'kfes_stat_chat_live'
  };
  // app.js 內部欄位名 → Firebase Realtime Database 子節點名稱
  // 改用 *_live 全新節點，讓計數器自上線起從 0 真實累計（舊節點 leave/admission/chat 為孤兒資料，可於 Firebase 主控台手動刪除）。
  const STAT_DB_FIELDS = {
    leave: 'leave_live',
    admission: 'admission_live',
    chat: 'chat_live'
  };
  // app.js 內部欄位名 → Firebase / 顯示對應
  const STAT_FIELDS = ['leave', 'admission', 'chat'];

  let totalLeavesGenerated = STAT_DEFAULTS.leave;
  let totalAdmissionsChecked = STAT_DEFAULTS.admission;
  let totalChatResponses = STAT_DEFAULTS.chat;

  // 偵測 Firebase 是否已成功初始化（index.html 載入 firebase-config.js 後設定）
  const useFirebase = (typeof firebase !== 'undefined') &&
                      firebase.apps && firebase.apps.length > 0;
  const statsDbRef = useFirebase ? firebase.database().ref('stats') : null;

  // localStorage 降級：讀取已累計的數字，沒有就用基準值
  function loadStat(key, fallback) {
    const saved = parseInt(localStorage.getItem(key), 10);
    return Number.isNaN(saved) ? fallback : saved;
  }

  // ==========================================================================
  // 1. Date & Time Initialization
  // ==========================================================================
  function updateHeaderDate() {
    const dateElement = document.getElementById('current-date');
    const now = new Date();
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const formatted = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} (${days[now.getDay()]})`;
    dateElement.textContent = formatted;
  }
  updateHeaderDate();

  // ==========================================================================
  // 2. Sidebar View Switcher Logic
  // ==========================================================================
  const navLinks = document.querySelectorAll('.nav-link');
  const viewPanels = document.querySelectorAll('.view-panel');
  const viewTitle = document.getElementById('view-title');

  const viewTitles = {
    'dashboard': '歡迎使用小光秘書',
    'parent-leave': '請假信產生器',
    'admission-guide': '新生入學與報到指南',
    'digital-portal': '親師數位平台傳送門',
    'chat': '與小光即時對話'
  };

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active from all links & views
      navLinks.forEach(l => l.classList.remove('active'));
      viewPanels.forEach(p => p.classList.remove('active'));
      
      // Add active to current
      const viewId = link.getAttribute('data-view');
      link.classList.add('active');
      
      const targetPanel = document.getElementById(`view-${viewId}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
      
      // Update header title
      if (viewTitles[viewId]) {
        viewTitle.textContent = viewTitles[viewId];
      }
    });
  });

  // 把目前的數字渲染到 dashboard（千分位顯示）
  function renderDashboardStats() {
    document.getElementById('stat-leave-count').textContent = totalLeavesGenerated.toLocaleString();
    document.getElementById('stat-admission-count').textContent = totalAdmissionsChecked.toLocaleString();
    document.getElementById('stat-chat-count').textContent = totalChatResponses.toLocaleString();
  }

  // 將欄位值寫回對應的 JS 變數
  function applyStatValue(field, value) {
    if (field === 'leave') totalLeavesGenerated = value;
    else if (field === 'admission') totalAdmissionsChecked = value;
    else if (field === 'chat') totalChatResponses = value;
  }

  // 計數器 +1：Firebase 模式用伺服器端原子遞增；否則用 localStorage 累計
  function incrementStat(field) {
    if (useFirebase) {
      // 伺服器端 atomic +1，跨裝置一致；UI 由下方 .on('value') 即時監聽更新
      statsDbRef.child(STAT_DB_FIELDS[field]).set(firebase.database.ServerValue.increment(1));
    } else {
      const current = loadStat(STAT_KEYS[field], STAT_DEFAULTS[field]);
      const next = current + 1;
      localStorage.setItem(STAT_KEYS[field], next);
      applyStatValue(field, next);
      renderDashboardStats();
    }
  }

  // 初始化統計來源
  if (useFirebase) {
    // 1) 種子：DB 尚無資料時，把基準值寫進去（transaction 確保不重複累加）
    STAT_FIELDS.forEach(field => {
      statsDbRef.child(STAT_DB_FIELDS[field]).transaction(cur => (cur === null ? STAT_DEFAULTS[field] : cur));
    });
    // 2) 即時監聽：任何裝置遞增都會自動反映到畫面
    statsDbRef.on('value', (snapshot) => {
      const data = snapshot.val() || {};
      STAT_FIELDS.forEach(field => {
        const dbKey = STAT_DB_FIELDS[field];
        const v = (typeof data[dbKey] === 'number') ? data[dbKey] : STAT_DEFAULTS[field];
        applyStatValue(field, v);
      });
      renderDashboardStats();
    }, (err) => {
      console.warn('[Stats] Firebase 讀取失敗，改用基準值顯示：', err);
      renderDashboardStats();
    });
  } else {
    // 降級：從 localStorage 讀回（避免重整後跳回 HTML 寫死的預設值）
    totalLeavesGenerated = loadStat(STAT_KEYS.leave, STAT_DEFAULTS.leave);
    totalAdmissionsChecked = loadStat(STAT_KEYS.admission, STAT_DEFAULTS.admission);
    totalChatResponses = loadStat(STAT_KEYS.chat, STAT_DEFAULTS.chat);
    renderDashboardStats();
  }

  // Helper function to copy text with button feedback
  function setupCopyButton(btnId, outputElementId) {
    const btn = document.getElementById(btnId);
    const output = document.getElementById(outputElementId);
    
    if (!btn || !output) return;
    
    btn.addEventListener('click', () => {
      const textToCopy = output.innerText || output.textContent;
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        btn.textContent = '已複製！';
        btn.classList.add('copied');
        
        setTimeout(() => {
          btn.textContent = '複製內容';
          btn.classList.remove('copied');
        }, 2000);
      }).catch(err => {
        console.error('複製失敗:', err);
      });
    });
  }

  setupCopyButton('btn-copy-leave', 'leave-output');
  setupCopyButton('btn-copy-admission', 'admission-output');

  // ==========================================================================
  // 3. Parent Leave Letter Generator Logic
  // ==========================================================================
  const btnGenerateLeave = document.getElementById('btn-generate-leave');
  const leaveLoading = document.getElementById('leave-loading');
  const leavePlaceholder = document.getElementById('leave-placeholder');
  const leaveOutput = document.getElementById('leave-output');
  const btnCopyLeave = document.getElementById('btn-copy-leave');
  
  const leaveTonePills = document.querySelectorAll('#view-parent-leave .tone-pill');
  let selectedLeaveTone = 'warm';

  leaveTonePills.forEach(pill => {
    pill.addEventListener('click', () => {
      leaveTonePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedLeaveTone = pill.getAttribute('data-tone');
    });
  });

  if (btnGenerateLeave) {
    btnGenerateLeave.addEventListener('click', () => {
      const studentName = document.getElementById('leave-student-name').value.trim();
      const leaveClass = document.getElementById('leave-class').value.trim();
      const leaveType = document.getElementById('leave-type').value;
      const leaveDate = document.getElementById('leave-date').value.trim();
      const leaveReason = document.getElementById('leave-reason').value.trim();

      if (!studentName || !leaveClass || !leaveDate || !leaveReason) {
        alert('請填寫學生姓名、班級、請假時間與原因喔！小光才能為您產出完整的假單信！');
        return;
      }

      leaveLoading.style.display = 'flex';
      leavePlaceholder.style.display = 'none';
      leaveOutput.style.display = 'none';
      btnCopyLeave.style.display = 'none';

      setTimeout(() => {
        leaveLoading.style.display = 'none';
        leaveOutput.style.display = 'block';
        btnCopyLeave.style.display = 'block';

        let letter = '';
        if (selectedLeaveTone === 'warm') {
          letter = `李老師您好：\n\n我是 ${leaveClass} ${studentName} 的家長。跟您說明一聲，孩子因為 ${leaveReason}，因此需要向您請 ${leaveType}，請假時間為 ${leaveDate}。\n\n請假期間我會督促孩子在家休息，並在身體好轉時補上學習進度。非常感謝老師在校的關懷與照顧，辛苦您了！✿\n\n${studentName} 家長 敬上`;
        } else {
          letter = `李老師您好：\n\n我是 ${leaveClass} ${studentName} 的家長。孩子因 ${leaveReason}，需於 ${leaveDate} 辦理 ${leaveType}。特此向老師知會報備，感謝老師！\n\n${studentName} 家長 敬上`;
        }

        leaveOutput.textContent = letter;

        // Update stats
        incrementStat('leave');
      }, 1200);
    });
  }

  // ==========================================================================
  // 4. Admission Guide Generator Logic
  // ==========================================================================
  const btnGenerateAdmission = document.getElementById('btn-generate-admission');
  const admissionLoading = document.getElementById('admission-loading');
  const admissionPlaceholder = document.getElementById('admission-placeholder');
  const admissionOutput = document.getElementById('admission-output');
  const btnCopyAdmission = document.getElementById('btn-copy-admission');

  if (btnGenerateAdmission) {
    btnGenerateAdmission.addEventListener('click', () => {
      const type = document.getElementById('admission-type').value;

      admissionLoading.style.display = 'flex';
      admissionPlaceholder.style.display = 'none';
      admissionOutput.style.display = 'none';
      btnCopyAdmission.style.display = 'none';

      setTimeout(() => {
        admissionLoading.style.display = 'none';
        admissionOutput.style.display = 'block';
        btnCopyAdmission.style.display = 'block';

        let htmlContent = '';
        if (type === '小一新生報到') {
          htmlContent = `
            <div class="preview-document">
              <h2>🎒 115 學年度小一新生入學與線上報到指南</h2>
              <p>恭喜您的寶貝即將邁入國小學習階段！光復國小誠摯歡迎新成員的加入，以下為您整理小一新生入學各項重要事宜：</p>
              
              <h3>📅 重要期程</h3>
              <ul>
                <li><strong>學齡對象：</strong>民國 108 年 9 月 2 日至 109 年 9 月 1 日出生之適齡學童。</li>
                <li><strong>通知單寄發：</strong>區公所預計於 5 月上旬寄發「新生入學通知單」至學童戶籍地。</li>
                <li><strong>線上報到期間：</strong>每年 5 月中旬（新北市統一線上報到系統開放期間）。</li>
                <li><strong>現場報到時間：</strong>每年 5 月中旬之週六（上午 09:00 - 12:00），適合無法進行線上報到之親自辦理家長。</li>
              </ul>

              <h3>📂 報到應攜帶文件（限現場報到）</h3>
              <ol>
                <li><strong>新生入學通知單</strong>（請家長事先填妥基本資料與調查問卷）。</li>
                <li><strong>戶口名簿正本與影本一份</strong>（戶籍需設於本校學區內）。</li>
                <li><strong>家長雙方身分證與印章</strong>。</li>
                <li><strong>預防接種時程卡（黃卡）影本</strong>。</li>
                <li><strong>特殊身分證明文件</strong>（如低收、中低收入戶、原住民、家長或學童身心障礙手冊等影本，如無則免）。</li>
              </ol>

              <h3>🏫 本校基本學區範圍</h3>
              <p>新北市中和區：光復里、內南里、外南里（部分鄰）、力行里（部分鄰）等，詳細里鄰劃分請查閱教務處最新公告。</p>

              <h3>📞 業務承辦與諮詢</h3>
              <p>如有任何入學報到疑問，歡迎電洽教務處註冊組：<strong>(02) xxxx-xxxx 分機 112</strong> 洽詢！</p>
            </div>
          `;
        } else if (type === '轉學生申辦') {
          htmlContent = `
            <div class="preview-document">
              <h2>🔄 學生轉入與轉出手續指南</h2>
              <p>家長您好！為孩子辦理轉入或轉出光復國小，請依下列手續辦理：</p>
              
              <h3>📥 轉入本校手續（轉入學）</h3>
              <ol>
                <li><strong>學區確認：</strong>請先確定已辦妥戶籍遷移，且新戶籍地屬於本校之指定學區內。</li>
                <li><strong>原校轉出：</strong>先至原就讀學校辦理「轉出」，並取得原校開立之<strong>轉出證明書</strong>。</li>
                <li><strong>本校辦理：</strong>家長攜帶以下文件親自至本校教務處註冊組辦理：
                  <ul>
                    <li>新遷妥之<strong>戶口名簿正本</strong>（需詳細記事）。</li>
                    <li>原校之<strong>轉出證明書</strong>。</li>
                    <li>辦理家長之<strong>身分證及印章</strong>。</li>
                  </ul>
                </li>
                <li><strong>入班上課：</strong>編班作業通常於半天內完成，註冊組將依規範隨機抽籤入班，並由導師帶領入班上課。</li>
              </ol>

              <h3>📤 轉出本校手續（轉出學）</h3>
              <ol>
                <li><strong>告知導師：</strong>請於轉出前 3 天口頭或透過聯絡簿告知班級導師。</li>
                <li><strong>準備轉出：</strong>攜帶以下文件至教務處註冊組辦理：
                  <ul>
                    <li>已遷入新學籍的<strong>新戶口名簿正本</strong>。</li>
                    <li>辦理家長之<strong>身分證及印章</strong>。</li>
                  </ul>
                </li>
                <li><strong>前往新校：</strong>辦妥後取得「轉出證明書」，並請於 3 日內前往新學校註冊組辦理轉入。</li>
              </ol>

              <h3>📞 註冊組聯絡分機</h3>
              <p>教務處註冊組電話：(02) xxxx-xxxx 分機 112。</p>
            </div>
          `;
        } else if (type === '幼兒園招生') {
          htmlContent = `
            <div class="preview-document">
              <h2>👶 光復國小附設幼兒園招生報名懶人包</h2>
              <p>歡迎可愛的寶貝加入光復附幼大家庭！最新招生日程與規定如下：</p>
              
              <h3>📅 招生日程（每年 5-6 月）</h3>
              <ul>
                <li><strong>招生簡章公告：</strong>每年 5 月上旬於本校官方網站與附幼網站同步公告。</li>
                <li><strong>線上登記時間：</strong>每年 5 月下旬至 6 月初（新北市公立幼兒園招生系統開放期間）。</li>
                <li><strong>抽籤與錄取公告：</strong>每年 6 月上旬統一進行電腦抽籤，並於校網公告正取與備取名單。</li>
              </ul>

              <h3>📝 招生對象年齡</h3>
              <ul>
                <li>本學年度招收<strong>滿 3 歲至入國民小學前</strong>之適齡幼兒。</li>
                <li><strong>年齡區間：</strong>依每年简章公告之出生年月日限制。</li>
              </ul>

              <h3>📂 優先入園資格（需備齊相關證明）</h3>
              <ol>
                <li>身心障礙幼兒、低收入戶幼兒、中低收入戶幼兒、原住民幼兒、特殊境遇家庭幼兒等（法定優先）。</li>
                <li>本校現職教職員工子女。</li>
                <li>育有三胎以上家庭之幼兒。</li>
                <li>設籍於本校學區內之幼兒。</li>
              </ol>

              <h3>🔗 幼兒園專區連結</h3>
              <p>招生報到與寶貝在園生活照分享，請訪問：<a href="https://sites.google.com/view/kfeskid" target="_blank" rel="noopener noreferrer">光復附設幼兒園官方專網</a> ✿</p>
            </div>
          `;
        }

        admissionOutput.innerHTML = htmlContent;

        // Update stats
        incrementStat('admission');
      }, 1200);
    });
  }

  // ==========================================================================
  // 5. Interactive Chat Room Logic (Parent/Visitor Focused - Playful Tone)
  // ==========================================================================
  const chatMessagesLog = document.getElementById('chat-messages-log');
  const chatInputBox = document.getElementById('chat-input-box');
  const btnSendChat = document.getElementById('btn-send-chat');
  const chatChips = document.querySelectorAll('.chip');
  const chatChipsContainer = document.querySelector('.chat-chips');

  function formatMarkdownToHTML(text) {
    if (!text) return "";
    let html = text;
    
    // Replace **bold** with <strong>bold</strong>
    html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
    
    // Replace ### header with a styled header div
    html = html.replace(/###\s+([^\n]+)/g, '<div class="chat-section-header">$1</div>');
    
    // Replace [text](url) with <a href="$2" target="_blank" class="chat-link">$1</a>
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="chat-link">$1</a>');
    
    // Parse list items and add appropriate HTML breaks
    const lines = html.split('\n');
    const processedLines = lines.map((line, idx) => {
      let trimmed = line.trim();
      if (trimmed === '---') {
        return '';
      }
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        let content = trimmed.substring(2);
        return `<div class="bullet-item">🔹 ${content}</div>`;
      }
      
      // If it's a section header, we don't need a trailing <br> since it's a block element
      if (line.includes('class="chat-section-header"')) {
        return line;
      }
      
      // Don't append <br> if it's the last line and it's empty
      if (idx === lines.length - 1 && trimmed === '') {
        return '';
      }
      
      return line + '<br>';
    });
    
    html = processedLines.join('');
    
    // Cleanup extra HTML breaks around block elements to maintain single empty line spacing
    html = html.replace(/(<\/div>)\s*<br\s*\/?>/gi, '$1');
    html = html.replace(/<br\s*\/?>\s*(<div[^>]*>)/gi, '$1');
    html = html.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>'); // Collapse 3+ breaks to a single empty line (2 breaks)
    
    // Strip any remaining standalone asterisks *
    html = html.replace(/\*/g, '');
    
    return html;
  }

  function appendMessage(sender, text) {
    if (!chatMessagesLog) return;
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    
    let avatarSrc = 'assets/xiaoguang_logo.png';
    if (sender === 'sent') {
      avatarSrc = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'; // Mock parent avatar
    }

    const displayText = (sender === 'sent') ? text.replace(/\n/g, '<br>') : formatMarkdownToHTML(text);

    msgDiv.innerHTML = `
      <div class="message-avatar">
        <img src="${avatarSrc}" alt="${sender === 'sent' ? '家長' : '小光'}">
      </div>
      <div class="message-bubble">
        ${displayText}
      </div>
    `;

    chatMessagesLog.appendChild(msgDiv);
    chatMessagesLog.scrollTop = chatMessagesLog.scrollHeight;
  }

  // 在地知識庫資料 (chatKnowledgeBase) 已抽離至 knowledge-base.js，於 index.html 在本檔之前載入。

  function getAIResponse(userMessage) {
    let responseText = "抱歉，小光的資料庫中目前沒有此問題的解答。😢\n\n建議您於上班時間（週一至週五 08:00 - 16:00）致電本校總機電話：**(02) 3234-8654**，我們將有專人為您解答與服務喔！✿";
    
    // Sort keys by length descending to avoid short key matching long key prefixes (e.g. "6/2" matching "6/22")
    const sortedKeys = Object.keys(chatKnowledgeBase).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (userMessage.includes(key)) {
        responseText = chatKnowledgeBase[key];
        break;
      }
    }
    return responseText;
  }

  // --- Google Gemini API Async Response Handler ---
  async function generateAIResponse(userMessage) {
    const apiKey = localStorage.getItem('gemini_api_key');
    const startTime = Date.now();
    let responseText;

    if (!apiKey) {
      responseText = getAIResponse(userMessage);
    } else {
      try {
        const dynamicContext = [];
        const seenValues = new Set(); // 依「內容」去重，避免別名 key 指向同一段資料時重複餵入

        // 判斷是否為「每日菜單」這類日期 key（含數字且帶 月/日/「/」），這類只在使用者問到特定日期時才加入
        const isDateKey = (k) => /\d/.test(k) && (k.includes('月') || k.includes('日') || k.includes('/'));

        // 1. 一般主題：自動納入資料庫中所有非日期主題，確保新擴充的 Q&A 一定會餵給 Gemini
        for (const k in chatKnowledgeBase) {
          if (isDateKey(k)) continue;
          const value = chatKnowledgeBase[k];
          if (!value || seenValues.has(value)) continue;
          seenValues.add(value);
          dynamicContext.push(`[主題：${k}]\n${value}`);
        }

        // 2. 每日午餐菜單：僅在使用者問到日期時動態加入，避免上下文塞爆
        if (userMessage.includes('月') || userMessage.includes('/') || /\d+/.test(userMessage)) {
          for (const k in chatKnowledgeBase) {
            if (!isDateKey(k)) continue;
            const value = chatKnowledgeBase[k];
            if (!value || seenValues.has(value)) continue;
            if (userMessage.includes(k.replace('月', '').replace('日', '').trim())) {
              seenValues.add(value);
              dynamicContext.push(`[主題：${k} 午餐菜單]\n${value}`);
            }
          }
        }

        const kbContextString = dynamicContext.join('\n\n');

        const systemInstruction = `你是一位親切、活潑且熱心的 AI 助理，名叫「小光」，擔任新北市中和區光復國小 (Kuangfu Elementary School) 的 AI 智慧秘書。
你的主要任務是為家長、學生與訪客親切地解答關於學校事務的疑問。

請遵守以下規則：
1. 以下為光復國小官方已知資料庫（提供給你的事實背景）：
${kbContextString}

2. 對於使用者的疑問，若能從上述背景資料庫中找到對應的官方事實，請務必【優先且完全依據】資料庫事實進行回答（可進行人性化的口語修飾或條理化整理，但切勿編造與資料庫矛盾的事實）。
3. 如果使用者的問題與背景資料庫無關（例如：一般聊天、功課討論、一般常識），請以「小光」的親切口吻，使用你自身的 AI 知識庫進行回答。
4. 如果使用者的問題是有關光復國小的校務，但上述官方已知資料庫中【完全沒有】相關記錄，請你用自身的知識庫進行合理的通用回答，但在回答的最後必須親切地提醒：
   「小光提示：以上回答為 AI 智慧模式的通用說明。若需要學校官方的精確確認，請於上班時間（週一至週五 08:00 - 16:00）致電本校總機電話：(02) 3234-8654，將有專人為您服務喔！✿」
5. 回答請使用繁體中文，語氣保持禮貌、溫暖、活潑。可以用適當的表情符號（Emojis）。請保持排版乾淨美觀。`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: userMessage }]
            }],
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini API returned status ${response.status}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
          responseText = data.candidates[0].content.parts[0].text;
        } else {
          throw new Error("Invalid response format from Gemini API");
        }
      } catch (err) {
        console.warn("[Gemini API] Failed to fetch smart response (falling back to local DB):", err);
        responseText = getAIResponse(userMessage);
      }
    }

    // Ensure a minimum delay of 1000ms for natural feeling typing indicator
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < 1000) {
      await new Promise(resolve => setTimeout(resolve, 1000 - elapsedTime));
    }

    return responseText;
  }

  // --- AI Settings Toggle & LocalStorage Logic ---
  const btnChatSettings = document.getElementById('btn-chat-settings');
  const chatSettingsPanel = document.getElementById('chat-settings-panel');
  const inputGeminiApiKey = document.getElementById('gemini-api-key');
  const btnSaveKey = document.getElementById('btn-save-key');
  const btnClearKey = document.getElementById('btn-clear-key');
  const modeBadge = document.getElementById('chat-mode-badge');

  function updateModeBadge(hasKey) {
    if (!modeBadge) return;
    if (hasKey) {
      modeBadge.textContent = '✨ AI 智慧模式';
      modeBadge.style.backgroundColor = 'rgba(138, 75, 243, 0.15)';
      modeBadge.style.color = '#8a4bf3';
    } else {
      modeBadge.textContent = '在地知識庫模式';
      modeBadge.style.backgroundColor = '';
      modeBadge.style.color = '';
    }
  }

  // Toggle Settings Panel
  if (btnChatSettings && chatSettingsPanel) {
    btnChatSettings.addEventListener('click', () => {
      const isHidden = chatSettingsPanel.style.display === 'none';
      chatSettingsPanel.style.display = isHidden ? 'block' : 'none';
    });
  }

  // Load Saved API Key
  const savedKey = localStorage.getItem('gemini_api_key');
  if (savedKey) {
    if (inputGeminiApiKey) {
      inputGeminiApiKey.value = savedKey;
    }
    updateModeBadge(true);
  }

  // Save Key
  if (btnSaveKey && inputGeminiApiKey) {
    btnSaveKey.addEventListener('click', () => {
      const key = inputGeminiApiKey.value.trim();
      if (!key) {
        alert('請輸入有效的 Google Gemini API Key！');
        return;
      }
      localStorage.setItem('gemini_api_key', key);
      updateModeBadge(true);
      if (chatSettingsPanel) {
        chatSettingsPanel.style.display = 'none';
      }
      alert('🔑 Gemini API 金鑰已成功儲存，小光 AI 智慧模式已啟動！');
    });
  }

  // Clear Key
  if (btnClearKey) {
    btnClearKey.addEventListener('click', () => {
      localStorage.removeItem('gemini_api_key');
      if (inputGeminiApiKey) {
        inputGeminiApiKey.value = '';
      }
      updateModeBadge(false);
      if (chatSettingsPanel) {
        chatSettingsPanel.style.display = 'none';
      }
      alert('🧹 API 金鑰已清除，小光已恢復為在地知識庫模式。');
    });
  }

  function handleSendChat() {
    if (!chatInputBox) return;
    const text = chatInputBox.value.trim();
    if (!text) return;

    if (chatChipsContainer) {
      chatChipsContainer.style.display = 'none';
    }

    appendMessage('sent', text);
    chatInputBox.value = '';

    const typingMsgDiv = document.createElement('div');
    typingMsgDiv.classList.add('message', 'received');
    typingMsgDiv.setAttribute('id', 'temp-typing-indicator');
    typingMsgDiv.innerHTML = `
      <div class="message-avatar">
        <img src="assets/xiaoguang_logo.png" alt="小光">
      </div>
      <div class="message-bubble" style="display: flex; align-items: center; gap: 5px;">
        <span style="animation: pulse 1s infinite; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted);"></span>
        <span style="animation: pulse 1s infinite 0.2s; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted);"></span>
        <span style="animation: pulse 1s infinite 0.4s; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted);"></span>
      </div>
    `;
    chatMessagesLog.appendChild(typingMsgDiv);
    chatMessagesLog.scrollTop = chatMessagesLog.scrollHeight;

    generateAIResponse(text).then(response => {
      const tempIndicator = document.getElementById('temp-typing-indicator');
      if (tempIndicator) tempIndicator.remove();

      appendMessage('received', response);
      
      // Update statistics
      incrementStat('chat');
    }).catch(err => {
      const tempIndicator = document.getElementById('temp-typing-indicator');
      if (tempIndicator) tempIndicator.remove();
      appendMessage('received', getAIResponse(text));
    });
  }

  if (btnSendChat) {
    btnSendChat.addEventListener('click', handleSendChat);
  }
  if (chatInputBox) {
    chatInputBox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendChat();
      }
    });
  }

  // Handle Quick Reply Chips
  chatChips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (chatChipsContainer) {
        chatChipsContainer.style.display = 'none';
      }
      const questionText = chip.getAttribute('data-question');
      appendMessage('sent', questionText);

      const typingMsgDiv = document.createElement('div');
      typingMsgDiv.classList.add('message', 'received');
      typingMsgDiv.setAttribute('id', 'temp-typing-indicator');
      typingMsgDiv.innerHTML = `
        <div class="message-avatar">
          <img src="assets/xiaoguang_logo.png" alt="小光">
        </div>
        <div class="message-bubble" style="display: flex; align-items: center; gap: 5px;">
          <span style="animation: pulse 1s infinite; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted);"></span>
          <span style="animation: pulse 1s infinite 0.2s; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted);"></span>
          <span style="animation: pulse 1s infinite 0.4s; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted);"></span>
        </div>
      `;
      chatMessagesLog.appendChild(typingMsgDiv);
      chatMessagesLog.scrollTop = chatMessagesLog.scrollHeight;

      generateAIResponse(questionText).then(response => {
        const tempIndicator = document.getElementById('temp-typing-indicator');
        if (tempIndicator) tempIndicator.remove();

        appendMessage('received', response);

        // Update statistics
        incrementStat('chat');
      }).catch(err => {
        const tempIndicator = document.getElementById('temp-typing-indicator');
        if (tempIndicator) tempIndicator.remove();
        appendMessage('received', getAIResponse(questionText));
      });
    });
  });

  // Load and render latest news dynamically
  function loadLatestNews() {
    fetch('assets/latest_news.json')
      .then(response => response.json())
      .then(data => {
        console.log('[News] Successfully loaded latest news from JSON:', data);
        
        // 1. Update dashboard news list
        const newsListDiv = document.getElementById('dashboard-news-list');
        if (newsListDiv && data.announcements && data.announcements.length > 0) {
          newsListDiv.innerHTML = ''; // clear static items
          data.announcements.forEach((item, idx) => {
            const isWarning = idx === 0; // Highlight the first one
            const newsItem = document.createElement('div');
            newsItem.classList.add('news-item');
            if (isWarning) newsItem.classList.add('warning');
            
            newsItem.innerHTML = `
              <span class="news-title">📢 <a href="${item.url}" target="_blank" style="color: inherit; text-decoration: none;">${item.title}</a></span>
              <span class="news-date">${isWarning ? '最新' : '公告'}</span>
            `;
            newsListDiv.appendChild(newsItem);
          });
        }
        
        // 2. Update chatbot memory base dynamically
        if (data.announcements && data.announcements.length > 0) {
          let newsText = `🏆 **光復國小最新官方公告與師生榮譽榜！** 🎉\n\n小光幫您從學校官網同步了最新消息喔（更新時間：${data.last_updated}）：\n\n`;
          data.announcements.forEach((item, idx) => {
            newsText += `${idx + 1}. **[${item.title.substring(0, 35)}${item.title.length > 35 ? '...' : ''}]**\n   🔗 [點我查看官網詳細內容](&apos;${item.url}&apos;)\n\n`;
          });
          newsText += `歡迎點擊連結查看詳細公告喔！✿`;
          
          chatKnowledgeBase['最新'] = newsText;
          chatKnowledgeBase['新聞'] = newsText;
          chatKnowledgeBase['消息'] = newsText;
          chatKnowledgeBase['榮譽'] = newsText;
        }
      })
      .catch(err => {
        console.warn('[News] Failed to load latest_news.json (using default static news instead):', err);
      });
  }
  loadLatestNews();

  // Mobile Sidebar Hamburger Menu Toggle
  const btnHamburger = document.getElementById('btn-hamburger');
  const sidebar = document.querySelector('.sidebar');
  if (btnHamburger && sidebar) {
    // Create backdrop element dynamically
    const backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    sidebar.parentElement.appendChild(backdrop);

    btnHamburger.addEventListener('click', () => {
      sidebar.classList.add('active');
      backdrop.classList.add('active');
    });

    const closeSidebar = () => {
      sidebar.classList.remove('active');
      backdrop.classList.remove('active');
    };

    backdrop.addEventListener('click', closeSidebar);
    
    // Close sidebar when clicking any navigation link
    const navLinks = sidebar.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', closeSidebar);
    });
  }

});
