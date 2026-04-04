/**
 * 搜尋 Store
 * 管理股票搜尋狀態，包含查詢字串、建議清單、載入狀態與錯誤訊息
 */

import { create } from 'zustand';
import type { StockSummary } from '../types';
import { fetchSearchResults } from '../services/twseApi';

interface SearchStore {
  query: string;
  suggestions: StockSummary[];
  isLoading: boolean;
  error: string | null;
  setQuery: (q: string) => void;
  fetchSuggestions: (q: string) => Promise<void>;
  clearSuggestions: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: '',
  suggestions: [],
  isLoading: false,
  error: null,

  /** 設定查詢字串 */
  setQuery: (q: string) => set({ query: q }),

  /**
   * 取得搜尋建議
   * 空白查詢或長度 < 2 時不呼叫 API，直接清空建議
   */
  fetchSuggestions: async (q: string) => {
    const trimmed = q.trim();

    // 空白查詢或長度不足時清空建議，不呼叫 API
    if (trimmed.length < 2) {
      set({ suggestions: [], isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });

    const result = await fetchSearchResults(trimmed);

    if (result.ok) {
      set({ suggestions: result.data, isLoading: false });
    } else {
      set({ suggestions: [], isLoading: false, error: result.error });
    }
  },

  /** 清空搜尋建議 */
  clearSuggestions: () => set({ suggestions: [], error: null }),
}));
