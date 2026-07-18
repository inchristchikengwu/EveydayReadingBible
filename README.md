# 每日基督教靈修 PWA — UI v4

本版加入全新的聖經／十字架 App 圖示、統一中英文字型，並新增「日期／靈修主題索引」。

## 本版修改

1. **App 圖示更新**
   - 新圖示採用聖經與十字架意象。
   - 已提供 `192 × 192` 與 `512 × 512` PNG。
   - `assets/icon-source.svg` 為可再編輯的向量來源。

2. **字型統一**
   - 中文：`Microsoft JhengHei` → `PingFang TC` → `Arial`。
   - 英文：`Arial` → `PingFang TC` → `Microsoft JhengHei`。
   - 已移除 `Times New Roman`，並改良英文段落辨識，避免不同英文段落出現不一致字型。

3. **日期／靈修主題索引**
   - 首頁工具列新增「索引」按鈕。
   - 索引會列出指定 Google Drive 資料夾中所有符合格式的 Google Docs。
   - 支援依日期或主題搜尋。
   - 點選任一筆後，App 會自動切換日期並重新載入該篇靈修。
   - 同一日期若有多份文件，索引與讀取都以最後更新版本為準。

4. **PWA 更新**
   - Service worker 快取版本更新為 `daily-devotion-pwa-v4`。
   - 快取策略改為先顯示快取、背景更新，減少更新後長時間看到舊版的情形。

## 必須更新 Apps Script

索引功能新增了 `action=index` API，因此這次不只要更新 GitHub Pages，也必須更新 Apps Script。

1. 開啟原本的 Apps Script 專案。
2. 用 `apps-script/Code.gs` 的內容覆蓋原本程式。
3. 確認下列設定仍正確：
   - `FOLDER_ID`：每日靈修 Google Drive 資料夾 ID。
   - `APP_TOKEN`：須與 App 設定中輸入的 Token 完全相同。
4. 選擇「部署」→「管理部署作業」。
5. 編輯原 Web App 部署，建立新版本後重新部署。
6. 若重新部署後 Web App URL 不變，App 內不需重設；若 URL 改變，請在 App 的「設定」中更新。

Apps Script 執行身分與存取權限請沿用原本可正常讀取 Google Drive 的設定。

## 更新 GitHub Pages

請把下列檔案覆蓋至 GitHub repository 根目錄：

```text
index.html
styles.css
app.js
sw.js
manifest.webmanifest
.nojekyll
assets/
```

`apps-script/Code.gs` 不需上傳到 GitHub Pages 才能執行，但應拿去更新 Apps Script 專案。

## Google Docs 標題格式

索引只會收錄符合下列格式的 Google Docs：

```text
每日靈修 YYYY-MM-DD｜靈修主題
```

例如：

```text
每日靈修 2026-07-18｜在基督裡得著安息
```

## 手機仍顯示舊圖示或舊版時

1. 在 Safari 或 Chrome 重新整理 GitHub Pages 網頁數次。
2. 關閉再重新開啟主畫面 App。
3. 圖示仍未更新時，刪除主畫面上的舊 App，再從瀏覽器重新加入主畫面。
4. 必要時清除該 GitHub Pages 網站的網站資料後再安裝。
