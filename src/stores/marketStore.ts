/**
 * 市場總覽 Store
 * 管理台灣股市整體概況資料，包含 TAIEX 指數與各排行榜
 */

import { create } from 'zustand';
import type { MarketOverview } from '../types';
import { fetchMarketOverview } from '../services/twseApi';

interface MarketStore {
  overview: MarketOverview | null;
  isLoading: boolean;
  error: string | null;
  fetchOverview: () => Promise<void>;
}

export const useMarketStore = create<MarketStore>((set) => ({
  overview: null,
  isLoading: false,
  error: null,

  /**
   * 取得市場總覽資料
   */
  fetchOverview: async () => {
    set({ isLoading: true, error: null });

    const result = await fetchMarketOverview();

    if (result.ok) {
      set({ overview: result.data, isLoading: false });
    } else {
      set({ error: result.error, isLoading: false });
    }
  },
}));
