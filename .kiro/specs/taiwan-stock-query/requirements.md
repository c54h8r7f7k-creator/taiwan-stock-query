# 需求文件

## 簡介

本功能為一個台灣股票查詢網頁應用程式，讓使用者能夠透過瀏覽器查詢台灣上市、上櫃股票的即時與歷史資訊，包含股價、成交量、漲跌幅等資料，協助使用者掌握台灣股市動態。

## 詞彙表

- **Stock_Query_App**：台灣股票查詢網頁應用程式主系統
- **Search_Component**：股票搜尋元件，負責接收使用者輸入並查詢股票
- **Stock_Detail_Panel**：股票詳細資訊面板，負責顯示單一股票的完整資訊
- **Price_Chart**：股價走勢圖元件，負責以圖表呈現歷史股價
- **Watchlist**：自選股清單，使用者自訂的追蹤股票列表
- **Data_Service**：資料服務層，負責向外部 API 取得股票資料
- **Chip_Panel**：籌碼面資訊面板，負責顯示法人買賣超、融資融券、主力進出等籌碼資料
- **Fundamental_Panel**：基本面資訊面板，負責顯示 EPS、本益比、股價淨值比、營收、毛利率等財務指標
- **AI_Analysis_Service**：AI 智能分析服務，負責串接 AI 模型並產生股票買賣建議
- **AI_Analysis_Panel**：AI 分析結果面板，負責顯示目標價、法人成本價與短期買賣建議
- **股票代號**：台灣證券交易所或櫃買中心所定義的股票識別碼，例如 2330（台積電）
- **即時報價**：當日最新成交價格與相關資訊
- **漲跌幅**：相較於前一交易日收盤價的價格變動百分比
- **法人買賣超**：外資、投信、自營商三大法人當日買進與賣出股數之差額
- **融資融券**：融資為投資人向券商借款買股，融券為投資人向券商借股賣出；兩者餘額反映市場槓桿程度
- **主力進出**：特定大額交易者（主力）的買賣行為統計
- **EPS**：每股盈餘（Earnings Per Share），公司稅後淨利除以流通在外股數
- **本益比**：股價除以每股盈餘（P/E Ratio），反映市場對公司獲利的估值倍數
- **股價淨值比**：股價除以每股淨值（P/B Ratio），反映市場對公司資產的估值倍數
- **目標價**：分析師或 AI 模型預測的合理股價區間上限
- **法人成本價**：三大法人持股的平均買入成本估算價格

---

## 需求

### 需求 1：股票搜尋

**使用者故事：** 身為一位投資人，我想要透過股票代號或公司名稱搜尋股票，以便快速找到我想查詢的標的。

#### 驗收標準

1. THE Search_Component SHALL 提供一個文字輸入欄位，供使用者輸入股票代號或公司名稱
2. WHEN 使用者在搜尋欄位輸入至少 2 個字元，THE Search_Component SHALL 在 500ms 內顯示符合條件的股票建議清單
3. WHEN 使用者從建議清單中選取一支股票，THE Stock_Detail_Panel SHALL 顯示該股票的詳細資訊
4. IF 搜尋結果為空，THEN THE Search_Component SHALL 顯示「查無符合的股票，請確認股票代號或名稱」的提示訊息
5. WHEN 使用者提交搜尋，THE Data_Service SHALL 同時比對股票代號與公司名稱進行查詢

---

### 需求 2：股票即時報價顯示

**使用者故事：** 身為一位投資人，我想要查看股票的即時報價資訊，以便了解目前的市場狀況。

#### 驗收標準

1. WHEN 一支股票被選取，THE Stock_Detail_Panel SHALL 顯示以下資訊：股票代號、公司名稱、當前股價、漲跌金額、漲跌幅百分比、成交量、開盤價、最高價、最低價
2. WHEN 股價上漲，THE Stock_Detail_Panel SHALL 以紅色顯示漲跌金額與漲跌幅
3. WHEN 股價下跌，THE Stock_Detail_Panel SHALL 以綠色顯示漲跌金額與漲跌幅
4. WHEN 股價與前日收盤價相同，THE Stock_Detail_Panel SHALL 以灰色顯示漲跌金額與漲跌幅
5. THE Stock_Detail_Panel SHALL 顯示資料的最後更新時間
6. IF Data_Service 無法取得即時資料，THEN THE Stock_Detail_Panel SHALL 顯示「資料載入失敗，請稍後再試」的錯誤訊息

---

### 需求 3：股價走勢圖

**使用者故事：** 身為一位投資人，我想要查看股票的歷史走勢圖，以便分析股價趨勢。

#### 驗收標準

1. WHEN 一支股票被選取，THE Price_Chart SHALL 預設顯示近 1 個月的日線股價走勢圖
2. THE Price_Chart SHALL 提供時間區間切換選項，包含：1 週、1 個月、3 個月、6 個月、1 年
3. WHEN 使用者切換時間區間，THE Price_Chart SHALL 在 1 秒內更新並顯示對應區間的走勢圖
4. THE Price_Chart SHALL 在圖表上顯示每個資料點的日期與收盤價
5. WHEN 使用者將滑鼠移至圖表上的資料點，THE Price_Chart SHALL 顯示該日期的開盤價、最高價、最低價、收盤價與成交量
6. IF 指定時間區間內無歷史資料，THEN THE Price_Chart SHALL 顯示「該時間區間無可用資料」的提示訊息

---

### 需求 4：自選股清單

**使用者故事：** 身為一位投資人，我想要建立並管理自選股清單，以便快速追蹤我關注的股票。

#### 驗收標準

1. WHEN 使用者點擊股票詳細頁面上的「加入自選股」按鈕，THE Watchlist SHALL 將該股票加入自選股清單
2. WHEN 一支股票已存在於自選股清單中，THE Stock_Detail_Panel SHALL 將「加入自選股」按鈕顯示為「已加入自選股」狀態
3. WHEN 使用者點擊自選股清單中的「移除」按鈕，THE Watchlist SHALL 將對應股票從清單中移除
4. THE Watchlist SHALL 顯示每支自選股的股票代號、公司名稱、當前股價與漲跌幅
5. THE Stock_Query_App SHALL 將自選股清單儲存於瀏覽器的 localStorage，使資料在頁面重新整理後仍然保留
6. WHEN 自選股清單為空，THE Watchlist SHALL 顯示「尚未加入任何自選股」的提示訊息

---

### 需求 5：市場總覽

**使用者故事：** 身為一位投資人，我想要在首頁看到台灣股市的整體概況，以便快速掌握市場動態。

#### 驗收標準

1. THE Stock_Query_App SHALL 在首頁顯示台灣加權股價指數（TAIEX）的當日指數、漲跌點數與漲跌幅
2. THE Stock_Query_App SHALL 在首頁顯示當日成交量前 10 名的股票清單
3. THE Stock_Query_App SHALL 在首頁顯示當日漲幅前 10 名的股票清單
4. THE Stock_Query_App SHALL 在首頁顯示當日跌幅前 10 名的股票清單
5. WHEN 使用者點擊市場總覽清單中的任一股票，THE Stock_Detail_Panel SHALL 顯示該股票的詳細資訊
6. IF Data_Service 無法取得市場總覽資料，THEN THE Stock_Query_App SHALL 顯示「市場資料暫時無法取得，請稍後再試」的錯誤訊息

---

### 需求 6：響應式介面

**使用者故事：** 身為一位投資人，我想要在不同裝置上都能順暢使用股票查詢功能，以便隨時隨地查詢股票資訊。

#### 驗收標準

1. THE Stock_Query_App SHALL 支援桌面（寬度 ≥ 1024px）、平板（768px ≤ 寬度 < 1024px）與手機（寬度 < 768px）三種版面配置
2. WHILE 在手機版面配置下，THE Stock_Query_App SHALL 以單欄垂直排列方式顯示所有內容
3. WHILE 在桌面版面配置下，THE Stock_Query_App SHALL 以側邊欄顯示自選股清單，主要區域顯示股票詳細資訊
4. THE Price_Chart SHALL 根據容器寬度自動調整圖表尺寸，確保圖表在所有裝置上均可完整顯示

---

### 需求 7：籌碼面與基本面資訊

**使用者故事：** 身為一位投資人，我想要在股票詳細資訊中查看籌碼面與基本面資料，以便評估股票的資金動向與財務健康狀況。

#### 驗收標準

1. WHEN 一支股票被選取，THE Chip_Panel SHALL 顯示以下籌碼面資料：外資買賣超（張）、投信買賣超（張）、自營商買賣超（張）、融資餘額（張）、融資增減（張）、融券餘額（張）、融券增減（張）
2. WHEN 一支股票被選取，THE Fundamental_Panel SHALL 顯示以下基本面資料：近四季 EPS（元）、本益比（倍）、股價淨值比（倍）、最近一期月營收（百萬元）、月營收年增率（%）、毛利率（%）
3. WHEN 法人買賣超為正值，THE Chip_Panel SHALL 以紅色顯示該數值；WHEN 法人買賣超為負值，THE Chip_Panel SHALL 以綠色顯示該數值
4. WHEN 融資餘額增加，THE Chip_Panel SHALL 以紅色顯示融資增減數值；WHEN 融資餘額減少，THE Chip_Panel SHALL 以綠色顯示融資增減數值
5. THE Stock_Detail_Panel SHALL 以分頁（Tab）方式切換顯示「即時報價」、「籌碼面」與「基本面」三個資訊區塊
6. IF Data_Service 無法取得籌碼面資料，THEN THE Chip_Panel SHALL 顯示「籌碼資料暫時無法取得，請稍後再試」的錯誤訊息
7. IF Data_Service 無法取得基本面資料，THEN THE Fundamental_Panel SHALL 顯示「基本面資料暫時無法取得，請稍後再試」的錯誤訊息

---

### 需求 8：AI 智能短期買賣建議

**使用者故事：** 身為一位投資人，我想要在查詢股票時獲得 AI 產生的短期買賣建議，以便參考目標價、法人成本價與適合的進出場價位。

#### 驗收標準

1. WHEN 使用者在股票詳細資訊頁面點擊「AI 智能分析」按鈕，THE AI_Analysis_Service SHALL 將當前股票代號、即時報價、籌碼面資料與基本面資料作為上下文，向 AI 模型發送分析請求
2. WHEN AI_Analysis_Service 收到 AI 模型回應，THE AI_Analysis_Panel SHALL 顯示以下資訊：AI 預測目標價（元）、法人成本價估算（元）、建議短期買入價區間（元）、建議短期賣出價區間（元）、分析摘要說明（不超過 200 字）
3. WHILE AI_Analysis_Service 正在等待 AI 模型回應，THE AI_Analysis_Panel SHALL 顯示載入中動畫，並禁用「AI 智能分析」按鈕以防止重複請求
4. THE AI_Analysis_Panel SHALL 在分析結果下方顯示免責聲明：「本分析結果由 AI 自動產生，僅供參考，不構成投資建議，投資人應自行判斷並承擔投資風險」
5. IF AI_Analysis_Service 未收到 AI 模型回應或回應逾時（超過 30 秒），THEN THE AI_Analysis_Panel SHALL 顯示「AI 分析服務暫時無法使用，請稍後再試」的錯誤訊息，並重新啟用「AI 智能分析」按鈕
6. IF AI 模型回應內容無法解析為有效的分析結果，THEN THE AI_Analysis_Service SHALL 回傳錯誤狀態，THE AI_Analysis_Panel SHALL 顯示「AI 分析結果格式異常，請重新嘗試」的錯誤訊息
7. THE AI_Analysis_Panel SHALL 顯示本次分析的產生時間，使使用者得知分析結果的時效性
