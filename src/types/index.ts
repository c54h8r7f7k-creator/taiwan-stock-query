/**
 * 核心型別定義
 * 台灣股票查詢應用程式所使用的所有共用型別
 */

/** 股票摘要（用於搜尋建議、自選股清單、排行榜） */
export interface StockSummary {
  /** 股票代號，例如 "2330" */
  id: string;
  /** 公司名稱，例如 "台積電" */
  name: string;
  /** 當前股價 */
  price: number;
  /** 漲跌金額 */
  change: number;
  /** 漲跌幅百分比 */
  changePercent: number;
  /** 成交量（張） */
  volume: number;
}

/** 股票詳細資訊 */
export interface StockDetail extends StockSummary {
  /** 開盤價 */
  open: number;
  /** 最高價 */
  high: number;
  /** 最低價 */
  low: number;
  /** 前日收盤價 */
  previousClose: number;
  /** 最後更新時間（ISO 8601） */
  updatedAt: string;
}

/** 歷史 K 線資料點 */
export interface OHLCVDataPoint {
  /** 日期（YYYY-MM-DD） */
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** 市場總覽 */
export interface MarketOverview {
  taiex: {
    /** 加權指數 */
    index: number;
    /** 漲跌點數 */
    change: number;
    changePercent: number;
    updatedAt: string;
  };
  /** 成交量前 10 */
  topVolume: StockSummary[];
  /** 漲幅前 10 */
  topGainers: StockSummary[];
  /** 跌幅前 10 */
  topLosers: StockSummary[];
}

/** 自選股（儲存於 localStorage） */
export interface WatchlistEntry {
  /** 股票代號 */
  id: string;
  /** 加入時間（ISO 8601） */
  addedAt: string;
}

/** 時間區間選項 */
export type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y';

/** 價格方向（用於顏色判斷） */
export type PriceDirection = 'up' | 'down' | 'flat';

/** 統一錯誤處理型別，所有 API 呼叫皆回傳此型別 */
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

/** 籌碼面資料 */
export interface ChipData {
  stockId: string;
  /** 資料日期（YYYY-MM-DD） */
  date: string;
  /** 外資買賣超（張，正為買超，負為賣超） */
  foreignBuySell: number;
  /** 投信買賣超（張） */
  investmentTrustBuySell: number;
  /** 自營商買賣超（張） */
  dealerBuySell: number;
  /** 融資餘額（張） */
  marginBalance: number;
  /** 融資增減（張） */
  marginChange: number;
  /** 融券餘額（張） */
  shortBalance: number;
  /** 融券增減（張） */
  shortChange: number;
}

/** 基本面資料 */
export interface FundamentalData {
  stockId: string;
  /** 近四季 EPS（元） */
  eps: number;
  /** 本益比（倍） */
  peRatio: number;
  /** 股價淨值比（倍） */
  pbRatio: number;
  /** 最近一期月營收（百萬元） */
  monthlyRevenue: number;
  /** 月營收年增率（%） */
  revenueYoY: number;
  /** 毛利率（%） */
  grossMargin: number;
  /** 資料更新時間（ISO 8601） */
  updatedAt: string;
}

/** AI 分析結果 */
export interface AIAnalysisResult {
  stockId: string;
  /** AI 預測目標價（元） */
  targetPrice: number;
  /** 法人成本價估算（元） */
  institutionalCostPrice: number;
  /** 建議短期買入價區間下限（元） */
  buyRangeLow: number;
  /** 建議短期買入價區間上限（元） */
  buyRangeHigh: number;
  /** 建議短期賣出價區間下限（元） */
  sellRangeLow: number;
  /** 建議短期賣出價區間上限（元） */
  sellRangeHigh: number;
  /** 分析摘要說明（不超過 200 字） */
  summary: string;
  /** 分析產生時間（ISO 8601） */
  generatedAt: string;
}
