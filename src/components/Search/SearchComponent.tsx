/**
 * 搜尋元件（組合元件）
 * 整合搜尋輸入與建議清單，處理 debounce、點擊外部關閉等互動邏輯
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { StockSummary } from '../../types';
import { useSearchStore } from '../../stores/searchStore';
import { SearchInput } from './SearchInput';
import { SuggestionList } from './SuggestionList';

interface SearchComponentProps {
  /** 選取股票時的回呼函式 */
  onStockSelect: (stock: StockSummary) => void;
}

export function SearchComponent({ onStockSelect }: SearchComponentProps) {
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { suggestions, error, fetchSuggestions, clearSuggestions } = useSearchStore();

  /** 處理輸入變更，debounce 500ms 後呼叫 fetchSuggestions */
  const handleQueryChange = useCallback(
    (value: string) => {
      setInputValue(value);

      // 清除前一個 debounce 計時器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 空白輸入時立即清空建議
      if (value.trim().length === 0) {
        clearSuggestions();
        return;
      }

      // 500ms debounce
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 500);
    },
    [fetchSuggestions, clearSuggestions]
  );

  /** 選取建議後清空輸入與建議清單 */
  const handleSelect = useCallback(
    (stock: StockSummary) => {
      onStockSelect(stock);
      setInputValue('');
      clearSuggestions();
    },
    [onStockSelect, clearSuggestions]
  );

  /** 點擊外部時關閉建議清單 */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        clearSuggestions();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clearSuggestions]);

  /** 元件卸載時清除 debounce 計時器 */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <SearchInput value={inputValue} onQueryChange={handleQueryChange} />
      <SuggestionList suggestions={suggestions} onSelect={handleSelect} error={error} />
    </div>
  );
}
