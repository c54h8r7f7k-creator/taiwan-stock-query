/**
 * 籌碼面資訊面板
 * 顯示三大法人買賣超與融資融券資料
 */

import { useEffect } from 'react';
import { useStockStore } from '../../stores/stockStore';
import { getChipColor } from '../../utils/priceUtils';
import { ERROR_MESSAGES } from '../../constants/messages';

interface ChipPanelProps {
  stockId: string;
}

const colorClass = {
  red: 'text-red-500',
  green: 'text-green-500',
  gray: 'text-gray-500',
};

function ChipRow({ label, value }: { label: string; value: number }) {
  const color = getChipColor(value);
  return (
    <div className="flex justify-between py-1 border-b border-gray-100 last:border-0">
      <span className="text-gray-600 text-sm">{label}</span>
      <span className={`text-sm font-medium ${colorClass[color]}`}>
        {value > 0 ? '+' : ''}{value.toLocaleString()} 張
      </span>
    </div>
  );
}

export function ChipPanel({ stockId }: ChipPanelProps) {
  const { chipData, chipLoading, chipError, fetchChipData } = useStockStore();

  useEffect(() => {
    fetchChipData(stockId);
  }, [stockId, fetchChipData]);

  if (chipLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-400">
        載入中...
      </div>
    );
  }

  if (chipError || !chipData) {
    return (
      <div className="py-4 text-center text-red-500 text-sm">
        {chipError ?? ERROR_MESSAGES.CHIP_LOAD_FAILED}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">三大法人買賣超 <span className="text-xs font-normal text-gray-400">（估算）</span></h3>
        <div className="bg-gray-50 rounded-lg p-3">
          <ChipRow label="外資" value={chipData.foreignBuySell} />
          <ChipRow label="投信" value={chipData.investmentTrustBuySell} />
          <ChipRow label="自營商" value={chipData.dealerBuySell} />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">融資融券</h3>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-600 text-sm">融資餘額</span>
            <span className="text-sm font-medium text-gray-800">{chipData.marginBalance.toLocaleString()} 張</span>
          </div>
          <ChipRow label="融資增減" value={chipData.marginChange} />
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-600 text-sm">融券餘額</span>
            <span className="text-sm font-medium text-gray-800">{chipData.shortBalance.toLocaleString()} 張</span>
          </div>
          <ChipRow label="融券增減" value={chipData.shortChange} />
        </div>
      </div>
      <p className="text-xs text-gray-400">資料日期：{chipData.date}</p>
    </div>
  );
}
