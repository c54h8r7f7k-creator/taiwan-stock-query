/**
 * 股票詳情 Store
 * 管理當前選取股票的詳細資訊、歷史 K 線資料與時間區間
 */

import { create } from 'zustand';
import type { StockDetail, OHLCVDataPoint, TimeRange, ChipData, FundamentalData } from '../types';
import { fetchStockDetail, fetchChartData, fetchChipData, fetchFundamentalData } from '../services/twseApi';
import { ERROR_MESSAGES } from '../constants/messages';

interface StockStore {
  currentStockId: string | null;
  currentStock: StockDetail | null;
  chartData: OHLCVDataPoint[];
  chartRange: TimeRange;
  isLoading: boolean;
  error: string | null;
  chipData: ChipData | null;
  fundamentalData: FundamentalData | null;
  chipLoading: boolean;
  fundamentalLoading: boolean;
  chipError: string | null;
  fundamentalError: string | null;
  selectStock: (id: string) => Promise<void>;
  setChartRange: (range: TimeRange) => Promise<void>;
  fetchChipData: (id: string) => Promise<void>;
  fetchFundamentalData: (id: string) => Promise<void>;
}

export const useStockStore = create<StockStore>((set, get) => ({
  currentStockId: null,
  currentStock: null,
  chartData: [],
  chartRange: '1M',
  isLoading: false,
  error: null,
  chipData: null,
  fundamentalData: null,
  chipLoading: false,
  fundamentalLoading: false,
  chipError: null,
  fundamentalError: null,

  selectStock: async (id: string) => {
    set({ isLoading: true, error: null, currentStockId: id, chipData: null, fundamentalData: null, chipError: null, fundamentalError: null });

    const [detailResult, chartResult] = await Promise.all([
      fetchStockDetail(id),
      fetchChartData(id, get().chartRange),
    ]);

    if (detailResult.ok) {
      set({ currentStock: detailResult.data });
    } else {
      set({ error: detailResult.error, currentStock: null });
    }

    if (chartResult.ok) {
      set({ chartData: chartResult.data });
    } else {
      set({ chartData: [] });
    }

    set({ isLoading: false });
  },

  setChartRange: async (range: TimeRange) => {
    const { currentStockId } = get();
    set({ chartRange: range });

    if (!currentStockId) return;

    set({ isLoading: true });

    const result = await fetchChartData(currentStockId, range);

    if (result.ok) {
      set({ chartData: result.data, isLoading: false });
    } else {
      set({ chartData: [], isLoading: false });
    }
  },

  fetchChipData: async (id: string) => {
    set({ chipLoading: true, chipError: null });
    const result = await fetchChipData(id);
    if (result.ok) {
      set({ chipData: result.data, chipLoading: false });
    } else {
      set({ chipError: result.error, chipLoading: false });
    }
  },

  fetchFundamentalData: async (id: string) => {
    set({ fundamentalLoading: true, fundamentalError: null });
    const result = await fetchFundamentalData(id);
    if (result.ok) {
      set({ fundamentalData: result.data, fundamentalLoading: false });
    } else {
      set({ fundamentalError: result.error, fundamentalLoading: false });
    }
  },
}));
