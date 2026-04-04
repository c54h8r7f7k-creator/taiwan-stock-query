/**
 * 搜尋建議清單元件
 * 顯示符合查詢的股票建議，或在無結果時顯示提示訊息
 */

import type { StockSummary } from '../../types';
import { ERROR_MESSAGES } from '../../constants/messages';

interface SuggestionListProps {
  /** 搜尋建議清單 */
  suggestions: StockSummary[];
  /** 選取建議時的回呼函式 */
  onSelect: (stock: StockSummary) => void;
  /** 是否有錯誤（用於判斷是否顯示無結果提示） */
  error: string | null;
}

export function SuggestionList({ suggestions, onSelect, error }: SuggestionListProps) {
  // 無建議且有錯誤時顯示無結果提示
  if (suggestions.length === 0 && error) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500 text-sm">
        {ERROR_MESSAGES.SEARCH_NO_RESULT}
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
      {suggestions.map((stock) => (
        <li key={stock.id}>
          <button
            type="button"
            onClick={() => onSelect(stock)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left transition-colors"
          >
            {/* 左側：代號與名稱 */}
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-gray-800">{stock.id}</span>
              <span className="text-gray-600 text-sm">{stock.name}</span>
            </div>
            {/* 右側：股價 */}
            <span className="font-semibold text-gray-800">{stock.price.toFixed(2)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
