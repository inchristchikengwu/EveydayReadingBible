# 每日基督教靈修 PWA — UI v2

這版是介面調整版。Apps Script 後端不需要重做；若你已成功驗證讀取，只要把前端檔案更新到 GitHub repo 即可。

## 本版修改

1. 移除首頁說明文字「依日期讀取 Google Drive『每日靈修』資料夾中的原生 Google Docs」。
2. 縮小日期與讀取區塊：
   - 拿掉「今天」按鈕。
   - 拿掉「開啟 Google Docs」按鈕。
   - 「讀取完成」改成讀取按鈕內的小狀態，不再獨立佔一行。
3. 單元書籤列改為固定在畫面下方，閱讀時不用滑回頂端即可切換單元。
4. 新增主題功能：
   - 淺色模式
   - 深色模式
5. Service worker 快取版本已更新為 `daily-devotion-pwa-v2`。

## 更新 GitHub Pages

把這些檔案上傳覆蓋到 GitHub repo 根目錄：

```text
index.html
styles.css
app.js
sw.js
manifest.webmanifest
.nojekyll
assets/
```

`apps-script/Code.gs` 不一定要更新；它只是保留在專案中作為備份範例。

## 若 iPhone 還看到舊版

PWA 會被 service worker 快取。請依序嘗試：

1. Safari 重新整理 GitHub Pages 網頁 2–3 次。
2. 等 1–3 分鐘再開。
3. 若主畫面 App 還是舊版，刪除主畫面圖示後，用 Safari 重新加入主畫面。
4. 必要時到 iPhone：設定 > Safari > 進階 > 網站資料，刪除該 GitHub Pages 網站資料。
