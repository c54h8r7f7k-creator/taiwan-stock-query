/**
 * App 根元件
 * 組合所有功能元件，管理選取股票狀態，連接所有 onStockSelect 事件
 */

import { useState } from 'react';
import type { StockSummary } from './types';
import { Header } from './components/Layout/Header';
import { Layout } from './components/Layout/Layout';
import { MarketOverview } from './components/Market/MarketOverview';
import { StockDetailPanel } from './components/StockDetail/StockDetailPanel';
import { PriceChart } from './components/Chart/PriceChart';
import { Watchlist } from './components/Watchlist/Watchlist';

function App() {
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);

  /** 從搜尋元件選取股票（接收 StockSummary） */
  const handleStockSelectFromSearch = (stock: StockSummary) => {
    setSelectedStockId(stock.id);
  };

  /** 從排行榜或自選股選取股票（接收 stockId 字串） */
  const handleStockSelectById = (stockId: string) => {
    setSelectedStockId(stockId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁首：標題 + 搜尋 */}
      <Header onStockSelect={handleStockSelectFromSearch} />

      {/* 主版面：桌面左側 Sidebar + 右側主內容 */}
      <Layout onStockSelect={handleStockSelectById}>
        {/* 桌面版：顯示市場總覽或股票詳情+圖表 */}
        {selectedStockId ? (
          <>
            <StockDetailPanel stockId={selectedStockId} />
            <PriceChart />
          </>
        ) : (
          <MarketOverview onStockSelect={handleStockSelectById} />
        )}

        {/* 手機/平板版：Watchlist 顯示在底部（桌面版由 Sidebar 處理） */}
        <div className="lg:hidden">
          <Watchlist onStockSelect={handleStockSelectById} />
        </div>
      </Layout>
    </div>
  );
}

export default App;
