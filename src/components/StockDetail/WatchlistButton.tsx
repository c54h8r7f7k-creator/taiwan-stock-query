/**
 * 自選股按鈕元件
 * 依據股票是否已在自選股清單中，切換「加入」或「已加入」狀態
 */

import { useWatchlistStore } from '../../stores/watchlistStore';

interface WatchlistButtonProps {
  /** 股票代號 */
  stockId: string;
}

export function WatchlistButton({ stockId }: WatchlistButtonProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  const inWatchlist = isInWatchlist(stockId);

  const handleClick = () => {
    if (inWatchlist) {
      removeFromWatchlist(stockId);
    } else {
      addToWatchlist(stockId);
    }
  };

  return inWatchlist ? (
    <button
      type="button"
      onClick={handleClick}
      className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
    >
      ✓ 已加入自選股
    </button>
  ) : (
    <button
      type="button"
      onClick={handleClick}
      className="px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
    >
      + 加入自選股
    </button>
  );
}
