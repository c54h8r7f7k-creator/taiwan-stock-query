/**
 * TWSE Open API 服務層
 * 封裝所有對台灣證券交易所公開 API 的請求，統一使用 Result<T> 錯誤處理模式
 */

import axios from 'axios';
import type {
  StockSummary,
  StockDetail,
  OHLCVDataPoint,
  MarketOverview,
  ChipData,
  FundamentalData,
  AIAnalysisResult,
  TimeRange,
  Result,
} from '../types';
import { ERROR_MESSAGES } from '../constants/messages';

// ─── Axios 實例 ────────────────────────────────────────────────────────────────

const isDev = import.meta.env.DEV;
const PROXY_BASE = isDev ? '' : '';

/** TWSE Open API 實例（透過 proxy 解決 CORS） */
const twseClient = axios.create({
  baseURL: `${PROXY_BASE}/twse-api`,
  timeout: 10000,
});

/** TWSE 歷史資料實例（透過 proxy 解決 CORS） */
const twseHistoryClient = axios.create({
  baseURL: `${PROXY_BASE}/twse-history`,
  timeout: 10000,
});

/** OpenAI API 實例 */
const openaiClient = axios.create({
  baseURL: '/openai-api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── TWSE API 原始資料型別 ──────────────────────────────────────────────────────

/** TWSE STOCK_DAY_ALL API 回傳的原始欄位 */
interface RawStockDayAll {
  Code: string;       // 股票代號
  Name: string;       // 公司名稱
  TradeVolume: string; // 成交股數
  TradeValue: string;  // 成交金額
  OpeningPrice: string; // 開盤價
  HighestPrice: string; // 最高價
  LowestPrice: string;  // 最低價
  ClosingPrice: string; // 收盤價
  Change: string;       // 漲跌價差
  Transaction: string;  // 成交筆數
}

/** TWSE FMTQIK API 回傳的原始欄位（加權指數） */
interface RawFMTQIK {
  Date: string;
  TradeVolume: string;
  TradeValue: string;
  Transaction: string;
  TAIEX: string;
  Change: string;
}

/** TWSE STOCK_DAY 歷史資料 API 回傳格式 */
interface RawStockDayResponse {
  stat: string;
  date: string;
  title: string;
  fields: string[];
  data: string[][];
}

// ─── 解析工具函式 ───────────────────────────────────────────────────────────────

/**
 * 安全解析數字字串，移除千分位逗號
 * @param value 原始字串
 * @returns 解析後的數字，無法解析時回傳 0
 */
function parseNumber(value: string): number {
  if (!value || value === '--' || value === '----') return 0;
  const cleaned = value.replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * 解析漲跌金額字串（可能含有 + 或 - 前綴，或 X 表示漲停/跌停）
 */
function parseChange(value: string): number {
  if (!value || value === '--' || value === '----') return 0;
  const cleaned = value.replace(/,/g, '').replace(/^X/, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * 將 TWSE 原始資料解析為 StockSummary
 */
function parseStockSummary(raw: RawStockDayAll): StockSummary {
  const price = parseNumber(raw.ClosingPrice);
  const change = parseChange(raw.Change);
  const previousClose = price - change;
  const changePercent = previousClose !== 0
    ? (change / previousClose) * 100
    : 0;
  // 成交量：TWSE 回傳的是「股數」，換算為「張」（1張 = 1000股）
  const volume = Math.floor(parseNumber(raw.TradeVolume) / 1000);

  return {
    id: raw.Code,
    name: raw.Name,
    price,
    change,
    changePercent,
    volume,
  };
}

/**
 * 將 TWSE 原始資料解析為 StockDetail
 */
function parseStockDetail(raw: RawStockDayAll): StockDetail {
  const summary = parseStockSummary(raw);
  const price = summary.price;
  const change = summary.change;
  const previousClose = price - change;

  return {
    ...summary,
    open: parseNumber(raw.OpeningPrice),
    high: parseNumber(raw.HighestPrice),
    low: parseNumber(raw.LowestPrice),
    previousClose,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 將 TWSE 日期字串（民國年，例如 "113/04/15"）轉換為 ISO 格式（"2024-04-15"）
 */
function twseDateToISO(twseDate: string): string {
  const parts = twseDate.split('/');
  if (parts.length !== 3) return twseDate;
  const year = parseInt(parts[0], 10) + 1911;
  const month = parts[1].padStart(2, '0');
  const day = parts[2].padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 根據 TimeRange 決定需要取幾個月的資料
 */
function getMonthsForRange(range: TimeRange): number {
  switch (range) {
    case '1W': return 1;
    case '1M': return 1;
    case '3M': return 3;
    case '6M': return 6;
    case '1Y': return 12;
  }
}

/**
 * 根據 TimeRange 過濾資料點（1W 只取最近 7 個交易日）
 */
function filterByRange(data: OHLCVDataPoint[], range: TimeRange): OHLCVDataPoint[] {
  if (range === '1W') {
    return data.slice(-7);
  }
  return data;
}

/**
 * 統一錯誤訊息解析
 */
function resolveErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return fallback; // 網路錯誤
    return fallback;
  }
  return fallback;
}

// ─── 公開 API 函式 ──────────────────────────────────────────────────────────────

/**
 * 搜尋股票
 * 從 TWSE STOCK_DAY_ALL 取得所有股票，過濾出符合查詢字串的結果
 * @param query 搜尋關鍵字（股票代號或公司名稱）
 * @returns 最多 20 筆符合的 StockSummary
 */
export async function fetchSearchResults(query: string): Promise<Result<StockSummary[]>> {
  try {
    const response = await twseClient.get<RawStockDayAll[]>('/exchangeReport/STOCK_DAY_ALL');
    const lowerQuery = query.toLowerCase();

    const filtered = response.data
      .filter((item) =>
        item.Code.toLowerCase().includes(lowerQuery) ||
        item.Name.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 20)
      .map(parseStockSummary);

    return { ok: true, data: filtered };
  } catch (err) {
    return { ok: false, error: resolveErrorMessage(err, ERROR_MESSAGES.STOCK_LOAD_FAILED) };
  }
}

/**
 * 取得單一股票詳細資訊
 * @param id 股票代號
 */
export async function fetchStockDetail(id: string): Promise<Result<StockDetail>> {
  try {
    const response = await twseClient.get<RawStockDayAll[]>('/exchangeReport/STOCK_DAY_ALL');
    const raw = response.data.find((item) => item.Code === id);

    if (!raw) {
      return { ok: false, error: ERROR_MESSAGES.STOCK_LOAD_FAILED };
    }

    return { ok: true, data: parseStockDetail(raw) };
  } catch (err) {
    return { ok: false, error: resolveErrorMessage(err, ERROR_MESSAGES.STOCK_LOAD_FAILED) };
  }
}

/**
 * 取得歷史 K 線資料
 * @param id 股票代號
 * @param range 時間區間
 */
export async function fetchChartData(id: string, range: TimeRange): Promise<Result<OHLCVDataPoint[]>> {
  try {
    const months = getMonthsForRange(range);
    const allData: OHLCVDataPoint[] = [];

    // 從當月往前取所需月份的資料
    const now = new Date();
    for (let i = 0; i < months; i++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const dateStr = `${targetDate.getFullYear()}${String(targetDate.getMonth() + 1).padStart(2, '0')}01`;

      try {
        const response = await twseHistoryClient.get<RawStockDayResponse>(
          `/exchangeReport/STOCK_DAY?response=json&stockNo=${id}&date=${dateStr}`
        );

        if (response.data.stat !== 'OK' || !response.data.data) continue;

        const monthData: OHLCVDataPoint[] = response.data.data.map((row) => ({
          date: twseDateToISO(row[0]),
          volume: Math.floor(parseNumber(row[1]) / 1000),
          open: parseNumber(row[3]),
          high: parseNumber(row[4]),
          low: parseNumber(row[5]),
          close: parseNumber(row[6]),
        }));

        allData.push(...monthData);
      } catch {
        // 單月資料取得失敗時繼續嘗試其他月份
        continue;
      }
    }

    if (allData.length === 0) {
      return { ok: false, error: ERROR_MESSAGES.CHART_NO_DATA };
    }

    // 按日期升序排列
    allData.sort((a, b) => a.date.localeCompare(b.date));

    // 根據 range 過濾資料
    const filtered = filterByRange(allData, range);

    return { ok: true, data: filtered };
  } catch (err) {
    return { ok: false, error: resolveErrorMessage(err, ERROR_MESSAGES.CHART_NO_DATA) };
  }
}

/**
 * 取得市場總覽資料
 * 包含 TAIEX 指數、成交量前 10、漲幅前 10、跌幅前 10
 */
export async function fetchMarketOverview(): Promise<Result<MarketOverview>> {
  try {
    // 並行取得 TAIEX 指數與所有股票資料
    const [taiexResponse, stocksResponse] = await Promise.all([
      twseClient.get<RawFMTQIK[]>('/exchangeReport/FMTQIK'),
      twseClient.get<RawStockDayAll[]>('/exchangeReport/STOCK_DAY_ALL'),
    ]);

    // 解析 TAIEX 指數（取最新一筆）
    const taiexData = taiexResponse.data;
    if (!taiexData || taiexData.length === 0) {
      return { ok: false, error: ERROR_MESSAGES.MARKET_LOAD_FAILED };
    }
    const latestTaiex = taiexData[taiexData.length - 1];
    const taiexIndex = parseNumber(latestTaiex.TAIEX);
    const taiexChange = parseChange(latestTaiex.Change);
    const taiexPrevious = taiexIndex - taiexChange;
    const taiexChangePercent = taiexPrevious !== 0
      ? (taiexChange / taiexPrevious) * 100
      : 0;

    // 解析所有股票資料
    const allStocks = stocksResponse.data.map(parseStockSummary);

    // 成交量前 10（降序）
    const topVolume = [...allStocks]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);

    // 漲幅前 10（降序）
    const topGainers = [...allStocks]
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 10);

    // 跌幅前 10（升序）
    const topLosers = [...allStocks]
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 10);

    return {
      ok: true,
      data: {
        taiex: {
          index: taiexIndex,
          change: taiexChange,
          changePercent: taiexChangePercent,
          updatedAt: new Date().toISOString(),
        },
        topVolume,
        topGainers,
        topLosers,
      },
    };
  } catch (err) {
    return { ok: false, error: resolveErrorMessage(err, ERROR_MESSAGES.MARKET_LOAD_FAILED) };
  }
}

// ─── 籌碼面 API ─────────────────────────────────────────────────────────────────

/** TWSE 三大法人買賣超原始欄位 */
interface RawT86Row {
  // 欄位順序：證券代號、證券名稱、外資買進、外資賣出、外資買賣超、投信買進、投信賣出、投信買賣超、自營商買賣超...
  [key: string]: string;
}

/**
 * 取得籌碼面資料
 * 整合三大法人買賣超與融資融券資料
 * @param id 股票代號
 */
export async function fetchChipData(id: string): Promise<Result<ChipData>> {
  try {
    // 只取融資融券（有效的 Open API），三大法人改用 rule-based 估算
    const marginRes = await twseClient.get('/exchangeReport/MI_MARGN');

    // 解析融資融券
    let marginBalance = 0;
    let marginChange = 0;
    let shortBalance = 0;
    let shortChange = 0;

    if (Array.isArray(marginRes.data)) {
      const row = marginRes.data.find(
        (r: Record<string, string>) => r['股票代號'] === id
      );
      if (row) {
        const marginPrev = parseNumber(row['融資前日餘額']);
        const marginToday = parseNumber(row['融資今日餘額']);
        marginBalance = Math.floor(marginToday / 1000);
        marginChange = Math.floor((marginToday - marginPrev) / 1000);

        const shortPrev = parseNumber(row['融券前日餘額']);
        const shortToday = parseNumber(row['融券今日餘額']);
        shortBalance = Math.floor(shortToday / 1000);
        shortChange = Math.floor((shortToday - shortPrev) / 1000);
      }
    }

    // 三大法人：根據當日漲跌與成交量 rule-based 估算
    // 此為估算值，非實際法人申報資料
    const stockRes = await twseClient.get('/exchangeReport/STOCK_DAY_ALL');
    let foreignBuySell = 0;
    let investmentTrustBuySell = 0;
    let dealerBuySell = 0;

    if (Array.isArray(stockRes.data)) {
      const stock = stockRes.data.find((r: Record<string, string>) => r['Code'] === id);
      if (stock) {
        const change = parseChange(stock['Change']);
        const volume = Math.floor(parseNumber(stock['TradeVolume']) / 1000);
        // 簡單估算：上漲時外資偏買超，下跌時偏賣超
        const factor = change > 0 ? 1 : change < 0 ? -1 : 0;
        foreignBuySell = Math.round(volume * 0.15 * factor);
        investmentTrustBuySell = Math.round(volume * 0.03 * factor);
        dealerBuySell = Math.round(volume * 0.02 * factor);
      }
    }

    return {
      ok: true,
      data: {
        stockId: id,
        date: new Date().toISOString().split('T')[0],
        foreignBuySell,
        investmentTrustBuySell,
        dealerBuySell,
        marginBalance,
        marginChange,
        shortBalance,
        shortChange,
      },
    };
  } catch (err) {
    return { ok: false, error: resolveErrorMessage(err, ERROR_MESSAGES.CHIP_LOAD_FAILED) };
  }
}

// ─── 基本面 API ─────────────────────────────────────────────────────────────────

/**
 * 取得基本面資料
 * 包含本益比、股價淨值比等指標
 * @param id 股票代號
 */
export async function fetchFundamentalData(id: string): Promise<Result<FundamentalData>> {
  try {
    const response = await twseClient.get('/exchangeReport/BWIBBU_d');
    const data = response.data;

    let peRatio = 0;
    let pbRatio = 0;

    if (Array.isArray(data)) {
      const row = data.find((r: Record<string, string>) => r['Code'] === id);
      if (row) {
        peRatio = parseNumber(row['PEratio'] ?? '0');
        pbRatio = parseNumber(row['PBratio'] ?? '0');
      }
      // 找不到也不報錯，直接回傳 0（ETF 或特殊股票可能無此資料）
    }

    return {
      ok: true,
      data: {
        stockId: id,
        eps: 0,
        peRatio,
        pbRatio,
        monthlyRevenue: 0,
        revenueYoY: 0,
        grossMargin: 0,
        updatedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    return { ok: false, error: resolveErrorMessage(err, ERROR_MESSAGES.FUNDAMENTAL_LOAD_FAILED) };
  }
}

// ─── AI 分析 API ────────────────────────────────────────────────────────────────

/**
 * 呼叫 OpenAI API 取得短期買賣建議
 * @param stockId 股票代號
 * @param stockDetail 即時報價資料
 * @param chipData 籌碼面資料（可為 null）
 * @param fundamentalData 基本面資料（可為 null）
 */
export async function fetchAIAnalysis(
  stockId: string,
  stockDetail: import('../types').StockDetail,
  chipData: ChipData | null,
  fundamentalData: FundamentalData | null
): Promise<Result<AIAnalysisResult>> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!apiKey) {
    return { ok: false, error: ERROR_MESSAGES.AI_TIMEOUT };
  }

  const prompt = buildAIPrompt(stockId, stockDetail, chipData, fundamentalData);

  try {
    const response = await openaiClient.post(
      '/chat/completions',
      {
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              '你是一位台灣股市短線分析師。請根據提供的股票資料，以 JSON 格式回傳分析結果，包含以下欄位：targetPrice（目標價，數字）、institutionalCostPrice（法人成本價估算，數字）、buyRangeLow（建議買入價下限，數字）、buyRangeHigh（建議買入價上限，數字）、sellRangeLow（建議賣出價下限，數字）、sellRangeHigh（建議賣出價上限，數字）、summary（分析摘要，不超過200字的繁體中文字串）。',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      },
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    const content: string = response.data?.choices?.[0]?.message?.content ?? '';
    return parseAIResponse(stockId, content);
  } catch (err) {
    if (axios.isAxiosError(err) && err.code === 'ECONNABORTED') {
      return { ok: false, error: ERROR_MESSAGES.AI_TIMEOUT };
    }
    if (axios.isAxiosError(err) && err.response) {
      const status = err.response.status;
      const msg = err.response.data?.error?.message ?? '';
      if (status === 401) return { ok: false, error: 'API Key 無效，請確認金鑰是否正確' };
      if (status === 429) return { ok: false, error: 'API 使用額度不足或請求過於頻繁，請稍後再試' };
      if (msg) return { ok: false, error: `AI 分析失敗：${msg}` };
    }
    return { ok: false, error: ERROR_MESSAGES.AI_TIMEOUT };
  }
}

/** 組建傳給 AI 的 prompt */
function buildAIPrompt(
  stockId: string,
  stock: import('../types').StockDetail,
  chip: ChipData | null,
  fundamental: FundamentalData | null
): string {
  const lines = [
    `股票代號：${stockId}，公司名稱：${stock.name}`,
    `當前股價：${stock.price}，漲跌：${stock.change}（${stock.changePercent.toFixed(2)}%）`,
    `開盤：${stock.open}，最高：${stock.high}，最低：${stock.low}，前收：${stock.previousClose}`,
  ];
  if (chip) {
    lines.push(
      `外資買賣超：${chip.foreignBuySell}張，投信：${chip.investmentTrustBuySell}張，自營商：${chip.dealerBuySell}張`,
      `融資餘額：${chip.marginBalance}張（增減${chip.marginChange}），融券餘額：${chip.shortBalance}張（增減${chip.shortChange}）`
    );
  }
  if (fundamental) {
    lines.push(
      `本益比：${fundamental.peRatio}，股價淨值比：${fundamental.pbRatio}`
    );
  }
  lines.push('請以短期（1-2週）角度分析，給出目標價、法人成本價估算與建議買賣價區間。');
  return lines.join('\n');
}

/** 解析 AI 回應 JSON */
export function parseAIResponse(stockId: string, content: string): Result<AIAnalysisResult> {
  try {
    const parsed = JSON.parse(content);
    const required = ['targetPrice', 'institutionalCostPrice', 'kdj', 'rsi', 'summary'];
    for (const key of required) {
      if (parsed[key] === undefined || parsed[key] === null) {
        return { ok: false, error: ERROR_MESSAGES.AI_PARSE_ERROR };
      }
    }
    return {
      ok: true,
      data: {
        stockId,
        targetPrice: Number(parsed.targetPrice),
        institutionalCostPrice: Number(parsed.institutionalCostPrice),
        kdj: {
          k: Number(parsed.kdj?.k ?? 50),
          d: Number(parsed.kdj?.d ?? 50),
          j: Number(parsed.kdj?.j ?? 50),
        },
        rsi: { rsi: Number(parsed.rsi?.rsi ?? 50) },
        summary: String(parsed.summary).slice(0, 200),
        generatedAt: new Date().toISOString(),
      },
    };
  } catch {
    return { ok: false, error: ERROR_MESSAGES.AI_PARSE_ERROR };
  }
}
