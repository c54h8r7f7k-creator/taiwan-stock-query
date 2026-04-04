/**
 * 自選股清單項目元件
 * 顯示單一自選股的代號、名稱、股價、漲跌幅，並提供移除按鈕
 */

import type { WatchlistEntry, StockSummary } from '../../types';
import { getPriceDirection } from '../../utils/priceUtils';

interface WatchlistItemProps {
  /** 自選股條目 */
  entry: WatchlistEntry;
  /** 對應的即時股票資料（可能尚未載入） */
  stockData: StockSummary | undefined;
  /** 點擊股票時的回呼函式 */
  onSelect: () => void;
  /** 點擊移除時的回呼函式 */
  onRemove: () => void;
}

/** 根據漲跌方向回傳顏色 class */
function getChangeColorClass(change: number): string {
  const direction = getPriceDirection(change);
  if (direction === 'up') return 'text-red-500';
  if (direction === 'down') return 'text-green-500';
  return 'text-gray-500';
}

export function WatchlistItem({ entry, stockData, onSelect, onRemove }: WatchlistItemProps) {
  const changeSign = stockData && stockData.change >= 0 ? '+' : '';

  return (
    <div className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors">
      {/* 左側：可點擊的股票資訊 */}
      <button
        type="button"
        onClick={onSelect}
        className="flex-1 flex items-center justify-between text-left min-w-0 mr-2"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-semibold text-gray-800 text-sm">{entry.id}</span>
            {stockData && (
              <span className="text-gray-500 text-xs truncate">{stockData.name}</span>
            )}
          </div>
        </div>
        {stockData ? (
          <div className="text-right ml-2 shrink-0">
            <div className="font-semibold text-gray-800 text-sm">{stockData.price.toFixed(2)}</div>
            <div className={`text-xs ${getChangeColorClass(stockData.change)}`}>
              {changeSign}{stockData.changePercent.toFixed(2)}%
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-400">載入中...</div>
        )}
      </button>

      {/* 移除按鈕 */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="text-gray-400 hover:text-red-500 transition-colors text-xs px-1.5 py-1 rounded"
        aria-label={`移除 ${entry.id}`}
      >
        移除
      </button>
    </div>
  );
}
