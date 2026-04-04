/**
 * 分析 Store
 * 管理短期技術分析的計算狀態與結果（rule-based，不需 API）
 */

import { create } from 'zustand';
import type { AIAnalysisResult, ChipData, StockDetail } from '../types';
import { calcRuleBasedAnalysis } from '../utils/analysisUtils';

interface AIAnalysisStore {
  result: AIAnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  requestAnalysis: (
    stockId: string,
    stockDetail: StockDetail,
    chipData: ChipData | null,
  ) => void;
  clearResult: () => void;
}

export const useAIAnalysisStore = create<AIAnalysisStore>((set) => ({
  result: null,
  isLoading: false,
  error: null,

  requestAnalysis: (stockId, stockDetail, chipData) => {
    set({ isLoading: true, error: null, result: null });
    // rule-based 計算為同步，用 setTimeout 模擬短暫計算感
    setTimeout(() => {
      const result = calcRuleBasedAnalysis(stockId, stockDetail, chipData);
      set({ result, isLoading: false });
    }, 300);
  },

  clearResult: () => set({ result: null, error: null }),
}));
