/**
 * Rule-based 短期技術分析工具
 * 根據即時報價、籌碼面資料計算目標價、法人成本價與買賣建議
 */

import type { StockDetail, ChipData, AIAnalysisResult } from '../types';

/**
 * 四捨五入到小數點後兩位
 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * 計算法人成本價估算
 * 邏輯：若三大法人合計為買超，成本價略低於現價（假設近期買進）
 *       若為賣超，成本價略高於現價（假設高點買進）
 */
function calcInstitutionalCost(stock: StockDetail, chip: ChipData | null): number {
  if (!chip) {
    // 無籌碼資料：用前收盤價估算
    return round2(stock.previousClose * 0.98);
  }
  const netBuySell = chip.foreignBuySell + chip.investmentTrustBuySell + chip.dealerBuySell;
  if (netBuySell > 0) {
    // 法人買超：成本價約在現價 -2% ~ -5% 之間
    return round2(stock.price * 0.97);
  } else if (netBuySell < 0) {
    // 法人賣超：成本價約在現價 +3% ~ +8% 之間（高點買進）
    return round2(stock.price * 1.05);
  }
  return round2(stock.previousClose);
}

/**
 * 計算短期目標價
 * 邏輯：以當日最高價為基礎，加上近期波動幅度的延伸
 *       若今日上漲，目標價 = 最高價 × 1.03（上漲動能延伸）
 *       若今日下跌，目標價 = 前收 × 1.02（反彈目標）
 */
function calcTargetPrice(stock: StockDetail): number {
  const range = stock.high - stock.low; // 今日振幅
  if (stock.change >= 0) {
    // 上漲趨勢：目標價 = 最高價 + 振幅 × 0.5
    return round2(stock.high + range * 0.5);
  } else {
    // 下跌趨勢：目標價 = 前收 × 1.02（反彈至前收附近）
    return round2(stock.previousClose * 1.02);
  }
}

/**
 * 計算短期買入區間
 * 邏輯：支撐區 = 今日最低價附近，下限為最低價 -1%，上限為最低價 +1.5%
 *       若融資增加（散戶追多），買入區間略往下調（等回測）
 */
function calcBuyRange(stock: StockDetail, chip: ChipData | null): [number, number] {
  let base = stock.low;

  // 若融資大幅增加，代表散戶追高，等回測再買
  if (chip && chip.marginChange > 500) {
    base = stock.low * 0.99;
  }

  return [round2(base * 0.99), round2(base * 1.015)];
}

/**
 * 計算短期賣出區間
 * 邏輯：壓力區 = 今日最高價附近，下限為最高價 -0.5%，上限為最高價 +1%
 *       若法人賣超，壓力更強，賣出區間往下調
 */
function calcSellRange(stock: StockDetail, chip: ChipData | null): [number, number] {
  let base = stock.high;

  if (chip) {
    const netBuySell = chip.foreignBuySell + chip.investmentTrustBuySell + chip.dealerBuySell;
    if (netBuySell < -200) {
      // 法人大幅賣超，壓力提前出現
      base = stock.high * 0.98;
    }
  }

  return [round2(base * 0.995), round2(base * 1.01)];
}

/**
 * 產生分析摘要
 */
function buildSummary(stock: StockDetail, chip: ChipData | null): string {
  const parts: string[] = [];

  // 趨勢判斷
  if (stock.change > 0) {
    parts.push(`${stock.name} 今日上漲 ${stock.changePercent.toFixed(2)}%，短線偏多。`);
  } else if (stock.change < 0) {
    parts.push(`${stock.name} 今日下跌 ${Math.abs(stock.changePercent).toFixed(2)}%，短線偏空。`);
  } else {
    parts.push(`${stock.name} 今日平盤，方向待確認。`);
  }

  // 籌碼判斷
  if (chip) {
    const net = chip.foreignBuySell + chip.investmentTrustBuySell + chip.dealerBuySell;
    if (net > 0) {
      parts.push(`三大法人合計買超 ${net.toLocaleString()} 張，籌碼偏向多方。`);
    } else if (net < 0) {
      parts.push(`三大法人合計賣超 ${Math.abs(net).toLocaleString()} 張，籌碼偏向空方。`);
    }
    if (chip.marginChange > 0) {
      parts.push(`融資增加 ${chip.marginChange} 張，留意追高風險。`);
    } else if (chip.marginChange < 0) {
      parts.push(`融資減少 ${Math.abs(chip.marginChange)} 張，籌碼趨於健康。`);
    }
  }

  return parts.join('');
}

/**
 * 主要計算函式：根據即時報價與籌碼面資料產生分析結果
 */
export function calcRuleBasedAnalysis(
  stockId: string,
  stock: StockDetail,
  chip: ChipData | null
): AIAnalysisResult {
  const targetPrice = calcTargetPrice(stock);
  const institutionalCostPrice = calcInstitutionalCost(stock, chip);
  const [buyRangeLow, buyRangeHigh] = calcBuyRange(stock, chip);
  const [sellRangeLow, sellRangeHigh] = calcSellRange(stock, chip);
  const summary = buildSummary(stock, chip);

  return {
    stockId,
    targetPrice,
    institutionalCostPrice,
    buyRangeLow,
    buyRangeHigh,
    sellRangeLow,
    sellRangeHigh,
    summary,
    generatedAt: new Date().toISOString(),
  };
}
