/**
 * 錯誤訊息常數
 * 統一管理應用程式中所有顯示給使用者的錯誤與提示訊息
 */
export const ERROR_MESSAGES = {
  /** 搜尋無結果時的提示訊息 */
  SEARCH_NO_RESULT: '查無符合的股票，請確認股票代號或名稱',
  /** 股票資料載入失敗時的錯誤訊息 */
  STOCK_LOAD_FAILED: '資料載入失敗，請稍後再試',
  /** 圖表無歷史資料時的提示訊息 */
  CHART_NO_DATA: '該時間區間無可用資料',
  /** 市場總覽資料載入失敗時的錯誤訊息 */
  MARKET_LOAD_FAILED: '市場資料暫時無法取得，請稍後再試',
  /** 籌碼面資料載入失敗時的錯誤訊息 */
  CHIP_LOAD_FAILED: '籌碼資料暫時無法取得，請稍後再試',
  /** 基本面資料載入失敗時的錯誤訊息 */
  FUNDAMENTAL_LOAD_FAILED: '基本面資料暫時無法取得，請稍後再試',
  /** AI 分析逾時錯誤訊息 */
  AI_TIMEOUT: 'AI 分析服務暫時無法使用，請稍後再試',
  /** AI 回應格式異常錯誤訊息 */
  AI_PARSE_ERROR: 'AI 分析結果格式異常，請重新嘗試',
} as const;
