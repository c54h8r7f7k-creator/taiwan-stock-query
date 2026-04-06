/**
 * Rule-based 短期技術分析工具
 * 根據即時報價、籌碼面資料計算目標價、法人成本價、KDJ、RSI
 */

import type { StockDetail, ChipData, AIAnalysisResult, OHLCVDataPoint, KDJResult, RSIResult } from '../types';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── KDJ(9) ────────────────────────────────────────────────────────────────────

/**
 * 計算 KDJ 指標（參數 n=9）
 * 使用歷史 OHLCV 資料，若資料不足則用即時報價單點估算
 */
export function calcKDJ(candles: OHLCVDataPoint[], n = 9): KDJResult {
  if (candles.length < n) {
    // 資料不足：回傳中性值
    return { k: 50, d: 50, j: 50 };
  }

  let k = 50;
  let d = 50;

  for (let i = n - 1; i < candles.length; i++) {
    const window = candles.slice(i - n + 1, i + 1);
    const highN = Math.max(...window.map((c) => c.high));
    const lowN = Math.min(...window.map((c) => c.low));
    const close = candles[i].close;

    const rsv = highN === lowN ? 50 : ((close - lowN) / (highN - lowN)) * 100;
    k = (2 / 3) * k + (1 / 3) * rsv;
    d = (2 / 3) * d + (1 / 3) * k;
  }

  const j = 3 * k - 2 * d;

  return {
    k: round2(k),
    d: round2(d),
    j: round2(j),
  };
}

// ─── RSI(14) ───────────────────────────────────────────────────────────────────

/**
 * 計算 RSI 指標（參數 n=14）
 * 使用歷史收盤價序列
 */
export function calcRSI(candles: OHLCVDataPoint[], n = 14): RSIResult {
  if (candles.length < n + 1) {
    return { rsi: 50 };
  }

  const closes = candles.map((c) => c.close);
  let avgGain = 0;
  let avgLoss = 0;

  // 初始平均漲跌（前 n 期）
  for (let i = 1; i <= n; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) avgGain += diff;
    else avgLoss += Math.abs(diff);
  }
  avgGain /= n;
  avgLoss /= n;

  // Wilder 平滑
  for (let i = n + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;
    avgGain = (avgGain * (n - 1) + gain) / n;
    avgLoss = (avgLoss * (n - 1) + loss) / n;
  }

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = round2(100 - 100 / (1 + rs));

  return { rsi };
}

// ─── 均線計算（供圖表使用）────────────────────────────────────────────────────────

/**
 * 計算簡單移動平均線
 * @returns 與 candles 等長的陣列，前 n-1 筆為 null
 */
export function calcMA(candles: OHLCVDataPoint[], n: number): (number | null)[] {
  return candles.map((_, i) => {
    if (i < n - 1) return null;
    const sum = candles.slice(i - n + 1, i + 1).reduce((acc, c) => acc + c.close, 0);
    return round2(sum / n);
  });
}

// ─── 圖表指標資料點（供 ChartCanvas 使用）──────────────────────────────────────────

export interface ChartIndicatorPoint {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  ma5: number | null;
  ma20: number | null;
  rsi: number | null;
  k: number | null;
  d: number | null;
  j: number | null;
}

/**
 * 將 OHLCV 資料附加所有指標，一次計算完畢供圖表使用
 */
export function buildChartIndicators(candles: OHLCVDataPoint[]): ChartIndicatorPoint[] {
  const ma5 = calcMA(candles, 5);
  const ma20 = calcMA(candles, 20);

  // RSI 逐點計算
  const rsiArr: (number | null)[] = candles.map((_, i) => {
    if (i < 15) return null;
    const slice = candles.slice(0, i + 1);
    return calcRSI(slice, 14).rsi;
  });

  // KDJ 逐點計算
  const kArr: (number | null)[] = [];
  const dArr: (number | null)[] = [];
  const jArr: (number | null)[] = [];

  let k = 50;
  let d = 50;
  const n = 9;

  candles.forEach((_, i) => {
    if (i < n - 1) {
      kArr.push(null);
      dArr.push(null);
      jArr.push(null);
      return;
    }
    const window = candles.slice(i - n + 1, i + 1);
    const highN = Math.max(...window.map((c) => c.high));
    const lowN = Math.min(...window.map((c) => c.low));
    const close = candles[i].close;
    const rsv = highN === lowN ? 50 : ((close - lowN) / (highN - lowN)) * 100;
    k = (2 / 3) * k + (1 / 3) * rsv;
    d = (2 / 3) * d + (1 / 3) * k;
    const j = 3 * k - 2 * d;
    kArr.push(round2(k));
    dArr.push(round2(d));
    jArr.push(round2(j));
  });

  return candles.map((c, i) => ({
    date: c.date,
    close: c.close,
    open: c.open,
    high: c.high,
    low: c.low,
    volume: c.volume,
    ma5: ma5[i],
    ma20: ma20[i],
    rsi: rsiArr[i],
    k: kArr[i],
    d: dArr[i],
    j: jArr[i],
  }));
}

// ─── 法人成本價 / 目標價 ────────────────────────────────────────────────────────

function calcInstitutionalCost(stock: StockDetail, chip: ChipData | null): number {
  if (!chip) return round2(stock.previousClose * 0.98);
  const net = chip.foreignBuySell + chip.investmentTrustBuySell + chip.dealerBuySell;
  if (net > 0) return round2(stock.price * 0.97);
  if (net < 0) return round2(stock.price * 1.05);
  return round2(stock.previousClose);
}

function calcTargetPrice(stock: StockDetail): number {
  const range = stock.high - stock.low;
  return stock.change >= 0
    ? round2(stock.high + range * 0.5)
    : round2(stock.previousClose * 1.02);
}

function buildSummary(stock: StockDetail, chip: ChipData | null, kdj: KDJResult, rsi: RSIResult): string {
  const parts: string[] = [];

  if (stock.change > 0) {
    parts.push(`${stock.name} 今日上漲 ${stock.changePercent.toFixed(2)}%，短線偏多。`);
  } else if (stock.change < 0) {
    parts.push(`${stock.name} 今日下跌 ${Math.abs(stock.changePercent).toFixed(2)}%，短線偏空。`);
  } else {
    parts.push(`${stock.name} 今日平盤，方向待確認。`);
  }

  if (chip) {
    const net = chip.foreignBuySell + chip.investmentTrustBuySell + chip.dealerBuySell;
    if (net > 0) parts.push(`三大法人合計買超 ${net.toLocaleString()} 張，籌碼偏向多方。`);
    else if (net < 0) parts.push(`三大法人合計賣超 ${Math.abs(net).toLocaleString()} 張，籌碼偏向空方。`);
    if (chip.marginChange > 0) parts.push(`融資增加 ${chip.marginChange} 張，留意追高風險。`);
    else if (chip.marginChange < 0) parts.push(`融資減少 ${Math.abs(chip.marginChange)} 張，籌碼趨於健康。`);
  }

  // KDJ 訊號
  if (kdj.j < 20) parts.push(`KDJ J值 ${kdj.j} 進入超賣區，留意反彈機會。`);
  else if (kdj.j > 80) parts.push(`KDJ J值 ${kdj.j} 進入超買區，留意回檔風險。`);

  // RSI 訊號
  if (rsi.rsi < 30) parts.push(`RSI ${rsi.rsi} 低於 30，超賣訊號。`);
  else if (rsi.rsi > 70) parts.push(`RSI ${rsi.rsi} 高於 70，超買訊號。`);

  return parts.join('');
}

/**
 * 主要計算函式
 * candles 為歷史 K 線資料（用於計算 KDJ/RSI），若無則用單點估算
 */
export function calcRuleBasedAnalysis(
  stockId: string,
  stock: StockDetail,
  chip: ChipData | null,
  candles: OHLCVDataPoint[] = []
): AIAnalysisResult {
  const targetPrice = calcTargetPrice(stock);
  const institutionalCostPrice = calcInstitutionalCost(stock, chip);
  const kdj = calcKDJ(candles);
  const rsi = calcRSI(candles);
  const summary = buildSummary(stock, chip, kdj, rsi);

  return {
    stockId,
    targetPrice,
    institutionalCostPrice,
    kdj,
    rsi,
    summary,
    generatedAt: new Date().toISOString(),
  };
}
