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

  function appendMessage(sender, text) {
    if (!chatMessagesLog) return;
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    
    let avatarSrc = 'assets/xiaoguang_logo.png';
    if (sender === 'sent') {
      avatarSrc = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'; // Mock parent avatar
    }

    msgDiv.innerHTML = `
      <div class="message-avatar">
        <img src="${avatarSrc}" alt="${sender === 'sent' ? '家長' : '小光'}">
      </div>
      <div class="message-bubble">
        ${text.replace(/\n/g, '<br>')}
      </div>
    `;

    chatMessagesLog.appendChild(msgDiv);
    chatMessagesLog.scrollTop = chatMessagesLog.scrollHeight;
  }

  // Parent/Visitor playful Q&A Database
  const chatKnowledgeBase = {
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
    '認識': `🏫 **歡迎來到我們最棒的新北市中和區光復國小！** ✨

小光要向您驕傲介紹我們美麗的校園特色喔：
1. **我們的核心理念**：
   - **光復情 • 人文心 • 勤學習 • 能力行**！這就是我們每天努力的方向喔！評語跟吉祥物也都是以此設計的呢！✿
2. **超級厲害的國際交流**：
   - 我們光復國小是新北市的國際交流重點學校喔！我們已經跟超優秀的**美國英華學院 (Yinghua Academy)** 簽訂為姊妹校啦！
   - 我們還跟**美國百老匯小學**進行了整整兩年的書信往來，最近外國小朋友還來我們學校相見歡，大家玩得不亦樂乎，國際視野滿分！🌍
3. **美味又有意義的食育教育**：
   - 學校攜手家樂福文教基金會，帶領 1500 位小朋友一起化身為「i家超人」進行大闖關！讓大家在遊戲中學會珍惜食物、愛護地球，成為環境永續環保小尖兵！🌱
4. **充滿活力的大家庭**：
   - 包含校長室、教務處、學務處、總務處、輔導室、人事室、會計室，還有我們最可愛的「光復附幼」幼兒園喔！🏫`,
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

例如：若您想查詢**一年級國語**，本校採用的是 **康軒版** 喔！如果有轉學準備需要買書，可以參考以上版本。✿`
  };

  chatKnowledgeBase['願景'] = chatKnowledgeBase['認識'];
  chatKnowledgeBase['介紹'] = chatKnowledgeBase['認識'];
  chatKnowledgeBase['特色'] = chatKnowledgeBase['認識'];
  chatKnowledgeBase['校訓'] = chatKnowledgeBase['認識'];
  chatKnowledgeBase['榮譽'] = chatKnowledgeBase['最新'];
  chatKnowledgeBase['新聞'] = chatKnowledgeBase['最新'];
  chatKnowledgeBase['消息'] = chatKnowledgeBase['最新'];
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

  function getAIResponse(userMessage) {
    let responseText = "哈囉哈囉！小光收到你的訊息啦！✨\n關於新北市中和區光復國小，您可以輸入關鍵字（例如：「請假」、「冷氣」、「最新消息」、「認識學校」、「行政處室」或「附幼」），或者點選底下的快速按鈕！小光會用最熱情活潑的語氣為你解答喔！✿";
    
    for (const key in chatKnowledgeBase) {
      if (userMessage.includes(key)) {
        responseText = chatKnowledgeBase[key];
        break;
      }
    }
    return responseText;
  }

  function handleSendChat() {
    if (!chatInputBox) return;
    const text = chatInputBox.value.trim();
    if (!text) return;

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

    setTimeout(() => {
      const tempIndicator = document.getElementById('temp-typing-indicator');
      if (tempIndicator) tempIndicator.remove();

      const response = getAIResponse(text);
      appendMessage('received', response);
      
      // Update statistics
      totalChatResponses += 1;
      updateDashboardStats();
    }, 1200);
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

      setTimeout(() => {
        const tempIndicator = document.getElementById('temp-typing-indicator');
        if (tempIndicator) tempIndicator.remove();

        const response = getAIResponse(questionText);
        appendMessage('received', response);

        // Update statistics
        totalChatResponses += 1;
        updateDashboardStats();
      }, 1000);
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

});
