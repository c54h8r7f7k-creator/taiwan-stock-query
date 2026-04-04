/**
 * 版面配置元件
 * 桌面（lg+）：左側 Sidebar + 右側主內容
 * 手機/平板：單欄垂直排列
 */

import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  /** 選取股票時的回呼函式 */
  onStockSelect: (stockId: string) => void;
  /** 主內容區域 */
  children: ReactNode;
}

export function Layout({ onStockSelect, children }: LayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 flex gap-4 items-start">
      {/* 左側自選股側邊欄（桌面版才顯示） */}
      <Sidebar onStockSelect={onStockSelect} />
      {/* 右側主內容 */}
      <main className="flex-1 min-w-0 space-y-4">
        {children}
      </main>
    </div>
  );
}
