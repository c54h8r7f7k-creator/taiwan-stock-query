/**
 * App 根元件
 */

import { useState } from 'react';
import type { StockSummary } from './types';
import { Header } from './components/Layout/Header';
import { Layout } from './components/Layout/Layout';
import { MarketOverview } from './components/Market/MarketOverview';
import { StockDetailPanel } from './components/StockDetail/StockDetailPanel';
import { PriceChart } from './components/Chart/PriceChart';
import { Watchlist } from './components/Watchlist/Watchlist';
import { LoginPage } from './components/Auth/LoginPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);

  const handleStockSelectFromSearch = (stock: StockSummary) => {
    setSelectedStockId(stock.id);
  };

  const handleStockSelectById = (stockId: string) => {
    setSelectedStockId(stockId);
  };

  const handleBack = () => {
    setSelectedStockId(null);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onStockSelect={handleStockSelectFromSearch} />
      <Layout onStockSelect={handleStockSelectById}>
        {selectedStockId ? (
          <>
            <button
              onClick={handleBack}
              className="mb-3 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← 返回
            </button>
            <StockDetailPanel stockId={selectedStockId} />
            <PriceChart />
          </>
        ) : (
          <MarketOverview onStockSelect={handleStockSelectById} />
        )}
        <div className="lg:hidden">
          <Watchlist onStockSelect={handleStockSelectById} />
        </div>
      </Layout>
    </div>
  );
}

export default App;
