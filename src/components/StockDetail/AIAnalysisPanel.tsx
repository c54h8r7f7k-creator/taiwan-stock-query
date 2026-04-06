/**
 * 短期技術分析面板
 * 自動計算目標價、法人成本價與短期買賣建議
 */

import { useAIAnalysisStore } from '../../stores/aiAnalysisStore';

interface AIAnalysisPanelProps {
  stockId: string;
}

export function AIAnalysisPanel({ stockId: _stockId }: AIAnalysisPanelProps) {
  const { result, isLoading, error } = useAIAnalysisStore();

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

      <div className="bg-green-50 rounded-lg p-3">
        <p className="text-xs font-semibold text-green-700 mb-1">建議短期買入區間</p>
        <p className="text-sm font-bold text-green-600">
          ${result.buyRangeLow.toLocaleString()} – ${result.buyRangeHigh.toLocaleString()}
        </p>
      </div>

      <div className="bg-red-50 rounded-lg p-3">
        <p className="text-xs font-semibold text-red-700 mb-1">建議短期賣出區間</p>
        <p className="text-sm font-bold text-red-600">
          ${result.sellRangeLow.toLocaleString()} – ${result.sellRangeHigh.toLocaleString()}
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-3">
        <p className="text-xs font-semibold text-blue-700 mb-1">分析摘要</p>
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
