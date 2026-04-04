/**
 * 股票詳情面板元件
 * 顯示選取股票的完整即時資訊，包含股價、漲跌、成交量與 OHLC 資料
 * 以 Tab 方式切換即時報價、籌碼面、基本面與 AI 分析
 */

import { useEffect, useState } from 'react';
import { useStockStore } from '../../stores/stockStore';
import { useAIAnalysisStore } from '../../stores/aiAnalysisStore';
import { getPriceDirection } from '../../utils/priceUtils';
import { ERROR_MESSAGES } from '../../constants/messages';
import { WatchlistButton } from './WatchlistButton';
import { ChipPanel } from './ChipPanel';
import { FundamentalPanel } from './FundamentalPanel';
import { AIAnalysisPanel } from './AIAnalysisPanel';

interface StockDetailPanelProps {
  /** 選取的股票代號，null 表示尚未選取 */
  stockId: string | null;
}

type TabKey = 'quote' | 'chip' | 'fundamental' | 'ai';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'quote', label: '即時報價' },
  { key: 'chip', label: '籌碼面' },
  { key: 'fundamental', label: '基本面' },
  { key: 'ai', label: 'AI 分析' },
];

/** 根據價格方向回傳對應的 Tailwind 顏色 class */
function getPriceColorClass(change: number): string {
  const direction = getPriceDirection(change);
  if (direction === 'up') return 'text-red-500';
  if (direction === 'down') return 'text-green-500';
  return 'text-gray-500';
}

/** 格式化日期時間顯示 */
function formatDateTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function StockDetailPanel({ stockId }: StockDetailPanelProps) {
  const { currentStock, isLoading, error, selectStock } = useStockStore();
  const { clearResult } = useAIAnalysisStore();
  const [activeTab, setActiveTab] = useState<TabKey>('quote');

  useEffect(() => {
    if (stockId) {
      selectStock(stockId);
      setActiveTab('quote');
      clearResult();
    }
  }, [stockId, selectStock, clearResult]);

  if (!stockId) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
        請搜尋或選取股票
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !currentStock) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-red-500">
        {ERROR_MESSAGES.STOCK_LOAD_FAILED}
      </div>
    );
  }

  const colorClass = getPriceColorClass(currentStock.change);
  const changeSign = currentStock.change >= 0 ? '+' : '';

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* 標題區 */}
      <div className="p-6 pb-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xl font-bold text-gray-800">{currentStock.id}</span>
            <span className="text-gray-500 text-lg">{currentStock.name}</span>
          </div>
          <WatchlistButton stockId={currentStock.id} />
        </div>

        <div className="mb-4">
          <div className={`text-4xl font-bold ${colorClass}`}>
            {currentStock.price.toFixed(2)}
          </div>
          <div className={`text-lg mt-1 ${colorClass}`}>
            {changeSign}{currentStock.change.toFixed(2)}
            {' '}
            ({changeSign}{currentStock.changePercent.toFixed(2)}%)
          </div>
        </div>

        {/* Tab 列 */}
        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 內容 */}
      {activeTab === 'quote' && (
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">成交量</span>
                <span className="font-medium text-gray-800">{currentStock.volume.toLocaleString()} 張</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">開盤</span>
                <span className="font-medium text-gray-800">{currentStock.open.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">最高</span>
                <span className="font-medium text-red-500">{currentStock.high.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">昨收</span>
                <span className="font-medium text-gray-800">{currentStock.previousClose.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">最低</span>
                <span className="font-medium text-green-500">{currentStock.low.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 text-right">
            最後更新：{formatDateTime(currentStock.updatedAt)}
          </div>
        </div>
      )}

      {activeTab === 'chip' && <ChipPanel stockId={currentStock.id} />}
      {activeTab === 'fundamental' && <FundamentalPanel stockId={currentStock.id} />}
      {activeTab === 'ai' && <AIAnalysisPanel stockId={currentStock.id} />}
    </div>
  );
}