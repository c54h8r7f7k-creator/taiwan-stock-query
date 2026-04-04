/**
 * 圖表畫布元件
 * 使用 Recharts 繪製股價折線圖，支援 OHLCV tooltip 與無資料提示
 */

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { OHLCVDataPoint } from '../../types';
import { ERROR_MESSAGES } from '../../constants/messages';

interface ChartCanvasProps {
  /** 歷史 K 線資料點陣列 */
  data: OHLCVDataPoint[];
}

/** 自訂 Tooltip 內容 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: OHLCVDataPoint }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const d = payload[0].payload;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      <div className="space-y-1 text-gray-600">
        <div className="flex justify-between gap-4">
          <span>開盤</span>
          <span className="font-medium">{d.open.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>最高</span>
          <span className="font-medium text-red-500">{d.high.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>最低</span>
          <span className="font-medium text-green-500">{d.low.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>收盤</span>
          <span className="font-medium">{d.close.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4 pt-1 border-t border-gray-100">
          <span>成交量</span>
          <span className="font-medium">{d.volume.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export function ChartCanvas({ data }: ChartCanvasProps) {
  // 無資料時顯示提示
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        {ERROR_MESSAGES.CHART_NO_DATA}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          dataKey="close"
          domain={['auto', 'auto']}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          width={60}
          tickFormatter={(v: number) => v.toFixed(0)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="close"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#3b82f6' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
