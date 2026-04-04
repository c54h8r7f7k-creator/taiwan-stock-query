/**
 * 搜尋輸入元件
 * 提供股票代號或公司名稱的文字輸入欄位，並顯示載入狀態
 */

import { useSearchStore } from '../../stores/searchStore';

interface SearchInputProps {
  /** 輸入值變更時的回呼函式 */
  onQueryChange: (value: string) => void;
  /** 目前輸入值 */
  value: string;
}

export function SearchInput({ onQueryChange, value }: SearchInputProps) {
  const isLoading = useSearchStore((s) => s.isLoading);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="輸入股票代號或公司名稱"
        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 placeholder-gray-400"
      />
      {/* 載入中指示器 */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
