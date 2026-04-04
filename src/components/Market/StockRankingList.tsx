/**
 * 股票排行榜元件
 * 顯示成交量/漲幅/跌幅排行榜，支援點擊跳轉至股票詳情
 */

import type { StockSummary } from '../../types';
import { getPriceDirection } from '../../utils/priceUtils';

interface StockRankingListProps {
  /** 排行榜標題 */
  title: string;
  /** 排行榜股票清單 */
  stocks: StockSummary[];
  /** 點擊股票時的回呼函式 */
  onStockSelect: (id: string) => void;
}

/** 根據漲跌方向回傳顏色 class */
function getChangeColorClass(change: number): string {
  const direction = getPriceDirection(change);
  if (direction === 'up') return 'text-red-500';
  if (direction === 'down') return 'text-green-500';
  return 'text-gray-500';
}

export function StockRankingList({ title, stocks, onStockSelect }: StockRankingListProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      </div>
      <ul>
        {stocks.map((stock, index) => {
          const changeSign = stock.change >= 0 ? '+' : '';
          const colorClass = getChangeColorClass(stock.change);

          return (
            <li key={stock.id}>
              <button
                type="button"
                onClick={() => onStockSelect(stock.id)}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                {/* 排名 */}
                <span className="text-xs text-gray-400 w-4 shrink-0">{index + 1}</span>
                {/* 代號與名稱 */}
                <div className="flex-1 min-w-0">
                  <span className="font-mono font-semibold text-gray-800 text-sm">{stock.id}</span>
                  <span className="text-gray-500 text-xs ml-1.5 truncate">{stock.name}</span>
                </div>
                {/* 股價與漲跌幅 */}
                <div className="text-right shrink-0">
                  <div className="font-semibold text-gray-800 text-sm">{stock.price.toFixed(2)}</div>
                  <div className={`text-xs ${colorClass}`}>
                    {changeSign}{stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
