/**
 * 頁首元件
 * 顯示應用程式標題與搜尋元件
 */

import type { StockSummary } from '../../types';
import { SearchComponent } from '../Search/SearchComponent';

interface HeaderProps {
  /** 選取股票時的回呼函式 */
  onStockSelect: (stock: StockSummary) => void;
}

export function Header({ onStockSelect }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* 應用程式標題 */}
        <h1 className="text-lg font-bold text-gray-800 shrink-0">台灣股票查詢</h1>
        {/* 搜尋元件 */}
        <SearchComponent onStockSelect={onStockSelect} />
      </div>
    </header>
  );
}
