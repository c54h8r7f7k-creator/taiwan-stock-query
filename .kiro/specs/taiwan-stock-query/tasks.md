<!--  --># 實作計畫：台灣股票查詢應用程式

## 概覽

依照設計文件，以 React 18 + TypeScript + Vite 建構純前端 SPA，採用 Zustand 管理狀態、Recharts 繪製圖表、Tailwind CSS 處理樣式，並透過 TWSE Open API 取得股票資料。

## 任務清單

- [x] 1. 建立專案基礎架構與核心型別
  - 使用 Vite 建立 React + TypeScript 專案，安裝 zustand、recharts、axios、tailwindcss、vitest、fast-check 等依賴
  - 建立 `src/types/index.ts`，定義 `StockSummary`、`StockDetail`、`OHLCVDataPoint`、`MarketOverview`、`WatchlistEntry`、`TimeRange`、`PriceDirection`、`Result<T>` 等核心型別
  - 建立 `src/constants/messages.ts`，定義 `ERROR_MESSAGES` 常數
  - 設定 Tailwind CSS 與 Vite 設定檔
  - _需求：1、2、3、4、5、6_

- [x] 2. 實作 Data Service 層
  - [x] 2.1 建立 `src/services/twseApi.ts`，封裝 Axios 實例與 TWSE Open API 基礎設定，實作 `Result<T>` 錯誤處理模式
    - _需求：2.6、5.6_
  - [x] 2.2 實作 `fetchSearchResults(query)`，呼叫 TWSE API 並解析股票搜尋結果
    - _需求：1.2、1.5_
  - [x] 2.3 實作 `fetchStockDetail(id)`，取得單一股票即時報價詳細資訊
    - _需求：2.1_
  - [x] 2.4 實作 `fetchChartData(id, range)`，取得指定時間區間的歷史 K 線資料，並確保回傳資料按日期升序排列
    - _需求：3.1、3.2、3.3_
  - [x] 2.5 實作 `fetchMarketOverview()`，取得 TAIEX 指數、成交量排行、漲跌幅排行資料，並依規則排序（成交量降序、漲幅降序、跌幅升序），每榜最多 10 筆
    - _需求：5.1、5.2、5.3、5.4_
  - [ ]* 2.6 撰寫屬性測試：圖表資料點時間順序
    - **屬性 7：圖表資料點時間順序**
    - **驗證：需求 3.1、3.3**
  - [ ]* 2.7 撰寫屬性測試：市場排行榜排序正確性
    - **屬性 9：市場排行榜排序正確性**
    - **驗證：需求 5.2、5.3、5.4**
  - [ ]* 2.8 撰寫屬性測試：漲跌幅計算正確性
    - **屬性 8：漲跌幅計算正確性**
    - **驗證：需求 2.1**

- [x] 3. 實作工具函式與 Zustand Store
  - [x] 3.1 建立 `src/utils/priceUtils.ts`，實作 `getPriceDirection(change): PriceDirection` 函式
    - _需求：2.2、2.3、2.4_
  - [ ]* 3.2 撰寫屬性測試：漲跌顏色與方向一致
    - **屬性 3：漲跌顏色與方向一致**
    - **驗證：需求 2.2、2.3、2.4**
  - [x] 3.3 建立 `src/stores/searchStore.ts`，實作 `SearchStore`（含 debounce 500ms 邏輯與空白查詢過濾）
    - _需求：1.2、1.4_
  - [ ]* 3.4 撰寫屬性測試：空白查詢不產生建議
    - **屬性 2：空白查詢不產生建議**
    - **驗證：需求 1.4**
  - [ ]* 3.5 撰寫屬性測試：搜尋建議包含查詢字串
    - **屬性 1：搜尋建議包含查詢字串**
    - **驗證：需求 1.2、1.5**
  - [x] 3.6 建立 `src/stores/stockStore.ts`，實作 `StockStore`（含 `selectStock`、`setChartRange`）
    - _需求：2.1、3.1、3.2、3.3_
  - [x] 3.7 建立 `src/stores/watchlistStore.ts`，實作 `WatchlistStore`（含 localStorage 讀寫、`addToWatchlist`、`removeFromWatchlist`、`isInWatchlist`）
    - _需求：4.1、4.2、4.3、4.5_
  - [ ]* 3.8 撰寫屬性測試：自選股新增後可查詢到
    - **屬性 4：自選股新增後可查詢到**
    - **驗證：需求 4.1、4.2**
  - [ ]* 3.9 撰寫屬性測試：自選股移除後不可查詢到
    - **屬性 5：自選股移除後不可查詢到**
    - **驗證：需求 4.3**
  - [ ]* 3.10 撰寫屬性測試：自選股 localStorage 往返序列化
    - **屬性 6：自選股 localStorage 往返序列化**
    - **驗證：需求 4.5**
  - [x] 3.11 建立 `src/stores/marketStore.ts`，實作 `MarketStore`（含 `fetchOverview`）
    - _需求：5.1、5.2、5.3、5.4、5.6_

- [~] 4. 檢查點：確認所有測試通過，如有疑問請向使用者確認。

- [x] 5. 實作搜尋元件
  - [x] 5.1 建立 `src/components/Search/SearchInput.tsx`，實作文字輸入欄位，觸發 debounce 搜尋
    - _需求：1.1、1.2_
  - [x] 5.2 建立 `src/components/Search/SuggestionList.tsx`，顯示搜尋建議清單，處理空結果提示
    - _需求：1.3、1.4_
  - [x] 5.3 建立 `src/components/Search/SearchComponent.tsx`，組合 `SearchInput` 與 `SuggestionList`，接收 `onStockSelect` 回呼
    - _需求：1.1、1.2、1.3、1.4_
  - [ ]* 5.4 撰寫 `SearchComponent` 單元測試
    - 測試輸入少於 2 字元時不顯示建議、空結果顯示提示訊息
    - _需求：1.2、1.4_

- [x] 6. 實作股票詳情面板
  - [x] 6.1 建立 `src/components/StockDetail/StockDetailPanel.tsx`，顯示股票代號、公司名稱、當前股價、漲跌金額、漲跌幅、成交量、開盤/最高/最低價、最後更新時間，並套用 `getPriceDirection` 決定顏色
    - _需求：2.1、2.2、2.3、2.4、2.5、2.6_
  - [x] 6.2 建立 `src/components/StockDetail/WatchlistButton.tsx`，依 `isInWatchlist` 狀態切換「加入自選股」/「已加入自選股」按鈕
    - _需求：4.1、4.2_
  - [ ]* 6.3 撰寫 `StockDetailPanel` 單元測試
    - 測試漲跌顏色、錯誤訊息顯示、stockId 為 null 時的空白提示
    - _需求：2.2、2.3、2.4、2.6_

- [x] 7. 實作股價走勢圖
  - [x] 7.1 建立 `src/components/Chart/TimeRangeSelector.tsx`，提供 1W / 1M / 3M / 6M / 1Y 切換按鈕
    - _需求：3.2_
  - [x] 7.2 建立 `src/components/Chart/ChartCanvas.tsx`，使用 Recharts 繪製折線圖，支援 tooltip 顯示 OHLCV 資料，並處理無資料提示
    - _需求：3.4、3.5、3.6_
  - [x] 7.3 建立 `src/components/Chart/PriceChart.tsx`，組合 `TimeRangeSelector` 與 `ChartCanvas`，連接 `stockStore.setChartRange`，確保圖表根據容器寬度自動調整尺寸
    - _需求：3.1、3.2、3.3、6.4_
  - [ ]* 7.4 撰寫 `PriceChart` 單元測試
    - 測試時間區間切換、無資料提示訊息
    - _需求：3.2、3.6_

- [x] 8. 實作自選股清單
  - [x] 8.1 建立 `src/components/Watchlist/WatchlistItem.tsx`，顯示股票代號、公司名稱、當前股價與漲跌幅，提供「移除」按鈕
    - _需求：4.3、4.4_
  - [x] 8.2 建立 `src/components/Watchlist/Watchlist.tsx`，列出所有自選股，處理空清單提示，接收 `onStockSelect` 回呼
    - _需求：4.4、4.6_
  - [ ]* 8.3 撰寫 `Watchlist` 單元測試
    - 測試新增、移除、空清單提示
    - _需求：4.1、4.3、4.6_

- [x] 9. 實作市場總覽
  - [x] 9.1 建立 `src/components/Market/IndexCard.tsx`，顯示 TAIEX 指數、漲跌點數與漲跌幅
    - _需求：5.1_
  - [x] 9.2 建立 `src/components/Market/StockRankingList.tsx`，顯示排行榜（成交量/漲幅/跌幅），支援點擊跳轉至股票詳情
    - _需求：5.2、5.3、5.4、5.5_
  - [x] 9.3 建立 `src/components/Market/MarketOverview.tsx`，組合 `IndexCard` 與三個 `StockRankingList`，連接 `marketStore`，處理載入失敗錯誤訊息
    - _需求：5.1、5.2、5.3、5.4、5.6_
  - [ ]* 9.4 撰寫 `MarketOverview` 單元測試
    - 測試錯誤訊息顯示、排行榜點擊事件
    - _需求：5.5、5.6_

- [x] 10. 實作版面配置與響應式設計
  - [x] 10.1 建立 `src/components/Layout/Header.tsx`，包含應用程式標題與 `SearchComponent`
    - _需求：1.1_
  - [x] 10.2 建立 `src/components/Layout/Sidebar.tsx`，在桌面版（≥ 1024px）顯示 `Watchlist` 側邊欄
    - _需求：6.3_
  - [x] 10.3 建立 `src/components/Layout/Layout.tsx`，實作三種響應式版面（手機單欄、平板、桌面側邊欄），使用 Tailwind CSS 斷點
    - _需求：6.1、6.2、6.3_
  - [x] 10.4 建立 `src/App.tsx`，組合所有元件，連接 `onStockSelect` 事件流，完成整體應用程式接線
    - _需求：1.3、5.5、6.1_
  - [ ]* 10.5 撰寫響應式版面單元測試
    - 使用 jsdom 模擬不同視窗寬度，驗證版面切換邏輯
    - _需求：6.1、6.2、6.3_

- [x] 11. 最終檢查點：確認所有測試通過，如有疑問請向使用者確認。

- [ ] 12. 擴充型別定義與常數
  - 在 `src/types/index.ts` 新增 `ChipData`、`FundamentalData`、`AIAnalysisResult` 型別定義
  - 在 `src/constants/messages.ts` 新增 `CHIP_LOAD_FAILED`、`FUNDAMENTAL_LOAD_FAILED`、`AI_TIMEOUT`、`AI_PARSE_ERROR` 錯誤訊息常數
  - _需求：7、8_

- [ ] 13. 實作籌碼面、基本面與 AI 分析 Data Service
  - [ ] 13.1 實作 `fetchChipData(id)`，呼叫 TWSE 三大法人買賣超 API（`/fund/T86`）與融資融券 API（`/exchangeReport/MI_MARGN`），解析並回傳 `ChipData`
    - _需求：7.1、7.6_
  - [ ] 13.2 實作 `fetchFundamentalData(id)`，呼叫 TWSE 基本面 API（`/v1/exchangeReport/BWIBBU_d`），解析並回傳 `FundamentalData`
    - _需求：7.2、7.7_
  - [ ] 13.3 實作 `fetchAIAnalysis(stockId, stockDetail, chipData, fundamentalData)`，呼叫 OpenAI API（逾時 30 秒），解析回傳 `AIAnalysisResult`；API Key 從環境變數 `VITE_OPENAI_API_KEY` 讀取，逾時回傳 `AI_TIMEOUT` 錯誤，格式異常回傳 `AI_PARSE_ERROR` 錯誤
    - _需求：8.1、8.5、8.6_
  - [ ]* 13.4 撰寫屬性測試：籌碼面顏色與買賣超方向一致
    - **屬性 10：籌碼面顏色與買賣超方向一致**
    - **驗證：需求 7.3、7.4**
  - [ ]* 13.5 撰寫屬性測試：AI 分析結果包含所有必要欄位
    - **屬性 11：AI 分析結果包含所有必要欄位**
    - **驗證：需求 8.2、8.7**

- [ ] 14. 擴充 Zustand Store
  - [ ] 14.1 擴充 `src/stores/stockStore.ts`，新增 `chipData`、`fundamentalData`、`chipLoading`、`fundamentalLoading`、`chipError`、`fundamentalError` 狀態，以及 `fetchChipData`、`fetchFundamentalData` action
    - _需求：7.1、7.2_
  - [ ] 14.2 建立 `src/stores/aiAnalysisStore.ts`，實作 `AIAnalysisStore`（含 `result`、`isLoading`、`error` 狀態，以及 `requestAnalysis`、`clearResult` action）
    - _需求：8.1、8.3_

- [ ] 15. 實作籌碼面與基本面 UI 元件
  - [ ] 15.1 建立 `src/components/StockDetail/ChipPanel.tsx`，顯示外資/投信/自營商買賣超、融資融券資料，呼叫 `getChipColor(value)` 決定數值顏色，並處理載入中與錯誤狀態
    - _需求：7.1、7.3、7.4、7.6_
  - [ ] 15.2 建立 `src/components/StockDetail/FundamentalPanel.tsx`，顯示 EPS、本益比、股價淨值比、月營收、月營收年增率、毛利率，並處理載入中與錯誤狀態
    - _需求：7.2、7.5、7.7_
  - [ ] 15.3 擴充 `src/components/StockDetail/StockDetailPanel.tsx`，加入 Tab 切換（即時報價 / 籌碼面 / 基本面），整合 `ChipPanel` 與 `FundamentalPanel`，切換至籌碼面或基本面 Tab 時觸發對應資料載入
    - _需求：7.1、7.2、7.3、7.4、7.5、7.6、7.7_

- [ ] 16. 實作 AI 智能分析 UI 元件
  - [ ] 16.1 建立 `src/components/StockDetail/AIAnalysisPanel.tsx`，顯示目標價、法人成本價估算、買入/賣出價區間（上下限）、分析摘要、產生時間，以及固定免責聲明文字
    - _需求：8.2、8.4、8.7_
  - [ ] 16.2 在 `AIAnalysisPanel` 中實作載入中 spinner 動畫與按鈕禁用邏輯，載入中時禁用「AI 智能分析」按鈕，完成或失敗後重新啟用
    - _需求：8.3、8.5_
  - [ ] 16.3 在 `StockDetailPanel` 的 Tab 中加入「AI 分析」頁籤，整合 `AIAnalysisPanel`，並在切換至 AI 分析 Tab 時清除舊結果
    - _需求：8.1、8.2、8.3、8.4、8.5、8.6、8.7_

- [ ] 17. 最終整合測試：確認所有新功能正常運作，如有疑問請向使用者確認。
  - 確認籌碼面/基本面資料載入失敗時顯示正確錯誤訊息
  - 確認 AI 分析逾時（30 秒）與格式異常的錯誤處理流程
  - _需求：7、8_

## 備註

- 標記 `*` 的子任務為選用項目，可視時程決定是否實作
- 每個屬性測試需標記 `// Feature: taiwan-stock-query, Property {N}: {property_text}`，且最少執行 100 次迭代
- 所有 API 呼叫統一使用 `Result<T>` 型別處理錯誤，避免 throw 傳播
- localStorage 錯誤應靜默失敗，不影響主要功能
