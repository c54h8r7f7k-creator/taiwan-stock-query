/**
 * 時間區間選擇器元件
 * 提供 1W / 1M / 3M / 6M / 1Y 五個切換按鈕
 */

import type { TimeRange } from '../../types';

/** 所有可選時間區間 */
const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: '1Y', label: '1Y' },
];

interface TimeRangeSelectorProps {
  /** 目前選取的時間區間 */
  value: TimeRange;
  /** 切換時間區間時的回呼函式 */
  onChange: (range: TimeRange) => void;
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex gap-1">
      {TIME_RANGES.map((range) => (
        <button
          key={range.value}
          type="button"
          onClick={() => onChange(range.value)}
          className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
            value === range.value
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
