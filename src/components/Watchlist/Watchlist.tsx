/**
 * 自選股清單元件
 * 列出所有自選股，支援點擊查看詳情與移除操作
 */

import { useEffect } from 'react';
import { useWatchlistStore } from '../../stores/watchlistStore';
import { WatchlistItem } from './WatchlistItem';

interface WatchlistProps {
  /** 選取股票時的回呼函式 */
  onStockSelect: (stockId: string) => void;
}

export function Watchlist({ onStockSelect }: WatchlistProps) {
  const { entries, stockData, removeFromWatchlist, refreshPrices } = useWatchlistStore();

  // 掛載時載入自選股即時股價
  useEffect(() => {
    if (entries.length > 0) {
      refreshPrices();
    }
  }, [entries.length, refreshPrices]);

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800 text-sm">自選股</h2>
      </div>

      {entries.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-400 text-sm">
          尚未加入任何自選股
        </div>
      ) : (
        <div className="p-2">
          {entries.map((entry) => (
            <WatchlistItem
              key={entry.id}
              entry={entry}
              stockData={stockData[entry.id]}
              onSelect={() => onStockSelect(entry.id)}
              onRemove={() => removeFromWatchlist(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
