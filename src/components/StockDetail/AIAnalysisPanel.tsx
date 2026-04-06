/**
 * 短期技術分析面板
 * 自動計算目標價、法人成本價、KDJ(9)、RSI(14) 與分析摘要
 */

import { useEffect } from 'react';
import { useAIAnalysisStore } from '../../stores/aiAnalysisStore';
import { useStockStore } from '../../stores/stockStore';

interface AIAnalysisPanelProps {
  stockId: string;
}

function SignalBadge({ value, low, high }: { value: number; low: number; high: number }) {
  if (value <= low) return <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700">超賣</span>;
  if (value >= high) return <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700">超買</span>;
  return <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">中性</span>;
}

export function AIAnalysisPanel({ stockId: _stockId }: AIAnalysisPanelProps) {
  const { result, isLoading, error, requestAnalysis, clearResult } = useAIAnalysisStore();
  const { currentStock, chipData, chartData } = useStockStore();

  // 切換股票時自動重新計算
  useEffect(() => {
    if (!currentStock || chartData.length === 0) return;
    clearResult();
    requestAnalysis(_stockId, currentStock, chipData, chartData);
  }, [_stockId, currentStock, chipData, chartData]);

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center py-8 text-gray-400">
        <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
        計算中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 py-3 px-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
    );
  }

  if (!result) return null;

  return (
    <div className="p-4 space-y-3">
      {/* 目標價 / 法人成本價 */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">短期目標價</span>
          <span className="text-sm font-semibold text-red-500">
            ${result.targetPrice.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">法人成本價估算</span>
          <span className="text-sm font-semibold text-gray-800">
            ${result.institutionalCostPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* KDJ(9) */}
      <div className="bg-purple-50 rounded-lg p-3">
        <p className="text-xs font-semibold text-purple-700 mb-2">
          KDJ（隨機指標，參數 9）
        </p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">K 值</span>
            <span className="font-medium">{result.kdj.k}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">D 值</span>
            <span className="font-medium">{result.kdj.d}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">J 值</span>
            <span className="font-medium flex items-center">
              {result.kdj.j}
              <SignalBadge value={result.kdj.j} low={20} high={80} />
            </span>
          </div>
        </div>
      </div>

      {/* RSI(14) */}
      <div className="bg-blue-50 rounded-lg p-3">
        <p className="text-xs font-semibold text-blue-700 mb-2">
          RSI（相對強弱指標，參數 14）
        </p>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">RSI 值</span>
          <span className="font-medium flex items-center">
            {result.rsi.rsi}
            <SignalBadge value={result.rsi.rsi} low={30} high={70} />
          </span>
        </div>
        {/* 進度條 */}
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${result.rsi.rsi}%`,
              backgroundColor: result.rsi.rsi >= 70 ? '#ef4444' : result.rsi.rsi <= 30 ? '#22c55e' : '#3b82f6',
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>0</span>
          <span>30</span>
          <span>70</span>
          <span>100</span>
        </div>
      </div>

      {/* 分析摘要 */}
      <div className="bg-white border border-gray-100 rounded-lg p-3">
        <p className="text-xs font-semibold text-gray-700 mb-1">分析摘要</p>
        <p className="text-sm text-gray-700 leading-relaxed">{result.summary}</p>
      </div>

      <p className="text-xs text-gray-400">
        計算時間：{new Date(result.generatedAt).toLocaleString('zh-TW')}
      </p>

      <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-3">
        <p className="text-xs text-yellow-700 leading-relaxed">
          ⚠️ 本分析為技術面規則計算，僅供參考，不構成投資建議，投資人應自行判斷並承擔投資風險。
        </p>
      </div>
    </div>
  );
}
