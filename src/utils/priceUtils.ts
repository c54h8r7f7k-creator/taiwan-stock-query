/**
 * 股價工具函式
 * 提供與股價方向、顏色判斷相關的純函式
 */

import type { PriceDirection } from '../types';

/**
 * 根據漲跌金額判斷價格方向
 * @param change 漲跌金額（正數為漲、負數為跌、零為平盤）
 * @returns PriceDirection - 'up' | 'down' | 'flat'
 */
export function getPriceDirection(change: number): PriceDirection {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'flat';
}

/**
 * 根據籌碼面數值（買賣超、融資增減）判斷顯示顏色
 * 正值（買超/增加）→ 紅色，負值（賣超/減少）→ 綠色，零 → 灰色
 * @param value 數值
 * @returns 'red' | 'green' | 'gray'
 */
export function getChipColor(value: number): 'red' | 'green' | 'gray' {
  if (value > 0) return 'red';
  if (value < 0) return 'green';
  return 'gray';
}
