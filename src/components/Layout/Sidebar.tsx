/**
 * 側邊欄元件
 * 在桌面版（lg 以上）顯示自選股清單，固定寬度 w-72
 */

import { Watchlist } from '../Watchlist/Watchlist';

interface SidebarProps {
  /** 選取股票時的回呼函式 */
  onStockSelect: (stockId: string) => void;
}

export function Sidebar({ onStockSelect }: SidebarProps) {
  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-16">
        <Watchlist onStockSelect={onStockSelect} />
      </div>
    </aside>
  );
}
