/**
 * 市場總覽元件（組合元件）
 * 整合加權指數卡片與三個排行榜，連接 marketStore
 */

import { useEffect } from 'react';
import { useMarketStore } from '../../stores/marketStore';
import { ERROR_MESSAGES } from '../../constants/messages';
import { IndexCard } from './IndexCard';
import { StockRankingList } from './StockRankingList';

interface MarketOverviewProps {
  /** 選取股票時的回呼函式 */
  onStockSelect: (stockId: string) => void;
}

export function MarketOverview({ onStockSelect }: MarketOverviewProps) {
  const { overview, isLoading, error, fetchOverview } = useMarketStore();

  // 掛載時載入市場總覽資料
  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // 載入中
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 載入失敗
  if (error || !overview) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-red-500">
        {ERROR_MESSAGES.MARKET_LOAD_FAILED}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 加權指數卡片 */}
      <IndexCard taiex={overview.taiex} />

      {/* 三個排行榜 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StockRankingList
          title="成交量排行"
          stocks={overview.topVolume}
          onStockSelect={onStockSelect}
        />
        <StockRankingList
          title="漲幅排行"
          stocks={overview.topGainers}
          onStockSelect={onStockSelect}
        />
        <StockRankingList
          title="跌幅排行"
          stocks={overview.topLosers}
          onStockSelect={onStockSelect}
        />
      </div>
    </div>
  );
}
