# 每日基督教靈修 PWA

這是一個可以放在 iPhone 主畫面的 PWA 版「每日基督教靈修」App。

它的設計重點：

- 不需要 OpenAI API Key。
- 前端可部署在 GitHub Pages。
- 按下「讀取」後，依日期讀取 Google Drive「每日靈修」資料夾中已存在的 Google Docs。
- 支援字型放大/縮小。
- 自動把每日靈修分成「今日經文、經文脈絡、深度默想、操練、禱告、詩歌、延伸閱讀、今日一句話」等單元，讓使用者點選。
- iPhone 可用 Safari「加入主畫面」。

---

## 架構

```text
iPhone PWA / GitHub Pages
        ↓ JSONP
Google Apps Script Web App
        ↓ DriveApp + DocumentApp
Google Drive「每日靈修」資料夾中的 Google Docs
```

為了避免在前端暴露 Google Drive OAuth 權限，本專案使用 Google Apps Script 作為很薄的後端。Apps Script 以你的 Google 帳號身分讀取你的 Drive 文件。

官方文件參考：

- Google Apps Script Web Apps 需要 `doGet(e)` 或 `doPost(e)`，並可以部署為 Web App。
- GitHub Pages 可部署靜態網站。
- PWA 基本上需要 HTTPS、manifest 與 service worker。

---

## 檔案說明

```text
index.html                 PWA 主頁
styles.css                 手機友善樣式
app.js                     前端互動與 JSONP 讀取
manifest.webmanifest       PWA manifest
sw.js                      Service worker，快取 App shell
assets/icon-192.png        PWA icon
assets/icon-512.png        PWA icon
apps-script/Code.gs        Google Apps Script 後端
```

---

## 一、建立 Google Apps Script 後端

1. 開啟 https://script.google.com
2. 建立新專案，例如命名為：`每日靈修 PWA Backend`
3. 把 `apps-script/Code.gs` 的內容貼到 Apps Script 的 `Code.gs`
4. 確認這兩個常數：

```javascript
const FOLDER_ID = '1OJO_yM_pBxaXqFMdpoBE_2lwlOwp0sD5';
const APP_TOKEN = 'CHANGE_ME_TO_A_LONG_RANDOM_TOKEN';
```

`FOLDER_ID` 已先填入你目前 Google Drive「每日靈修」資料夾的 ID。  
請務必把 `APP_TOKEN` 改成你自己的一串長密碼，例如：

```text
my-daily-devotion-2026-long-private-token
```

5. 點右上角 `Deploy` > `New deployment`
6. `Select type` 選 `Web app`
7. 設定：
   - Execute as：`Me`
   - Who has access：`Anyone`
8. 第一次部署會要求授權，允許 Apps Script 讀取 Drive/Docs。
9. 部署完成後，複製 Web App URL，格式大概像：

```text
https://script.google.com/macros/s/AKfycb.../exec
```

> 安全提醒：  
> 因為 Web App 是 `Execute as Me`，所以不要把 `APP_TOKEN` 放進 GitHub。這個 PWA 會讓你在 iPhone 上手動輸入 token，並只存在該裝置的 localStorage。

---

## 二、部署到 GitHub Pages

1. 建立一個 GitHub repository，例如：`daily-devotion-pwa`
2. 把本資料夾內除了 `apps-script` 也可以包含進去的所有檔案上傳到 repo root。
3. 到 repo 的 `Settings` > `Pages`
4. Source 選：
   - Deploy from a branch
   - Branch：`main`
   - Folder：`/root`
5. 儲存後等待 GitHub Pages 產生網址，例如：

```text
https://你的帳號.github.io/daily-devotion-pwa/
```

---

## 三、第一次使用 App

1. 用 iPhone Safari 開啟你的 GitHub Pages 網址。
2. 點「設定」。
3. 貼上 Apps Script Web App URL。
4. 輸入你在 `Code.gs` 設定的 `APP_TOKEN`。
5. 點「儲存設定」。
6. 選日期，按「讀取」。

如果當日文件存在，App 會讀取標題開頭為：

```text
每日靈修 YYYY-MM-DD｜
```

的 Google Docs，例如：

```text
每日靈修 2026-07-11｜在風浪中安靜，因祂是神
```

---

## 四、加入 iPhone 主畫面

1. 用 Safari 開啟 GitHub Pages 網址。
2. 點分享按鈕。
3. 選「加入主畫面」。
4. 之後就可以像 App 一樣開啟。

---

## 五、文件格式要求

Google Drive 文件需放在「每日靈修」資料夾，且標題格式建議為：

```text
每日靈修 YYYY-MM-DD｜主題
```

內文單元標題建議維持：

```text
◆ 今日經文｜Today’s Scripture
◆ 經文脈絡｜Biblical Context
◆ 深度默想｜Meditation
◆ 今日可實行的操練｜Practice for Today
◆ 今日禱告｜Prayer
◆ 今日詩歌｜Hymn for Today
◆ 延伸閱讀｜Further Reading
◆ 今日一句話｜Today’s One Sentence
```

App 會依 `◆` 開頭自動分段。

---

## 六、常見問題

### 找不到當日靈修

請確認：

- 文件在「每日靈修」資料夾。
- 文件是 Google Docs，不是 docx/pdf。
- 標題開頭是 `每日靈修 YYYY-MM-DD｜`。
- 日期是台灣日期格式，例如 `2026-07-11`。

### Token 不正確

請確認：

- `Code.gs` 裡的 `APP_TOKEN` 已修改。
- iPhone App 設定中輸入的 token 完全相同。
- 修改 Apps Script 後要重新部署，或在 Deploy > Manage deployments 裡編輯部署並選新版。

### Apps Script 修改後 App 沒變

Apps Script 修改後要重新部署新版；只按 Save 不一定會更新正式 `/exec` 版本。
