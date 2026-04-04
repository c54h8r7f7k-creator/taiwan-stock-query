/**
 * 加權指數卡片元件
 * 顯示 TAIEX 指數數值、漲跌點數、漲跌幅與更新時間
 */

import type { MarketOverview } from '../../types';
import { getPriceDirection } from '../../utils/priceUtils';

interface IndexCardProps {
  /** TAIEX 指數資料 */
  taiex: MarketOverview['taiex'];
}

/** 根據漲跌方向回傳顏色 class */
function getColorClass(change: number): string {
  const direction = getPriceDirection(change);
  if (direction === 'up') return 'text-red-500';
  if (direction === 'down') return 'text-green-500';
  return 'text-gray-500';
}

/** 格式化更新時間 */
function formatTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString('zh-TW', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function IndexCard({ taiex }: IndexCardProps) {
  const colorClass = getColorClass(taiex.change);
  const changeSign = taiex.change >= 0 ? '+' : '';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="text-sm text-gray-500 mb-1">加權指數（TAIEX）</div>
      <div className="text-3xl font-bold text-gray-800 mb-1">
        {taiex.index.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className={`text-base font-semibold ${colorClass}`}>
        {changeSign}{taiex.change.toFixed(2)}
        {' '}
        ({changeSign}{taiex.changePercent.toFixed(2)}%)
      </div>
      <div className="text-xs text-gray-400 mt-2">
        更新時間：{formatTime(taiex.updatedAt)}
      </div>
    </div>
  );
}
