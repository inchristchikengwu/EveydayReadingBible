# 每日基督教靈修 PWA（AI 每日生成版）

這是一個可部署在 GitHub Pages 的 PWA。畫面包含：

- 今日經文：和合本修訂版 RCUV 短節選 + ESV 短節選
- 今日默想：中英對照
- 今日可實行的操練：中英對照
- 今日禱告：中英對照
- 今日詩歌：中文歌名 + 常見英文歌名 + 中英對照說明
- 今日一句話：中英對照
- 字體大小可調
- 單元分頁與全文顯示
- iPhone 可加入主畫面
- GitHub Actions 每天自動生成 `data/today.json`

## 部署步驟

1. 將本資料夾所有檔案上傳到 GitHub repository 根目錄。
2. 到 GitHub repository：Settings → Secrets and variables → Actions。
3. 在 Secrets 新增：
   - Name: `OPENAI_API_KEY`
   - Secret: 你的 OpenAI API Key
4. 到 Actions → Generate daily devotion → Run workflow，先手動執行一次。
5. 到 Settings → Pages：
   - Source: Deploy from a branch
   - Branch: main
   - Folder: /(root)
6. 部署完成後，用 iPhone Safari 打開 GitHub Pages 網址，分享 → 加入主畫面。

## 注意

- 不要把 API Key 寫在 `index.html` 或任何前端檔案裡。
- GitHub Actions 使用 UTC 排程；此專案設定為台灣時間約早上 05:55 生成。
- 若 Actions 失敗，App 會暫時顯示上一次成功生成的內容或預設範例。
