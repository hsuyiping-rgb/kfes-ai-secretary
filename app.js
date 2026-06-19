document.addEventListener('DOMContentLoaded', () => {

  // Initialize parent-focused statistics variables
  let totalLeavesGenerated = 86;
  let totalAdmissionsChecked = 142;
  let totalChatResponses = 3250;

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

  // Helper function to update stats on dashboard
  function updateDashboardStats() {
    document.getElementById('stat-leave-count').textContent = totalLeavesGenerated;
    document.getElementById('stat-admission-count').textContent = totalAdmissionsChecked;
    document.getElementById('stat-chat-count').textContent = totalChatResponses.toLocaleString();
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
        totalLeavesGenerated += 1;
        updateDashboardStats();
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
        totalAdmissionsChecked += 1;
        updateDashboardStats();
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

  // Parent/Visitor playful Q&A Database
  const chatKnowledgeBase = {
    '交通': `🚗 **如何前往光復國小？交通與導覽指南！** ✨

光復國小地址為：**新北市中和區光環路二段 1 號** 📍
學校鄰近板橋與中和交界處，您可以透過以下幾種方式前來喔：

1. 🚇 **搭乘捷運轉乘**：
   - **環狀線「中原站」**：最鄰近的捷運站！下車後步行約 15 分鐘即可抵達學校，或者在捷運站外租借 YouBike 騎乘前往，非常便利！🚲
   - **板南線「板橋站」、「新埔站」或「龍山寺站」**：出站後轉乘聯營公車即可抵達。
2. 🚌 **搭乘市區公車**：
   - **直達校門口（停靠「光復國小」站）**：搭乘 **藍 33**、**F512 (副線/免巴)** 即可直達校門口！
   - **鄰近站牌（「埔墘派出所」站）**：搭乘 **234**、**265**、**705** 至埔墘派出所站下車，沿光復街前行，步行約 5-8 分鐘即可到達。
   - **鄰近站牌（「長壽里」站）**：搭乘 **231**、**793**、**藍 31** 至長壽里站下車，沿三民路二段步行前往即可。
3. 🚗 **自行開車/騎乘機車**：
   - 可行經新北環河快速道路，由「光復街/環中路」匝道出口下，接光環路二段即可抵達。
   - 學校大門旁即為埔墘公園，設有地下停車場，周邊亦有路邊機車停車格，方便您停車！🅿️
4. 🚲 **YouBike 租借**：
   - 學校前方「埔墘公園」旁即設有 YouBike 站點，方便您騎乘往返鄰近捷運站。`,
    '鮮奶': `🍼 **新北鮮奶幸福週「幸福營養再+1」免費領取指南！** ✨

新北市政府自 **115 年 2 月 23 日起**實施此項貼心政策，讓幼學童週週都能免費補充營養：

1. 🎁 **領取資格與憑證**：
   - 👶 **2 歲至學齡前幼兒**：憑「**新北幸福卡**」。
   - 🎒 **國小部學童**：憑「**新北兒童卡**」。
2. 🏪 **可以領取的通路與地點**：
   - 您可以憑卡前往全台門市靠卡感應兌換（含離島）：
     - **四大超商**：7-ELEVEN、全家便利商店、萊爾富、OK超商。
     - **大連鎖超市**：全聯福利中心、美廉社、家樂福（部分超市門市）。
   - *備註：偏鄉地區學校若有特殊需求，會由校方直接安排乳品配送到校發放。*
3. 🥛 **免費兌換內容與週期**：
   - 每週可免費兌換 **1 瓶鮮奶** 或 **豆漿**（全聯另提供優酪乳選擇）。
   - **兌換週期**：每週一凌晨 0:00 至週日 23:59，當週未兌換額度無法累積至下週喔！
4. 💳 **卡片申辦與補發管道**：
   - **首次發放**：國小部學童於小一新生入學後，學校均會統一發放「新北兒童卡」。
   - **補發或新辦**：若因卡片遺失、毀損，或從外縣市轉學過來而沒有卡片：
     - 請家長（或書面委託代理人）攜帶學童與家長之**證明文件**，前往新北市**任一區公所**臨櫃辦理申辦。
5. 🔗 **相關資源連結**：
   - 🌐 [新北鮮奶幸福週官方網站](https://milk.ntpc.edu.tw/module/ticket-welcome-ntpc/module/ticket-welcome-ntpc/ap/home)
   - 🎥 [新北兒童卡/幸福卡申請流程影片 🎬](https://www.youtube.com/watch?v=PPtBziJ7H6c)
   - 🎥 [鮮奶幸福週－市長政策宣導影片 🎬](https://www.youtube.com/watch?v=i-h2J30gtPU)`,
    '校長': `🎓 **認識我們親切的領航者——許以平校長（平平校長）！** ✨

許以平校長現任本校（新北市中和區光復國小）校長（113學年度迄今），以教育為終身志業，深耕台灣國民小學教育超過三十年。

1. 🎓 **學術與教育背景**：
   - **最高學歷**：市立台北大學教育系博士（課程組）。
   - **教育資歷**：擁有 **30 年以上**教育年資，歷任 **3 所學校**校長。
   - **專業職務**：現任「學習共同體輔導團」、「STEAM 跨域輔導團」及「國小自然科輔導團」之諮詢委員與召集人。
2. 💡 **核心辦學理念**：
   - **核心精神**：「**差異，是學習最大的資源**」。
   - **幸福課堂四密碼**：長期實踐佐藤學「學習共同體」理念，在校園中建立 **安心、信賴、互惠、共學** 的課堂氛圍。
   - **辦學核心引擎**：倡導「**知－行－思**」以及「**傾聽、串聯、回歸**」的共學循環，點亮每個孩子的生命亮點。
3. 📝 **教育書寫與社群分享**：
   - 校長熱愛寫作與教學反思，透過兩個個人部落格與全台教育夥伴共同探索與分享：
     - ✍️ [北極星的課堂風景部落格 ↗](https://siespolaris.blogspot.com/)：記錄觀課心得與教學反思。
     - ✍️ [平平的教育發想部落格 ↗](https://siesyiping.blogspot.com/)：探討競賽文化、課堂變革與教育本質。
     - 💬 [北極星工作坊 Facebook 社群 ↗](https://www.facebook.com/groups/1512655142349793/)。
4. ✉️ **校長聯絡信箱**：
   - 若您有任何教育想法或校務建議，歡迎來信交流：[hsuyiping@apps.ntpc.edu.tw](mailto:hsuyiping@apps.ntpc.edu.tw)
5. 🔗 **個人官方網站**：
   - 歡迎造訪 [平平校長的知－行－思官方網站 🌐](https://teaching-3b748.web.app/index.html) 深入了解校長的教育歷程與辦學故事！`,
    '請假': `🤒 **小光的學生請假超簡單指南！** ✨

別擔心！小朋友身體不舒服或有事情，請按照下面步驟跟學校請假喔：
1. **當天短期請假（事假/病假）**：請爸爸媽媽在**早上 08:30 以前**，撥打本校學生請假專線 **(02) 8227-6913**，或直接上學校官網的「線上請假系統」登記就可以囉！超方便的！🎒
2. **請假長達 3 天（含）以上**：這需要寫紙本請假單喔！請先跟導師拿單子填寫，然後送給教導主任跟校長蓋章就完成了！📝
3. **病假證明**：病假看醫生回學校後，要在 3 天內把看診收據或診斷證明交給老師銷假喔！祝小朋友早日康復！`,
    '冷氣': `❄️ **班級涼爽冷氣開放小叮嚀！** ✿

炎炎夏日，讓我們一起吹冷氣上課吧！但也要記得愛地球喔：
1. **冷氣開放標準**：當教室溫度達到 **28℃ 以上**，或者外面空氣品質不好、教室悶悶的時候，老師跟值日生就可以打開冷氣啦！風扇也要一起開更涼快喔！💨
2. **冷氣卡與遙控器**：卡片跟遙控器都在導師那邊！如果卡片裡面的錢用完了，班級可以一起收冷氣費，派代表去總務處出納組儲值，冷氣官方就會繼續運作啦！卡片要好好保管喔！💳
3. **節約能源超重要**：如果大家要離開教室超過 30 分鐘（像是去體育課、電腦課），一定要記得把冷氣關掉！我們都是省電小達人！🌿`,
    '認識': `🏫 **認識我們美麗的——新北市中和區光復國小** ✨

小光帶您一起探索光復國小的建校歷史、基本資料，以及豐富有趣的特色社團與專屬課程喔！✿

---

### 📌 一、 學校基本資料
*   **學校全銜**：新北市中和區光復國民小學 (New Taipei City Kuangfu Elementary School)
*   **學校校址**：新北市中和區光環路二段 1 號 📍
*   **核心理念（願景）**：以「**光復心 • 人文情 • 勤學習 • 能力行**」為宗旨，帶領學童適性適所、快樂成長。
*   **班級學制**：除普通班級外，設有光譜班（特教資源班）、聽障巡迴輔導班，以及深具口碑的「光復附幼」幼兒園。👶

---

### 📜 二、 創校歷史與背景
*   **創校宗旨**：本校的成立是為了解決鄰近板橋區「埔墘國小」及「海山國小」學生過多、增長壓力過大的飽和問題。
*   **創校歷程**：自民國 77 年起展開規劃與籌備，前後歷經十年心血，於**民國 87 年（1998 年）**正式招生，是當時少數歷經「十年磨一劍」精心籌建的優質新設小學。

---

### 🔠 三、 學校特色課程與教學亮點
*   **🌍 國際教育與雙語推動**：
    - 作為新北市國際交流重點學校，我們與美國、韓國、馬來西亞等多國學校締結合作。
    - 特別是與美國優秀的**英華學院 (Yinghua Academy)** 簽訂為姊妹校，並與美國百老匯小學開展筆友信件往來，提供多元的跨國線上文化交流，國際視野滿分！
*   **🌱 四季食農生命教育**：
    - 學校設有特色「**日光農場**」，落實「春青蔥、夏艾草、秋地瓜、冬蘿蔔」的四季種植體驗課程，引領學童親自農務，與大自然及土地建立深厚情感。
*   **♻️ SDGs 永續議題融入**：
    - 結合聯合國永續目標，將環境保育、氣候變遷與社會關懷等主題融入跨領域課程，課程方案曾榮獲全國國際教育特優肯定！
    - 攜手家樂福文教基金會舉辦「i家超人」闖關活動，推動愛惜食物與環境永續教育。

---

### 🎺 四、 多元展能特色社團與校隊
*   **🎷 光復管樂團**：
    - 成立已逾 25 年的指標型音樂性校隊，在全國音樂比賽中多次榮獲「特優」佳績，更曾遠赴韓國「濟州國際管樂節」勇奪金牌獎！
*   **⚔️ 傳承禮儀的劍道隊**：
    - 本校發展多年的特色體育團隊，不僅訓練體能與防身，更重視「知禮守儀」與「練心」，培養學子專注、獨立與正向心態。
*   **💃 活力舞蹈團與科學探索社團**：
    - 兼顧動靜態發展，透過肢體開發舞蹈團及多元科學探索社團，讓孩子們發揮個人興趣，展現獨特光芒！
*   **⚜️ 幼童軍**：
    - 培育孩子們的合作精神、生活自理與探索自然的熱情，透過多樣化的徽章活動學習戶外技能與日行一善的服務精神！
*   **🏓 桌球隊 & 🏀 籃球隊**：
    - 學校重點發展的運動校隊，著重基礎體能、戰術配合與運動家風範，在各項校際與市級比賽中屢獲佳績，展現滿滿活力！
*   **🎵 直笛團 & 🎤 合唱團**：
    - 用悠揚美妙的笛聲與歌聲溫暖校園，不僅在音樂比賽中表現亮眼，也是學校各項慶典活動中最具氣質的迎賓亮點！
*   **🧮 珠心算社**：
    - 透過雙手與心算訓練學童的專注力、邏輯思維與快速計算能力，為數學素養奠定扎實的基礎！`,
    '最新': `🏆 **光復國小超狂榮譽榜！快來為得獎師生拍拍手！** 🎉

我們光復的小程序跟老師真的太強了，快來看看最近有什麼好消息：
1. **英語讀者劇場大捷**：恭喜我們 **510 班**的小朋友，在新北市 114 學年度英語讀者劇場市賽中榮獲**佳作**！指導老師們太棒了！🎭
2. **本土語文認證過關**：恭喜 **404 班藍厚雅同學**順利通過**泰雅族語原住民語初級認證**！這真的不容易耶！也超級感謝原住民語王永雄老師不辭辛勞的指導與陪伴喔！✿
3. **田徑隊飛奔奪金**：恭喜我們的田徑小將與 **603 班**，在「新北市雙和分區 114 學年度國小田徑交流賽」中拿下亮眼佳績！跑得像風一樣快！🏃‍♂️
4. **小畫家登報啦**：恭喜 **206 班曾昱旻同學**！他的超棒畫作被刊登在《國語日報週刊》（115年3月23日版面），全校師生都為你感到驕傲！🎨
5. **食育永續大闖關**：我們跟家樂福文教基金會合辦了「i家超人」食育永續活動，1500名學童熱情參與，超好玩！
6. 歡迎大家多去「新生報到區」、「親師生平台」或「卓越光復」專區看看，發現更多精彩的光復故事喔！✨`,
    '處室': `🏢 **認識我們的光復行政處室！隨時為您服務喔！** ✿

學校的運作背後有許多默默努力的處室喔，小光幫您做個熱情介紹：
1. **教務處**：管教學、課表、註冊與成績，教科書版本管理還有最受歡迎的「新生入學報到專區」都在這！🎒
2. **學務處**：照顧大家的課外生活，負責體育、衛生保健、生活秩序，每年最嗨的「運動會專區」也是這裡主辦的喔！🏃‍♂️
3. **總務處**：學校設備的守護神！管校園修繕、出納儲值、還有熱騰騰的「午餐資訊專區」！🔧
4. **輔導室**：大家的心靈避風港，提供輔導諮商、資源班服務、還有「親師交流道」（出刊精美的輔導刊物喔！）。💖
5. **光復附設幼稚園**：提供最安全、最好玩的學前幼兒教育！👶`,
    '報修': `🔧 **班級設備故障報修流程**：

若教室的冷氣、投影機、課桌椅、電燈等設備損壞，請家長告知導師後，由學校老師或學童至「總務修繕申報系統」登錄，總務處庶務組會於 2 日內派工修繕。若有緊急漏水狀況，請直接聯絡導師回報總務處！`,
    '幼兒園': `👶 **歡迎光臨光復附設幼兒園！給寶貝最溫暖的童年！** ✨

我們幼兒園有超多有趣的主題課程跟豐富的玩樂設備，是一個讓寶貝天天都想上學的快樂天地：
- **幼兒園GoogleSites官方專網**：[點我造訪光復附幼網頁](https://sites.google.com/view/kfeskid) ✿
- 如果爸爸媽媽想要查詢最新招生資訊、每日作息表或是看看寶貝們精采的活動相片，都可以點擊上面連結查詢喔！有任何問題也歡迎拿起電話直接撥打幼兒園專線諮詢喔！🎒`,
    '平台': `🔗 **親師必備！光復國小超實用數位平台傳送門！** ✨

手指點一點，親校通訊沒煩惱！小光幫您整理好最常使用的系統連結囉：
*   [新北市親師生平台](https://pts.ntpc.edu.tw/) ✿：家長與學生的多元學習、電子聯絡簿與出缺席查詢！
*   [新北市校務行政系統 (ESA)](https://esa.ntpc.edu.tw/) 🎒：查詢學期成績與出缺席！
*   [光復附幼Google專頁](https://sites.google.com/view/kfeskid) 👶：幼兒園招生與作息照！
*   [學校學期行事曆 PDF](https://www.kfes.ntpc.edu.tw/var/file/0/1000/img/134/499756158.pdf) 📅：掌握考試日程與學校重大活動！`,
    '轉學': `🔄 **學生轉學（轉入與轉出）辦理程序** ✿

家長您好！為孩子辦理光復國小的轉出或轉入手續，請參閱以下說明：

1. **辦理轉入（轉入本校）**：
   - **學區確認**：遷妥戶籍後，確認戶籍地位於本校學區內。
   - **原校手續**：先向原就讀學校辦理「轉出」，取得「轉出證明書」。
   - **來校辦理**：攜帶**新遷妥之戶口名簿正本與影本各1份、原校轉出證明書、辦理家長之身分證與印章**，親至本校教務處註冊組辦理。
2. **辦理轉出（自本校轉出）**：
   - 轉出前 3 天請口頭或透過聯絡簿告知班級導師。
   - 攜帶**已遷入新學籍之新戶口名簿正本、家長雙方身分證與印章**，至教務處註冊組辦理。辦妥後取得「轉出證明書」，並於 3 日內前往新學校註冊組辦理轉入。
3. **聯絡窗口**：教務處註冊組專線：**(02) 3234-8654 分機 121**。`,
    '報到': `🎒 **115 學年度小一新生線上與現場報到指引** ✨

家長您好！歡迎寶貝成為光復的一員，以下是報到重要日程與攜帶資料：

1. **報到對象**：民國 108 年 9 月 2 日至 109 年 9 月 1 日出生之適齡學童。
2. **線上報到**：每年 5 月中旬（依新北市政府教育局公告日期為準），請至「新北市新生線上報到系統」進行登記，省時又方便！
3. **現場報到**：若無法使用線上系統，可於 5 月中旬週六上午 09:00 - 12:00 親至學校現場辦理。
4. **現場報到應備文件**：
   - 新生入學通知單（請先填妥基本資料）。
   - 戶口名簿正本與影本各 1 份（戶籍須在本校學區）。
   - 家長雙方身分證、印章。
   - 預防接種時程卡（黃卡）影本。
   - 特殊身分證明文件（如低收、身障證明等，如無則免）。
5. **學區範圍**：新北市中和區光復里、內南里、外南里（部分鄰）、力行里（部分鄰）等，詳細里鄰劃分請查閱教務處最新公告。
6. **聯絡窗口**：教務處註冊組：**(02) 3234-8654 分機 121**。`,
    '招生': `👶 **光復國小附設幼兒園招生報名資訊** ✿

歡迎可愛的寶貝加入光復附幼大家庭！招生重點如下：

1. **招生日程**：每年 5 月上旬公告招生簡章，5 月下旬至 6 月初進行線上登記報名（新北市公立幼兒園招生系統）。
2. **招生對象**：滿 3 歲至入國民小學前之適齡幼兒。
3. **優先入園**：身心障礙幼兒、低收/中低收入戶幼兒、原住民、特殊境遇家庭子女，及本校教職員工子女、育有三胎以上家庭幼兒等享有優先資格。
4. **官方專網**：詳情請訪問 [光復附設幼兒園官方專網](https://sites.google.com/view/kfeskid)。
5. **聯絡窗口**：幼兒園主任分機 **265**、幼教中心主任分機 **170**，歡迎於上班時間致電：**(02) 3234-8654**。`,
    '場地': `🏫 **光復國小校園場地租借（借用）申請細則** ❄️

本校為推廣終身學習、回饋社區，於不影響教學及校務活動的前提下，開放場地供各界租借，相關規範如下：

1. **開放租借場地**：演藝廳、第一會議室、第二會議室（含木質地板區）、一樓開放空間、B1樂活區、操場、教室、體育館及晨光廣場等。
2. **開放時間**：
   - **平日（上課日/上班日）**：上午 06:00 - 07:00、下午 18:00 - 21:00（下午 16:00 - 18:00 為部分開放）。
   - **週末（週六/週日）**：上午 06:00 - 下午 18:00。
   - **寒暑假**：上午 06:00 - 07:00、下午 16:00 - 21:00。
   - *國定假日暫停租借。*
3. **申請流程**：
   - **提出申請**：請於預計使用日前 **10 天**，填寫「校園場地使用申請表」，檢附活動計畫書送至本校**總務處**審核。
   - **簽署合約**：審核通過後，簽署「場地開放借用承諾書」及「切結書」。
   - **繳納規費**：於使用日 **1 週前** 繳清場地維護規費與保證金。
4. **注意事項**：
   - 借用場地不可舉辦婚喪喜慶宴席或任何商業性營利活動。
   - 使用完畢應將場地清潔並復原，如有損壞需照價賠償。
5. **承辦處室**：總務處事務組（聯絡電話：**(02) 3234-8654 分機 661** 或 **分機 665**）。`,
    '電話': `📞 **光復國小常用處室與聯絡電話分機表** ✨

為了方便家長快速聯絡，小光為您整理了學校最重要的電話與分機表喔：

*   **學校總機專線**：**(02) 3234-8654**
*   **學校傳真號碼**：(02) 3234-8663
*   **學生請假專線**：**(02) 8227-6913** (請於早上 08:30 前完成請假登記喔！)

**🏫 行政處室主任分機**：
*   校長室：188 | 教務主任：120 | 學務主任：130 | 總務主任：666 | 輔導主任：150 | 人事主任：118 | 會計主任：117 | 幼兒園主任：265 | 雙語主任：888

**🎒 各處室組別分機**：
*   **教務處**：註冊組 **121** (負責新生報到、學生轉學、學籍與成績查詢) | 課研組 122 | 教學組 123 | 資訊組 124
*   **學務處**：生教組 131 | 活動組 132 | 衛生組 133 | 體育組 134 | 午餐秘書 137 | 健康中心 119
*   **總務處**：事務組 **661** (負責校園修繕與場地租借) | 出納組 662 | 文書組 663 | 幹事 665
*   **輔導室**：輔導組 151 | 特教組 152 | 資料組 153
*   **附屬單位**：幼教中心 170 | 圖書館 232 | 警衛室 198/199`,
    '教科書': `📚 **光復國小 114 學年度最新教科書版本一覽表** ✨

家長您好！為您整理本學年度（含上、下學期）各年級各學科的教科書選用版本：

*   **📘 國語文**：
    - 一至六年級皆採用 **康軒版**
*   **📐 數學**：
    - 一、三、四、六年級：**南一版**
    - 二、五年級：**翰林版**
*   **🌱 生活課程 (低年級)**：
    - 一年級：**翰林版** | 二年級：**康軒版**
*   **🔬 自然科學 (中高年級)**：
    - 三、四年級：**康軒版** | 五年級：**南一版** | 六年級：**翰林版**
*   **🗺️ 社會 (中高年級)**：
    - 三、五年級：**翰林版** | 四、六年級：**康軒版**
*   **🔤 英語 (中高年級)**：
    - 三、五年級：**翰林版** | 四、六年級：**康軒版**
*   **🎨 藝術 (中高年級)**：
    - 三至六年級皆採用 **康軒版**
*   **🤸 健康與體育**：
    - 一、三、四、六年級：**翰林版** | 二、五年級：**南一版**
*   **🤝 綜合活動 (中高年級)**：
    - 三、四、六年級：**康軒版** | 五年級：**南一版**
*   **🗣️ 本土語文 (閩南語)**：
    - 採用 **康軒版**

例如：若您想查詢**一年級國語**，本校採用的是 **康軒版** 喔！如果有轉學準備需要買書，可以參考以上版本。✿`,
    '一年一班': `🏫 **光復國小班級教室位置指引！** ✨

您詢問的 **一年一班（1年1班）** 教室地點是在：
*   **所在大樓**：**黃蝶樓 1 樓** ✿
*   **聯絡分機**：**101**

**🌈 光復國小彩虹校舍配置簡介：**
我們光復國小的七棟校舍是以「彩虹」命名，象徵帶領孩子們跨越虹橋喔：
1. 🔴 **紅楓樓**：行政處室與普通教室
2. 🟠 **澄陽樓** (或稱橙陽樓)：普通教室
3. 🟡 **黃蝶樓**：低年級教室（一年一班就在這裡喔！）
4. 🟢 **綠水樓**：中高年級教室
5. 🔵 **藍天樓**：中高年級教室
6. 🟣 **靛海樓** 與 **紫霞樓**：專科教室與活動空間

如果您想查詢其他班級位置或需要詳細的校園平面圖，歡迎在上班時間（週一至週五 08:00 - 16:00）致電學校總機：**(02) 3234-8654**，我們將有專人為您解答喔！`
  };

  chatKnowledgeBase['願景'] = chatKnowledgeBase['認識'];
  chatKnowledgeBase['介紹'] = chatKnowledgeBase['認識'];
  chatKnowledgeBase['特色'] = chatKnowledgeBase['認識'];
  chatKnowledgeBase['校訓'] = chatKnowledgeBase['認識'];
  chatKnowledgeBase['校長'] = chatKnowledgeBase['校長'];
  chatKnowledgeBase['現任校長'] = chatKnowledgeBase['校長'];
  chatKnowledgeBase['許以平'] = chatKnowledgeBase['校長'];
  chatKnowledgeBase['平平校長'] = chatKnowledgeBase['校長'];
  chatKnowledgeBase['校長是誰'] = chatKnowledgeBase['校長'];
  chatKnowledgeBase['校長介紹'] = chatKnowledgeBase['校長'];
  chatKnowledgeBase['認識校長'] = chatKnowledgeBase['校長'];
  chatKnowledgeBase['榮譽'] = chatKnowledgeBase['最新'];
  chatKnowledgeBase['新聞'] = chatKnowledgeBase['最新'];
  chatKnowledgeBase['消息'] = chatKnowledgeBase['最新'];
  chatKnowledgeBase['榮譽'] = chatKnowledgeBase['最新'];
  chatKnowledgeBase['教務'] = chatKnowledgeBase['處室'];
  chatKnowledgeBase['學務'] = chatKnowledgeBase['處室'];
  chatKnowledgeBase['總務'] = chatKnowledgeBase['處室'];
  chatKnowledgeBase['輔導'] = chatKnowledgeBase['處室'];
  chatKnowledgeBase['附幼'] = chatKnowledgeBase['幼兒園'];
  chatKnowledgeBase['幼稚園'] = chatKnowledgeBase['幼兒園'];
  chatKnowledgeBase['系統'] = chatKnowledgeBase['平台'];
  chatKnowledgeBase['連結'] = chatKnowledgeBase['平台'];
  chatKnowledgeBase['轉入'] = chatKnowledgeBase['轉學'];
  chatKnowledgeBase['轉出'] = chatKnowledgeBase['轉學'];
  chatKnowledgeBase['新生'] = chatKnowledgeBase['報到'];
  chatKnowledgeBase['入學'] = chatKnowledgeBase['報到'];
  chatKnowledgeBase['小一'] = chatKnowledgeBase['報到'];
  chatKnowledgeBase['幼稚園招生'] = chatKnowledgeBase['招生'];
  chatKnowledgeBase['幼兒園招生'] = chatKnowledgeBase['招生'];
  chatKnowledgeBase['租借'] = chatKnowledgeBase['場地'];
  chatKnowledgeBase['借用'] = chatKnowledgeBase['場地'];
  chatKnowledgeBase['分機'] = chatKnowledgeBase['電話'];
  chatKnowledgeBase['聯絡'] = chatKnowledgeBase['電話'];
  chatKnowledgeBase['信箱'] = chatKnowledgeBase['電話'];
  chatKnowledgeBase['版本'] = chatKnowledgeBase['教科書'];
  chatKnowledgeBase['書本'] = chatKnowledgeBase['教科書'];
  chatKnowledgeBase['課本'] = chatKnowledgeBase['教科書'];
  chatKnowledgeBase['轉入'] = chatKnowledgeBase['轉學'];
  chatKnowledgeBase['轉出'] = chatKnowledgeBase['轉學'];
  chatKnowledgeBase['新生'] = chatKnowledgeBase['報到'];
  chatKnowledgeBase['入學'] = chatKnowledgeBase['報到'];
  chatKnowledgeBase['小一'] = chatKnowledgeBase['報到'];
  chatKnowledgeBase['幼稚園招生'] = chatKnowledgeBase['招生'];
  chatKnowledgeBase['幼兒園招生'] = chatKnowledgeBase['招生'];
  chatKnowledgeBase['租借'] = chatKnowledgeBase['場地'];
  chatKnowledgeBase['借用'] = chatKnowledgeBase['場地'];
  chatKnowledgeBase['分機'] = chatKnowledgeBase['電話'];
  chatKnowledgeBase['聯絡'] = chatKnowledgeBase['電話'];
  chatKnowledgeBase['信箱'] = chatKnowledgeBase['電話'];

  // 一年一班與平面圖相關別名
  chatKnowledgeBase['1年1班'] = chatKnowledgeBase['一年一班'];
  chatKnowledgeBase['一年1班'] = chatKnowledgeBase['一年一班'];
  chatKnowledgeBase['教室位置'] = chatKnowledgeBase['一年一班'];
  chatKnowledgeBase['平面圖'] = chatKnowledgeBase['一年一班'];
  chatKnowledgeBase['校園平面圖'] = chatKnowledgeBase['一年一班'];
  chatKnowledgeBase['地圖'] = chatKnowledgeBase['一年一班'];
  chatKnowledgeBase['位置'] = chatKnowledgeBase['一年一班'];

  // 交通導覽相關別名
  chatKnowledgeBase['到校'] = chatKnowledgeBase['交通'];
  chatKnowledgeBase['怎麼去'] = chatKnowledgeBase['交通'];
  chatKnowledgeBase['捷運'] = chatKnowledgeBase['交通'];
  chatKnowledgeBase['公車'] = chatKnowledgeBase['交通'];
  chatKnowledgeBase['地址'] = chatKnowledgeBase['交通'];
  chatKnowledgeBase['開車'] = chatKnowledgeBase['交通'];
  chatKnowledgeBase['停車'] = chatKnowledgeBase['交通'];
  chatKnowledgeBase['怎麼走'] = chatKnowledgeBase['交通'];
  chatKnowledgeBase['交通導覽'] = chatKnowledgeBase['交通'];
  chatKnowledgeBase['交通指南'] = chatKnowledgeBase['交通'];
  chatKnowledgeBase['如何到'] = chatKnowledgeBase['交通'];
  chatKnowledgeBase['怎麼到'] = chatKnowledgeBase['交通'];
  chatKnowledgeBase['如何去'] = chatKnowledgeBase['交通'];
  chatKnowledgeBase['去光復'] = chatKnowledgeBase['交通'];
  chatKnowledgeBase['到光復'] = chatKnowledgeBase['交通'];
  chatKnowledgeBase['如何前往'] = chatKnowledgeBase['交通'];
  chatKnowledgeBase['前往'] = chatKnowledgeBase['交通'];

  // 鮮奶領取相關別名
  chatKnowledgeBase['領取鮮奶'] = chatKnowledgeBase['鮮奶'];
  chatKnowledgeBase['兒童卡'] = chatKnowledgeBase['鮮奶'];
  chatKnowledgeBase['幸福卡'] = chatKnowledgeBase['鮮奶'];
  chatKnowledgeBase['鮮奶幸福週'] = chatKnowledgeBase['鮮奶'];
  chatKnowledgeBase['領鮮奶'] = chatKnowledgeBase['鮮奶'];
  chatKnowledgeBase['兌換鮮奶'] = chatKnowledgeBase['鮮奶'];
  chatKnowledgeBase['兌換鮮奶或豆漿'] = chatKnowledgeBase['鮮奶'];
  chatKnowledgeBase['新北兒童卡'] = chatKnowledgeBase['鮮奶'];
  chatKnowledgeBase['新北幸福卡'] = chatKnowledgeBase['鮮奶'];
  chatKnowledgeBase['幸福營養'] = chatKnowledgeBase['鮮奶'];
  chatKnowledgeBase['免費鮮奶'] = chatKnowledgeBase['鮮奶'];
  chatKnowledgeBase['領牛奶'] = chatKnowledgeBase['鮮奶'];
  chatKnowledgeBase['免費牛奶'] = chatKnowledgeBase['鮮奶'];
  chatKnowledgeBase['豆漿'] = chatKnowledgeBase['鮮奶'];
  chatKnowledgeBase['領豆漿'] = chatKnowledgeBase['鮮奶'];
  chatKnowledgeBase['牛奶'] = chatKnowledgeBase['鮮奶'];


  // === 學生午餐菜單資料庫 ===
  chatKnowledgeBase['6月1日'] = `📅 **115年6月1日 (一) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：糙米飯 (白米、糙米)\n• 主菜：紅蔥豬排X1 (豬排X1 滷)\n• 副菜：什錦羹 (筍、風味羹、紅蘿蔔 煮)\n• 蔬菜：蝦香高麗 (高麗菜、蝦皮 炒) 【履歷 (青菜)】\n• 湯品：味噌湯 (豆腐、味噌)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：白飯 (白米)\n• 主菜：古早味豬排 (豬排(X1)-滷)\n• 副菜：柴香油豆腐 (油豆腐、柴魚-煮)\n• 蔬菜：白菜滷 (大白菜、紅蘿蔔-煮) 【產銷 (履歷)】\n• 湯品：冬瓜雞湯 (冬瓜、雞骨)\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：白飯 (白米)\n• 主菜：清蒸素魚排X1 (素魚排(X1)-蒸)\n• 副菜一：番茄肉醬 (豆干、番茄、素絞肉、毛豆仁-煮)\n• 副菜二：芝麻海根 (海根、紅蘿蔔、芝麻-)\n• 副菜三：醬拌秋葵 (煮 秋葵-煮)\n• 青菜：寧波年糕 (年糕、青菜、時蔬、素肉絲-煮) 【產銷履歷】\n• 湯品：青木瓜湯 (青木瓜、白木耳)\n`;
  chatKnowledgeBase['六月1日'] = chatKnowledgeBase['6月1日'];
  chatKnowledgeBase['6/1'] = chatKnowledgeBase['6月1日'];
  chatKnowledgeBase['6月2日'] = `📅 **115年6月2日 (二) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：紫米飯 (白米、紫米)\n• 主菜：雪菜豆腐 (豆腐、雪菜、香菇 煮)\n• 副菜：蒸蛋蛋.時蔬 蒸\n• 蔬菜：砂鍋粉絲 (冬粉、白菜 煮) 【履歷 (青菜)】\n• 湯品：巧達濃湯 (洋芋、南瓜)\n• 附餐：豆 (奶)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：紫米飯 (白米、紫米)\n• 主菜：醬蒸豆包 (豆包、毛豆-蒸)\n• 副菜：海帶芽炒蛋 (雞蛋、洋蔥、海帶芽-炒)\n• 蔬菜：彩椒花椰菜 (花椰菜、彩椒-炒) 【有機 (蔬菜)】\n• 湯品：南瓜濃湯 (南瓜、紅蘿蔔)\n• 附餐：豆奶\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：香菇油飯 (白米、糯米、麵輪、香菇)\n• 主菜：薑汁凍豆腐 (凍豆腐、金針菇-煮)\n• 副菜一：銀耳南瓜 (南瓜、白木耳-煮)\n• 副菜二：田園高麗 (高麗菜、時蔬-煮)\n• 副菜三：素蒸餃X2 (素蒸餃(X2)-蒸)\n• 青菜：乾煸菜豆 (菜豆、時蔬-炒) 【有機蔬菜】\n• 湯品：素肉骨茶湯 (時蔬、紅蘿蔔、菇)\n• 附餐：豆奶\n`;
  chatKnowledgeBase['六月2日'] = chatKnowledgeBase['6月2日'];
  chatKnowledgeBase['6/2'] = chatKnowledgeBase['6月2日'];
  chatKnowledgeBase['6月3日'] = `📅 **115年6月3日 (三) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：胚芽飯 (白米、胚芽)\n• 主菜：花生豬腳 (豬肉、豬腳、花生 滷)\n• 副菜：玉米炒蛋 (玉米、蛋 炒)\n• 蔬菜：鐵板豆芽 (豆芽菜、韭菜、煮) 【履歷 (青菜)】\n• 湯品：海帶雞湯 (海帶、雞肉、雞骨架)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：白飯 (白米)\n• 主菜：焢肉排 (焢肉排(X1)-滷)\n• 副菜：玉米干丁 (玉米、豆干、毛豆-炒)\n• 蔬菜：滷海帶結 (海帶結、紅蘿蔔-滷) 【產銷 (履歷)】\n• 湯品：味噌蛋花湯 (雞蛋、柴魚、味噌)\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：白飯 (白米)\n• 主菜：彩繪香竹捲 (香竹捲、時蔬、紅椒-煮)\n• 副菜一：醬炒素肚 (素肚、榨菜、時蔬-炒)\n• 副菜二：清燉蘿蔔 (白蘿蔔、紅蘿蔔、時蔬-)\n• 副菜三：洛神花藕片 (煮 蓮藕、洛神花、白芝麻-煮)\n• 青菜：小瓜鮑菇 (小黃瓜、鮑菇、-煮) 【產銷履歷】\n• 湯品：黃豆芽湯 (黃豆芽、時蔬)\n`;
  chatKnowledgeBase['六月3日'] = chatKnowledgeBase['6月3日'];
  chatKnowledgeBase['6/3'] = chatKnowledgeBase['6月3日'];
  chatKnowledgeBase['6月4日'] = `📅 **115年6月4日 (四) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：櫻花蝦 (炒飯)\n• 主菜：雞排X1 (雞排X1 燒)\n• 副菜：薯餅X2 (薯餅X2 烤)\n• 蔬菜：木耳四季 (條豆、木耳 煮) 【履歷 (青菜)】\n• 湯品：糯米排骨湯 (洋芋、糯米、大骨)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：五穀飯 (白米、五穀米)\n• 主菜：安東燉雞 (雞肉、寬冬粉、馬鈴薯、芝麻-煮)\n• 副菜：高麗菜拌肉 (高麗菜、豬肉-炒)\n• 蔬菜：藥膳蘿蔔 (白蘿蔔、枸杞、肉骨茶-煮) 【產銷 (履歷)】\n• 湯品：關東煮湯 (油豆腐、玉米)\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：五穀飯 (白米、五穀米)\n• 主菜：玉米豆腐 (豆腐、玉米-煮)\n• 副菜一：糯米椒炒干片 (豆干、糯米椒-炒)\n• 副菜二：紅仁絲瓜 (絲瓜、紅蘿蔔-煮)\n• 副菜三：烤地瓜塊 (地瓜切塊-烤)\n• 青菜：薑絲紅鳳菜 (紅鳳菜-煮) 【產銷履歷】\n• 湯品：黃瓜鮮蔬湯 (大黃瓜、時蔬)\n`;
  chatKnowledgeBase['六月4日'] = chatKnowledgeBase['6月4日'];
  chatKnowledgeBase['6/4'] = chatKnowledgeBase['6月4日'];
  chatKnowledgeBase['6月5日'] = `📅 **115年6月5日 (五) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：燕麥飯 (白米、燕麥)\n• 主菜：★炸海鮮排X1 (海鮮排X1 炸)\n• 副菜：蘑菇薯塊燉雞 (洋芋、雞肉、菇 煮)\n• 蔬菜：脆炒海絲 (海帶絲、紅蘿蔔 炒) 【履歷 (青菜)】\n• 湯品：芹香蘿蔔湯 (蘿蔔、芹)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：海南雞絲飯 (白米、時蔬、雞肉)\n• 主菜：柚子豬排 (豬排(X1)-烤)\n• 副菜：海苔章魚燒X2 (章魚燒(X2)、海苔-烤)\n• 蔬菜：菇炒筍丁 (筍、香菇、毛豆-炒) 【產銷 (履歷)】\n• 湯品：酸辣湯 (豆腐、雞蛋、金針菇)\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：白飯 (白米)\n• 主菜：蜜香黑豆干 (黑豆干、鮑菇、芝麻-煮)\n• 副菜一：素佛跳牆 (白菜、筍、芋頭、素排骨酥-煮)\n• 副菜二：清炒花椰 (花椰菜、時蔬-炒)\n• 副菜三：枸杞冬瓜 (冬瓜、枸杞-煮)\n• 青菜：黑椒洋芋 (洋芋、時蔬、素絞肉、黑胡椒-煮) 【產銷履歷】\n• 湯品：青菜豆腐湯 (豆腐、青菜)\n`;
  chatKnowledgeBase['六月5日'] = chatKnowledgeBase['6月5日'];
  chatKnowledgeBase['6/5'] = chatKnowledgeBase['6月5日'];
  chatKnowledgeBase['6月8日'] = `📅 **115年6月8日 (一) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：白飯 (白米)\n• 主菜：蜜醬雞翅X1 (雞翅X1 燒)\n• 副菜：烤 肉 醬 (甜 不 辣)\n• 蔬菜：小瓜金玉 (玉米、小黃瓜 煮) 【履歷 (青菜)】\n• 湯品：竹筍大骨湯 (竹筍、大骨)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：蕎麥飯 (白米、蕎麥)\n• 主菜：韓式泡菜雞丁 (雞肉、大白菜、泡菜-煮)\n• 副菜：湯包X2 (湯包(X2)-蒸)\n• 蔬菜：海帶干絲 (海帶、豆干-煮) 【產銷 (履歷)】\n• 湯品：蒲瓜排骨湯 (蒲瓜、湯排)\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：蕎麥飯 (白米、蕎麥)\n• 主菜：醬蒸嫩油腐X2 (嫩油豆腐(X2)、菇-蒸)\n• 副菜一：素鴿鬆 (豆薯、素火腿、素香鬆、素絞肉、冬粉-炒)\n• 副菜二：杏片高麗菜 (高麗菜、紅蘿蔔、杏仁片-)\n• 副菜三：蜜汁芋頭 (炒 芋頭-煮)\n• 青菜：清炒皇宮菜 (皇宮菜、時蔬-炒) 【產銷履歷】\n• 湯品：蘿蔔湯 (白蘿蔔、時蔬)\n`;
  chatKnowledgeBase['六月8日'] = chatKnowledgeBase['6月8日'];
  chatKnowledgeBase['6/8'] = chatKnowledgeBase['6月8日'];
  chatKnowledgeBase['6月9日'] = `📅 **115年6月9日 (二) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：糙米飯\n• 主菜：壽喜燒 (豬排X1)\n• 副菜：茶葉蛋X1\n• 蔬菜：炒甘藍菜 【有機 (青菜)】\n• 湯品：海芽蛋花湯\n• 附餐：果 (汁)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：白飯 (白米)\n• 主菜：咖哩豬排 (豬排(X1)、咖哩-燒)\n• 副菜：蒸蛋雞蛋-蒸\n• 蔬菜：鮮蔬高麗菜 (高麗菜、時蔬-炒) 【有機 (蔬菜)】\n• 湯品：青菜蛋花湯 (青菜、雞蛋)\n• 附餐：果汁\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：白飯 (白米)\n• 主菜：海帶干絲 (豆干絲、海帶絲-炒)\n• 副菜一：紅燒烤麩 (烤麩、筍、時蔬、蓮子-燒)\n• 副菜二：咖哩洋芋 (洋芋、紅蘿蔔、咖哩-)\n• 副菜三：什錦花椰 (煮 花椰菜、木耳、蒟蒻-煮)\n• 青菜：炒大黃瓜 (大黃瓜、菇-炒) 【產銷履歷】\n• 湯品：白菜鮮蔬湯 (白菜、時蔬)\n• 附餐：果汁\n`;
  chatKnowledgeBase['六月9日'] = chatKnowledgeBase['6月9日'];
  chatKnowledgeBase['6/9'] = chatKnowledgeBase['6月9日'];
  chatKnowledgeBase['6月10日'] = `📅 **115年6月10日 (三) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：白飯 (白米)\n• 主菜：香菇冬瓜雞 (雞肉、冬瓜、菇 煮)\n• 副菜：回鍋肉 (豆干、豬肉、時蔬 炒)\n• 蔬菜：奶香白菜 (白菜、南瓜 煮) 【履歷 (青菜)】\n• 湯品：玉米濃湯 (玉米、洋芋)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：薏仁飯 (白米、洋薏仁)\n• 主菜：義式檸檬雞 (雞肉、鮑菇、檸檬汁、綜合香料-煮)\n• 副菜：烤豬肉條 (豬肉切條-烤)\n• 蔬菜：芝麻菜豆 (菜豆、紅蘿蔔、芝麻-炒) 【產銷 (履歷)】\n• 湯品：玉米濃湯 (玉米、雞蛋)\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：薏仁飯 (白米、洋薏仁)\n• 主菜：栗香麵輪 (麵輪、白蘿蔔、栗子-滷)\n• 副菜一：醬爆豆雞片 (豆雞片、菇-炒)\n• 副菜二：蜜糖地瓜 (地瓜、芝麻-炒)\n• 副菜三：蠔油燜苦瓜 (苦瓜、時蔬-燜)\n• 青菜：清炒豆苗 (豆苗、時蔬-炒) 【產銷履歷】\n• 湯品：針菇海芽湯 (金針菇、海芽)\n`;
  chatKnowledgeBase['六月10日'] = chatKnowledgeBase['6月10日'];
  chatKnowledgeBase['6/10'] = chatKnowledgeBase['6月10日'];
  chatKnowledgeBase['10日'] = chatKnowledgeBase['6月10日'];
  chatKnowledgeBase['6月11日'] = `📅 **115年6月11日 (四) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：五穀飯 (白米、五穀米)\n• 主菜：叻沙肉排X1 (豬排X1 燒)\n• 副菜：番茄紅燒雞 (蘿蔔、雞肉、番茄 煮)\n• 蔬菜：鮮蔬蒲瓜 (蒲瓜、木耳 煮) 【履歷 (青菜)】\n• 湯品：柴魚味噌湯 (洋蔥、玉米、腐皮)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：雞絲炒飯 (白米、時蔬、雞肉)\n• 主菜：★炸魚排 (魚排(X1)-炸)\n• 副菜：海山醬肉圓X1 (肉圓(X1)、海山醬-蒸)\n• 蔬菜：紅片炒筍 (筍、紅蘿蔔-炒) 【產銷 (履歷)】\n• 湯品：蘿蔔雞湯 (白蘿蔔、雞骨)\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：古早味米苔目 (米苔目、素絞肉、時蔬)\n• 主菜：芹香豆包 (豆包、芹菜-炒)\n• 副菜一：糯米椒炒肉絲 (糯米椒、素肉絲、彩椒-炒)\n• 副菜二：燴雙菇 (大白菜、鴻喜菇、菇-)\n• 副菜三：芋泥包X1 (燴 芋泥包(X1)-蒸)\n• 青菜：枸杞地瓜葉 (地瓜葉、枸杞-煮) 【產銷履歷】\n• 湯品：羅宋湯 (洋芋、番茄)\n`;
  chatKnowledgeBase['六月11日'] = chatKnowledgeBase['6月11日'];
  chatKnowledgeBase['6/11'] = chatKnowledgeBase['6月11日'];
  chatKnowledgeBase['11日'] = chatKnowledgeBase['6月11日'];
  chatKnowledgeBase['6月12日'] = `📅 **115年6月12日 (五) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：白飯 (白米)\n• 主菜：梅汁糖醋雞 (雞肉、彩椒 炒)\n• 副菜：金湯酸菜豬 (凍豆腐、白菜、豬肉、酸菜 煮)\n• 蔬菜：雙色花椰 (花椰菜 炒) 【履歷 (青菜)】\n• 湯品：黃瓜大骨湯 (黃瓜、大骨)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：小米飯 (白米、小米)\n• 主菜：避風塘雞排 (雞排(X1)、蒜、蔥-燒)\n• 副菜：麻婆豆腐 (豆腐、豬肉、毛豆-煮)\n• 蔬菜：鮮蔬白菜 (大白菜、木耳-炒) 【產銷 (履歷)】\n• 湯品：筍香針菇湯 (金針菇、筍)\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：小米飯 (白米、小米)\n• 主菜：酸菜素肚 (素肚、酸菜-炒)\n• 副菜一：蘑菇醬豆腐 (豆腐、玉米、紅蘿蔔、菇-煮)\n• 副菜二：南瓜肉醬 (南瓜、素絞肉-燒)\n• 副菜三：脆炒竹筍 (筍、時蔬-炒)\n• 青菜：炒青木瓜 (青木瓜、木耳-炒) 【產銷履歷】\n• 湯品：脆薯鮮菇湯 (豆薯、菇)\n`;
  chatKnowledgeBase['六月12日'] = chatKnowledgeBase['6月12日'];
  chatKnowledgeBase['6/12'] = chatKnowledgeBase['6月12日'];
  chatKnowledgeBase['12日'] = chatKnowledgeBase['6月12日'];
  chatKnowledgeBase['6月15日'] = `📅 **115年6月15日 (一) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：白醬義大 (利麵)\n• 主菜：★炸椒鹽豬排X1 (豬排X1 炸)\n• 副菜：地瓜椪X2 (地瓜椪X2 烤)\n• 蔬菜：四季炒雞 (條豆、雞絞肉、菇 炒) 【履歷 (青菜)】\n• 湯品：麻油雞湯 (高麗菜、雞肉、雞骨架)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：白飯 (白米)\n• 主菜：滷豬腳 (豬肉、豬腳、筍-滷)\n• 副菜：白菜拌雞 (大白菜、雞肉、菇-炒)\n• 蔬菜：蒜味海帶根 (海帶根、紅蘿蔔-炒) 【產銷 (履歷)】\n• 湯品：絲瓜湯 (絲瓜)\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：雙菇紫米炒飯 (白米、紫米、鴻喜菇、菇、紅蘿蔔)\n• 主菜：小瓜素雞丁 (素雞丁、小黃瓜-燒)\n• 副菜一：★椒鹽豆腸捲 (海苔、豆腸-炸)\n• 副菜二：脆炒豆薯丁 (豆薯、毛豆仁-炒)\n• 副菜三：豆簽絲瓜 (絲瓜、豆簽-煮)\n• 青菜：塔香茄子 (茄子、九層塔-煮) 【產銷履歷】\n• 湯品：味噌油腐湯 (油豆腐、海帶芽)\n`;
  chatKnowledgeBase['六月15日'] = chatKnowledgeBase['6月15日'];
  chatKnowledgeBase['6/15'] = chatKnowledgeBase['6月15日'];
  chatKnowledgeBase['15日'] = chatKnowledgeBase['6月15日'];
  chatKnowledgeBase['6月16日'] = `📅 **115年6月16日 (二) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：白飯\n• 主菜：烤脆皮雞排X1\n• 副菜：菜脯蛋\n• 蔬菜：哨子嫩腐 【有機 (青菜)】\n• 湯品：肉骨茶湯\n• 附餐：豆 (奶)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：蔥油拌麵 (麵、時蔬、豬肉)\n• 主菜：雞肉捲 (雞肉捲(X1)-烤)\n• 副菜：蒸餃X2 (蒸餃(X2)-蒸)\n• 蔬菜：木須蒲瓜 (蒲瓜、木耳-炒) 【有機 (蔬菜)】\n• 湯品：味噌豆腐湯 (豆腐、海帶芽、味噌)\n• 附餐：豆奶\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：燕麥飯 (白米、燕麥)\n• 主菜：五更豆腐 (凍豆腐、時蔬、酸菜-煮)\n• 副菜一：白菜燒麵筋 (大白菜、時蔬、麵筋-燒)\n• 副菜二：清炒筍絲 (筍、時蔬-炒)\n• 副菜三：糖粉地瓜塊 (地瓜切塊-烤)\n• 青菜：針菇芥藍 (芥藍菜、針菇-煮) 【標章蔬菜】\n• 湯品：蒲瓜鮮蔬湯 (蒲瓜、時蔬)\n• 附餐：豆奶\n`;
  chatKnowledgeBase['六月16日'] = chatKnowledgeBase['6月16日'];
  chatKnowledgeBase['6/16'] = chatKnowledgeBase['6月16日'];
  chatKnowledgeBase['16日'] = chatKnowledgeBase['6月16日'];
  chatKnowledgeBase['6月17日'] = `📅 **115年6月17日 (三) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：燕麥飯 (白米、燕麥)\n• 主菜：竹筍燒肉 (豬肉、竹筍 燒)\n• 副菜：白菜燒雞 (白菜、雞肉 燒)\n• 蔬菜：炒花椰菜 (花椰菜、紅蘿蔔 炒) 【履歷 (青菜)】\n• 湯品：苳菜大瓜湯 (黃瓜、苳菜)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：白飯 (白米)\n• 主菜：紅糟豬排 (豬排(X1)、紅糟-烤)\n• 副菜：黑豆干滷味 (黑豆干、香菇、紅蘿蔔-滷)\n• 蔬菜：枸杞冬瓜 (冬瓜、枸杞-煮) 【產銷 (履歷)】\n• 湯品：竹筍雞湯 (筍、雞骨)\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：白飯 (白米)\n• 主菜：菇炒麵腸 (麵腸、菇-炒)\n• 副菜一：客家小炒 (豆干、芹菜、紅椒-炒)\n• 副菜二：木須黃瓜 (大黃瓜、木耳-煮)\n• 副菜三：沙茶玉米段X1 (玉米段(X1)、素沙茶-煮)\n• 青菜：榨菜銀芽 (豆芽菜、榨菜-煮) 【產銷履歷】\n• 湯品：竹筍湯 (筍)\n`;
  chatKnowledgeBase['六月17日'] = chatKnowledgeBase['6月17日'];
  chatKnowledgeBase['6/17'] = chatKnowledgeBase['6月17日'];
  chatKnowledgeBase['17日'] = chatKnowledgeBase['6月17日'];
  chatKnowledgeBase['6月18日'] = `📅 **115年6月18日 (四) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：白飯 (白米)\n• 主菜：沙茶翅小腿X2 (翅小腿X2 炒)\n• 副菜：奶 黃 醬 (肉 丸X1)\n• 蔬菜：紅蔥高麗 (高麗菜、紅蔥 煮) 【履歷 (青菜)】\n• 湯品：榨菜肉絲湯 (榨菜、豬肉)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：紫米飯 (白米、紫米)\n• 主菜：蠔油雞排 (雞排(X1)-滷)\n• 副菜：蘿蔔肉羹 (白蘿蔔、肉羹-煮)\n• 蔬菜：炒豆芽菜 (豆芽菜、時蔬-炒) 【產銷 (履歷)】\n• 湯品：大滷湯 (時蔬、木耳、紅蘿蔔)\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：紫米飯 (白米、紫米)\n• 主菜：南瓜豆腐煲 (豆腐、南瓜、毛豆仁-煮)\n• 副菜一：八寶肉醬 (豆干、紅蘿蔔、素絞肉、時蔬-煮)\n• 副菜二：螞蟻上樹 (冬粉、高麗菜、時蔬、芝麻-)\n• 副菜三：蓮子山藥 (炒 山藥、蓮子-煮)\n• 青菜：蠔油秋葵 (秋葵、素蠔油-煮) 【產銷履歷】\n• 湯品：冬瓜薏仁湯 (冬瓜、洋薏仁)\n`;
  chatKnowledgeBase['六月18日'] = chatKnowledgeBase['6月18日'];
  chatKnowledgeBase['6/18'] = chatKnowledgeBase['6月18日'];
  chatKnowledgeBase['18日'] = chatKnowledgeBase['6月18日'];
  chatKnowledgeBase['6月19日'] = `📅 **115年6月19日 (五) 學生午餐菜單** 🍱\n\n今天端午節放假，學校不供餐喔！祝大家端午節安康！🎋`;
  chatKnowledgeBase['六月19日'] = chatKnowledgeBase['6月19日'];
  chatKnowledgeBase['6/19'] = chatKnowledgeBase['6月19日'];
  chatKnowledgeBase['19日'] = chatKnowledgeBase['6月19日'];
  chatKnowledgeBase['6月22日'] = `📅 **115年6月22日 (一) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：白飯 (白米)\n• 主菜：塔香肉排X1 (豬排X1 燒)\n• 副菜：番茄炒蛋 (番茄、蛋 炒)\n• 蔬菜：薑絲海根 (海帶根 煮) 【履歷 (青菜)】\n• 湯品：關東煮湯 (蘿蔔、玉米、菇)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：客家粄條 (粄條、時蔬、豬肉)\n• 主菜：三杯雞翅 (雞翅(X1)-滷)\n• 副菜：海鮮捲X2 (海鮮捲(X2)-烤)\n• 蔬菜：炒高麗菜 (高麗菜、紅蘿蔔-炒) 【產銷 (履歷)】\n• 湯品：肉骨茶湯 (時蔬、紅棗、湯排)\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：胚芽飯 (白米、胚芽米)\n• 主菜：鮑菇麵輪 (麵輪、鮑菇、時蔬-燒)\n• 副菜一：麻婆豆腐 (豆腐、素絞肉-煮)\n• 副菜二：栗子燒白菜 (大白菜、栗子、菇、-煮)\n• 副菜三：匈牙利黃芽 (黃豆芽、時蔬、匈牙利紅椒粉-炒)\n• 青菜：蔬炒櫛瓜 (櫛瓜、時蔬-炒) 【產銷履歷】\n• 湯品：番茄鮮蔬湯 (時蔬、番茄)\n`;
  chatKnowledgeBase['六月22日'] = chatKnowledgeBase['6月22日'];
  chatKnowledgeBase['6/22'] = chatKnowledgeBase['6月22日'];
  chatKnowledgeBase['22日'] = chatKnowledgeBase['6月22日'];
  chatKnowledgeBase['6月23日'] = `📅 **115年6月23日 (二) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：甜醬油 (炒麵)\n• 主菜：燒雞翅X1 (雞翅X1 燒)\n• 副菜：★炸魚條X2 (魚條X2 炸)\n• 蔬菜：香菇豆芽 (豆芽、香菇 煮) 【有機 (青菜)】\n• 湯品：味噌湯 (豆腐、味噌)\n• 附餐：果 (汁)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：胚芽飯 (白米、胚芽米)\n• 主菜：宮保魚排 (魚排(X1)-燒)\n• 副菜：沙茶凍豆腐 (凍豆腐、金針菇、沙茶-煮)\n• 蔬菜：打拋粉絲 (冬粉、時蔬、豬肉、番茄、魚露-煮) 【有機 (蔬菜)】\n• 湯品：黃瓜雞湯 (大黃瓜、雞骨)\n• 附餐：果汁/ (回饋)\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：香椿義大利麵 (義大利麵、玉米、時蔬、香椿醬)\n• 主菜：客家鑲豆腐X1 (油豆腐(X1)、芋頭、菇-蒸)\n• 副菜一：醬爆麵腸 (麵腸、花椰菜、時蔬-炒)\n• 副菜二：鮮菇地瓜葉 (地瓜葉、菇-炒)\n• 副菜三：脆炒鮮筍 (筍、紅蘿蔔、香菇-炒)\n• 青菜：奶皇包X1 (奶皇包(X1)-蒸) 【標章蔬菜】\n• 湯品：巧達濃湯 (洋芋、紅蘿蔔)\n• 附餐：果汁/ (回饋)\n`;
  chatKnowledgeBase['六月23日'] = chatKnowledgeBase['6月23日'];
  chatKnowledgeBase['6/23'] = chatKnowledgeBase['6月23日'];
  chatKnowledgeBase['23日'] = chatKnowledgeBase['6月23日'];
  chatKnowledgeBase['6月24日'] = `📅 **115年6月24日 (三) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：白飯 (白米)\n• 主菜：紅燒小排 (豬肉、小排、蘿蔔 燒)\n• 副菜：蒜香玉米雞 (玉米、雞絞肉、紅蘿蔔 煮)\n• 蔬菜：翠炒甘藍 (高麗菜、紅蘿蔔 炒) 【履歷 (青菜)】\n• 湯品：針菇鮮瓜湯 (冬瓜、針菇)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：糙米飯 (白米、糙米)\n• 主菜：叻沙雞丁 (雞肉、地瓜、椰奶、叻沙-炒)\n• 副菜：紅燒獅子頭X1 (獅子頭(X1)、時蔬-煮)\n• 蔬菜：薑絲海茸 (海茸、筍-煮) 【產銷 (履歷)】\n• 湯品：蘿蔔排骨湯 (白蘿蔔、湯排)\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：糙米飯 (白米、糙米)\n• 主菜：茄汁豆包 (豆包、番茄、毛豆仁-蒸)\n• 副菜一：小瓜炒素肚 (素肚、小黃瓜-炒)\n• 副菜二：腰果炒玉米 (玉米、時蔬、腰果-炒)\n• 副菜三：炒結頭菜 (結頭菜、菇-炒)\n• 青菜：梅醬苦瓜 (苦瓜、梅醬-煮) 【產銷履歷】\n• 湯品：榨菜肉絲湯 (素肉絲、榨菜)\n`;
  chatKnowledgeBase['六月24日'] = chatKnowledgeBase['6月24日'];
  chatKnowledgeBase['6/24'] = chatKnowledgeBase['6月24日'];
  chatKnowledgeBase['24日'] = chatKnowledgeBase['6月24日'];
  chatKnowledgeBase['6月25日'] = `📅 **115年6月25日 (四) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：胚芽飯 (白米、胚芽)\n• 主菜：烤雞肉捲X1 (雞肉捲X1 烤)\n• 副菜：味噌豚肉煲 (蘿蔔、豬肉、玉米 煮)\n• 蔬菜：脆炒三絲 (豆芽、韭菜、紅蘿蔔 炒) 【履歷 (青菜)】\n• 湯品：酸辣湯 (筍、豆腐、木耳、紅蘿蔔)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：白飯 (白米)\n• 主菜：卡菲燉肉 (豬肉、洋蔥、卡菲醬-煮)\n• 副菜：蜜汁小方干 (豆干、芝麻-炒)\n• 蔬菜：白醬南瓜 (南瓜、鮑菇、白醬-煮) 【產銷 (履歷)】\n• 湯品：巧達濃湯 (馬鈴薯、雞蛋)\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：白飯 (白米)\n• 主菜：白玉關東煮 (油豆腐、白蘿蔔、海結、蒟蒻-煮)\n• 副菜一：沙嗲豆雞片 (豆雞片、小黃瓜、素沙嗲-煮)\n• 副菜二：奶香南瓜 (南瓜、洋芋-煮)\n• 副菜三：鮮菇扁蒲 (蒲瓜、菇-煮)\n• 青菜：鮮蔬燴雙耳 (白木耳、黑木耳、紅蘿蔔-煮) 【產銷履歷】\n• 湯品：結頭菜湯 (結頭菜、薑)\n`;
  chatKnowledgeBase['六月25日'] = chatKnowledgeBase['6月25日'];
  chatKnowledgeBase['6/25'] = chatKnowledgeBase['6月25日'];
  chatKnowledgeBase['25日'] = chatKnowledgeBase['6月25日'];
  chatKnowledgeBase['6月26日'] = `📅 **115年6月26日 (五) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：白飯 (白米)\n• 主菜：咖哩豬 (豬肉、洋芋 煮)\n• 副菜：烤雞 堡 排X1 (雞堡排X1 烤)\n• 蔬菜：蜜汁豆干 (豆干、芝麻 炒) 【履歷 (青菜)】\n• 湯品：南瓜大骨湯 (南瓜、大骨)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：紅藜小米飯 (白米、小米、紅藜麥)\n• 主菜：紐澳良翅小腿 (翅小腿(X2)-烤)\n• 副菜：肉燥玉米 (玉米、豬肉、毛豆-煮)\n• 蔬菜：雙色花椰菜 (花椰菜、菇-炒) 【產銷 (履歷)】\n• 湯品：針菇海芽湯 (金針菇、海帶芽)\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：紅藜小米飯 (白米、小米、紅藜麥)\n• 主菜：醬燒百頁 (百頁、時蔬-燒)\n• 副菜一：芝香菜豆 (菜豆、豆包絲、白芝麻-炒)\n• 副菜二：清炒寬粉 (寬粉、時蔬-炒)\n• 副菜三：薑黃蓮藕圈 (蓮藕、薑黃-煮)\n• 青菜：炒高麗菜 (高麗菜、時蔬-炒) 【產銷履歷】\n• 湯品：味噌豆腐湯 (豆腐、海帶芽、味噌)\n`;
  chatKnowledgeBase['六月26日'] = chatKnowledgeBase['6月26日'];
  chatKnowledgeBase['6/26'] = chatKnowledgeBase['6月26日'];
  chatKnowledgeBase['26日'] = chatKnowledgeBase['6月26日'];
  chatKnowledgeBase['6月29日'] = `📅 **115年6月29日 (一) 學生午餐菜單** 🍱\n\n【一、三、四年級 (雙翼食品 - 葷食)】\n• 主食：雜糧飯 (白米、雜糧米)\n• 主菜：韓式泡菜魚 (魚肉、泡菜 煮)\n• 副菜：蒸蛋蛋.時蔬 蒸\n• 蔬菜：滷味拼盤 (豆製品、時蔬、丸子 煮) 【履歷 (青菜)】\n• 湯品：薑絲海芽湯 (海芽)\n\n【二、五、六年級 (久翔食品 - 葷食)】\n• 主食：白飯 (白米)\n• 主菜：味噌豬肉 (豬肉、高麗菜、味噌-煮)\n• 副菜：竹筍炒雞 (筍、雞肉-炒)\n• 蔬菜：柴魚蘿蔔 (白蘿蔔、香菇、柴魚-煮) 【產銷 (履歷)】\n• 湯品：山藥四神湯 (山藥、洋薏仁、湯排)\n\n【二、五、六年級 (久翔食品 - 素食)】\n• 主食：白飯 (白米)\n• 主菜：四喜烤麩 (烤麩、木耳、黃椒、香菇-煮)\n• 副菜一：紅娘豆包 (豆包絲、紅蘿蔔-煮)\n• 副菜二：清炒絲瓜 (絲瓜、木耳-炒)\n• 副菜三：蠔油茄子 (茄子、素蠔油-蒸)\n• 青菜：鮮菇芥藍 (芥藍菜、針菇-煮) 【產銷履歷】\n• 湯品：海芽黃芽湯 (黃豆芽、海帶芽)\n`;
  chatKnowledgeBase['六月29日'] = chatKnowledgeBase['6月29日'];
  chatKnowledgeBase['6/29'] = chatKnowledgeBase['6月29日'];
  chatKnowledgeBase['29日'] = chatKnowledgeBase['6月29日'];
  chatKnowledgeBase['午餐'] = `🍱 **光復國小學生午餐供餐與服務資訊指引** ✿

本校學生午餐依年級由不同的優良食品廠商進行供餐，資訊如下：
1. **供餐廠商劃分**：
   - **一、三、四年級**：由 **雙翼食品** 供餐。
   - **二、五、六年級**：由 **久翔食品** 供餐 (提供葷食與素食)。
2. **官方菜單與資訊連結** (點擊直接下載/瀏覽)：
   - [115年6月菜單 (久翔葷食) 📄](https://drive.google.com/file/d/1HEs1si0l1A8EhCAefxASJ0CSvIxAomRQ/view?usp=drive_link)
   - [115年6月久翔菜單 (素食) 📄](https://drive.google.com/file/d/1JnWzOiDCw8A35H9ZJLOL4Phz2BjniYLo/view?usp=drive_link)
   - [115年6月菜單 (雙翼葷食) 📄](https://drive.google.com/file/d/1z4NUT5KFfJFy1wBNtr5q2oTj__QVMrkt/view?usp=drive_link)
   - [校園食材登錄平臺 🌐](https://fatraceschool.k12ea.gov.tw/frontend/search.html)
3. **午餐請假與退費辦法**：
   - 學生因故（如公假、病假、事假等）未於學校用餐，可辦理退費。
   - [午餐退費辦法及相關申請表件資料夾 📁](https://drive.google.com/drive/folders/1023CBApCC9Cac2kRINE42L9AqRC89Nfa?usp=drive_link)
4. **聯絡窗口**：若有任何午餐相關疑问，歡迎於上班時間聯絡學務處午餐秘書分機 **137**！📞`;
  chatKnowledgeBase['菜單'] = chatKnowledgeBase['午餐'];
  chatKnowledgeBase['菜色'] = chatKnowledgeBase['午餐'];
  chatKnowledgeBase['吃什麼'] = chatKnowledgeBase['午餐'];
  chatKnowledgeBase['供餐'] = chatKnowledgeBase['午餐'];
  chatKnowledgeBase['退費'] = chatKnowledgeBase['午餐'];

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
        const uniqueKB = {};
        const mainKeys = ['交通', '鮮奶', '請假', '冷氣', '認識', '最新', '處室', '報修', '幼兒園', '平台', '招生', '午餐', '一年一班', '校長'];
        const dynamicContext = [];
        mainKeys.forEach(k => {
          if (chatKnowledgeBase[k]) {
            dynamicContext.push(`[主題：${k}]\n${chatKnowledgeBase[k]}`);
          }
        });

        // Add lunch menu context dynamically if dates are queried
        if (userMessage.includes('月') || userMessage.includes('/') || /\d+/.test(userMessage)) {
          for (const k in chatKnowledgeBase) {
            if ((k.includes('月') || k.includes('/')) && userMessage.includes(k.replace('月', '').replace('日', '').trim())) {
              dynamicContext.push(`[主題：${k} 午餐菜單]\n${chatKnowledgeBase[k]}`);
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
      totalChatResponses += 1;
      updateDashboardStats();
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
        totalChatResponses += 1;
        updateDashboardStats();
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
