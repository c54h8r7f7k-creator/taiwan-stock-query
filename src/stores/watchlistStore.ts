/**
 * 自選股 Store
 * 管理使用者自訂的追蹤股票清單，並持久化至 localStorage
 */

import { create } from 'zustand';
import type { WatchlistEntry, StockSummary } from '../types';
import { fetchSearchResults } from '../services/twseApi';

/** localStorage 儲存鍵值 */
const STORAGE_KEY = 'taiwan-stock-watchlist';

/** 從 localStorage 讀取自選股清單，錯誤時靜默失敗回傳空陣列 */
function loadFromStorage(): WatchlistEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WatchlistEntry[];
  } catch {
    return [];
  }
}

/** 將自選股清單寫入 localStorage，錯誤時靜默失敗 */
function saveToStorage(entries: WatchlistEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // 靜默失敗（例如：隱私模式或儲存空間不足）
  }
}

interface WatchlistStore {
  entries: WatchlistEntry[];
  stockData: Record<string, StockSummary>;
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
  refreshPrices: () => Promise<void>;
}

export const useWatchlistStore = create<WatchlistStore>((set, get) => ({
  entries: loadFromStorage(),
  stockData: {},

  /**
   * 將股票加入自選股清單
   * 若已存在則不重複新增
   */
  addToWatchlist: (id: string) => {
    const { entries } = get();
    if (entries.some((e) => e.id === id)) return;

    const newEntries: WatchlistEntry[] = [
      ...entries,
      { id, addedAt: new Date().toISOString() },
    ];
    saveToStorage(newEntries);
    set({ entries: newEntries });
  },

  /**
   * 從自選股清單移除股票
   */
  removeFromWatchlist: (id: string) => {
    const newEntries = get().entries.filter((e) => e.id !== id);
    saveToStorage(newEntries);
    set({ entries: newEntries });
  },

  /**
   * 檢查股票是否已在自選股清單中
   */
  isInWatchlist: (id: string) => {
    return get().entries.some((e) => e.id === id);
  },

  /**
   * 重新整理自選股的即時股價資料
   */
  refreshPrices: async () => {
    const { entries } = get();
    if (entries.length === 0) return;

    // 取得所有自選股的最新報價
    const ids = entries.map((e) => e.id);
    const stockDataMap: Record<string, StockSummary> = {};

    // 使用搜尋 API 批次取得資料（每次搜尋一個代號）
    await Promise.all(
      ids.map(async (id) => {
        const result = await fetchSearchResults(id);
        if (result.ok) {
          const stock = result.data.find((s) => s.id === id);
          if (stock) {
            stockDataMap[id] = stock;
          }
        }
      })
    );

    set({ stockData: stockDataMap });
  },
}));
