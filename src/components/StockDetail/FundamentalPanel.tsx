/**
 * 基本面資訊面板
 * 顯示 EPS、本益比、股價淨值比、月營收、毛利率等財務指標
 */

import { useEffect } from 'react';
import { useStockStore } from '../../stores/stockStore';
import { ERROR_MESSAGES } from '../../constants/messages';

interface FundamentalPanelProps {
  stockId: string;
}

function FundRow({ label, value, unit = '' }: { label: string; value: number; unit?: string }) {
  return (
    <div className="flex justify-between py-1 border-b border-gray-100 last:border-0">
      <span className="text-gray-600 text-sm">{label}</span>
      <span className="text-sm font-medium text-gray-800">
        {value === 0 ? 'N/A' : `${value.toLocaleString()}${unit}`}
      </span>
    </div>
  );
}

export function FundamentalPanel({ stockId }: FundamentalPanelProps) {
  const { fundamentalData, fundamentalLoading, fundamentalError, fetchFundamentalData } = useStockStore();

  useEffect(() => {
    fetchFundamentalData(stockId);
  }, [stockId, fetchFundamentalData]);

  if (fundamentalLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-400">
        載入中...
      </div>
    );
  }

  if (fundamentalError || !fundamentalData) {
    return (
      <div className="py-4 text-center text-red-500 text-sm">
        {fundamentalError ?? ERROR_MESSAGES.FUNDAMENTAL_LOAD_FAILED}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-gray-50 rounded-lg p-3">
        <FundRow label="近四季 EPS" value={fundamentalData.eps} unit=" 元" />
        <FundRow label="本益比" value={fundamentalData.peRatio} unit=" 倍" />
        <FundRow label="股價淨值比" value={fundamentalData.pbRatio} unit=" 倍" />
        <FundRow label="月營收" value={fundamentalData.monthlyRevenue} unit=" 百萬" />
        <FundRow label="月營收年增率" value={fundamentalData.revenueYoY} unit="%" />
        <FundRow label="毛利率" value={fundamentalData.grossMargin} unit="%" />
      </div>
      <p className="text-xs text-gray-400 mt-2">
        更新時間：{new Date(fundamentalData.updatedAt).toLocaleString('zh-TW')}
      </p>
    </div>
  );
}
