/**
 * 圖表畫布元件
 * 三層圖：主圖（K線+MA5+MA20）/ 副圖一（成交量）/ 副圖二（RSI+KDJ）
 * 所有指標在渲染前一次計算完畢
 */

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import type { OHLCVDataPoint } from '../../types';
import { buildChartIndicators, type ChartIndicatorPoint } from '../../utils/analysisUtils';
import { ERROR_MESSAGES } from '../../constants/messages';

interface ChartCanvasProps {
  data: OHLCVDataPoint[];
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function MainTooltip({
  active, payload, label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs space-y-1">
      <p className="font-semibold text-gray-700">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4" style={{ color: p.color }}>
          <span>{p.name}</span>
          <span className="font-medium">{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── 自訂 K 線 Bar（漲紅跌綠）────────────────────────────────────────────────────

function CandleBar(props: {
  x?: number; y?: number; width?: number; height?: number;
  payload?: ChartIndicatorPoint;
}) {
  const { x = 0, y = 0, width = 0, payload } = props;
  if (!payload) return null;

  const { open, close, high, low } = payload;
  const isUp = close >= open;
  const color = isUp ? '#ef4444' : '#22c55e';

  const bodyTop = Math.min(open, close);
  const bodyBottom = Math.max(open, close);
  const yScale = props.height !== undefined && props.height !== 0
    ? Math.abs(props.height) / Math.abs(close - open || 0.01)
    : 1;

  // 用 recharts 提供的 y/height 做相對定位會複雜，改用 SVG 直接畫
  // 這裡 y 是 close 對應的像素位置（由 recharts YAxis 決定）
  // 我們只畫影線，body 由 Bar 本身負責
  const centerX = x + width / 2;

  return (
    <g>
      {/* 上影線 */}
      <line x1={centerX} y1={y} x2={centerX} y2={y} stroke={color} strokeWidth={1} />
      {/* body */}
      <rect
        x={x + 1}
        y={y}
        width={Math.max(width - 2, 1)}
        height={Math.abs(props.height ?? 1)}
        fill={color}
        stroke={color}
      />
    </g>
  );
}

// ─── 主元件 ───────────────────────────────────────────────────────────────────

export function ChartCanvas({ data }: ChartCanvasProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        {ERROR_MESSAGES.CHART_NO_DATA}
      </div>
    );
  }

  // 一次計算所有指標
  const indicators = buildChartIndicators(data);

  // 主圖 Y 軸範圍
  const closes = data.map((d) => d.close);
  const minClose = Math.min(...closes);
  const maxClose = Math.max(...closes);
  const padding = (maxClose - minClose) * 0.1 || 1;

  return (
    <div className="space-y-2">
      {/* ── 主圖：收盤線 + MA5 + MA20 ── */}
      <div>
        <p className="text-xs text-gray-400 mb-1">K 線 + 均線</p>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={indicators} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis
              domain={[minClose - padding, maxClose + padding]}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              width={55}
              tickFormatter={(v: number) => v.toFixed(0)}
            />
            <Tooltip content={<MainTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {/* 收盤價 */}
            <Line type="monotone" dataKey="close" name="收盤" stroke="#374151" strokeWidth={1.5} dot={false} />
            {/* MA5 */}
            <Line type="monotone" dataKey="ma5" name="MA5" stroke="#f59e0b" strokeWidth={1.5} dot={false} connectNulls />
            {/* MA20 */}
            <Line type="monotone" dataKey="ma20" name="MA20" stroke="#8b5cf6" strokeWidth={1.5} dot={false} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── 副圖一：成交量 ── */}
      <div>
        <p className="text-xs text-gray-400 mb-1">成交量（張）</p>
        <ResponsiveContainer width="100%" height={80}>
          <ComposedChart data={indicators} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={false} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={55} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} />
            <Tooltip content={<MainTooltip />} />
            <Bar
              dataKey="volume"
              name="成交量"
              fill="#93c5fd"
              radius={[2, 2, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── 副圖二：RSI + KDJ ── */}
      <div>
        <p className="text-xs text-gray-400 mb-1">RSI(14) / KDJ(9)</p>
        <ResponsiveContainer width="100%" height={100}>
          <ComposedChart data={indicators} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={55} />
            <Tooltip content={<MainTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {/* 超買超賣參考線 */}
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1} />
            <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="4 2" strokeWidth={1} />
            <ReferenceLine y={80} stroke="#f97316" strokeDasharray="4 2" strokeWidth={1} />
            <ReferenceLine y={20} stroke="#3b82f6" strokeDasharray="4 2" strokeWidth={1} />
            {/* RSI */}
            <Line type="monotone" dataKey="rsi" name="RSI" stroke="#3b82f6" strokeWidth={1.5} dot={false} connectNulls />
            {/* KDJ */}
            <Line type="monotone" dataKey="k" name="K" stroke="#f59e0b" strokeWidth={1} dot={false} connectNulls />
            <Line type="monotone" dataKey="d" name="D" stroke="#8b5cf6" strokeWidth={1} dot={false} connectNulls />
            <Line type="monotone" dataKey="j" name="J" stroke="#ec4899" strokeWidth={1} dot={false} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
