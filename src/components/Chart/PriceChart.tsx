/**
 * 股價走勢圖元件（組合元件）
 * 整合時間區間選擇器與圖表畫布，連接 stockStore
 */

import { useStockStore } from '../../stores/stockStore';
import { TimeRangeSelector } from './TimeRangeSelector';
import { ChartCanvas } from './ChartCanvas';
import type { TimeRange } from '../../types';

export function PriceChart() {
  const { chartData, chartRange, setChartRange } = useStockStore();

  const handleRangeChange = (range: TimeRange) => {
    setChartRange(range);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* 標題列與時間區間選擇器 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">走勢圖</h3>
        <TimeRangeSelector value={chartRange} onChange={handleRangeChange} />
      </div>
      {/* 圖表（ResponsiveContainer 自動適應容器寬度） */}
      <ChartCanvas data={chartData} />
    </div>
  );
}
