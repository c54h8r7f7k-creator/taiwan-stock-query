/**
 * 分析 Store
 * 管理短期技術分析的計算狀態與結果（rule-based，不需 API）
 */

import { create } from 'zustand';
import type { AIAnalysisResult, ChipData, StockDetail, OHLCVDataPoint } from '../types';
import { calcRuleBasedAnalysis } from '../utils/analysisUtils';

interface AIAnalysisStore {
  result: AIAnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  requestAnalysis: (
    stockId: string,
    stockDetail: StockDetail,
    chipData: ChipData | null,
    candles: OHLCVDataPoint[],
  ) => void;
  clearResult: () => void;
}

export const useAIAnalysisStore = create<AIAnalysisStore>((set) => ({
  result: null,
  isLoading: false,
  error: null,

  requestAnalysis: (stockId, stockDetail, chipData, candles) => {
    set({ isLoading: true, error: null, result: null });
    setTimeout(() => {
      const result = calcRuleBasedAnalysis(stockId, stockDetail, chipData, candles);
      set({ result, isLoading: false });
    }, 300);
  },

  clearResult: () => set({ result: null, error: null }),
}));
