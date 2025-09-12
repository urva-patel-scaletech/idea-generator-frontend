import React from 'react';
import { TrendingUp, Search, Clock } from 'lucide-react';
import { TrendingSearch } from '../types';

interface TrendingInsightsProps {
  trendingSearches: TrendingSearch[];
}

export const TrendingInsights: React.FC<TrendingInsightsProps> = ({ trendingSearches }) => {
  const items = (Array.isArray(trendingSearches) ? trendingSearches : []).slice(0, 4);
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
          <TrendingUp className="w-5 h-5 text-orange-600" />
        </div>
        <div className="leading-tight">
          <h3 className="font-bold text-gray-800 text-sm md:text-base">🔥 Trending Now</h3>
          <p className="text-[11px] md:text-xs text-gray-500">What people are searching for</p>
        </div>
      </div>

      <div className="divide-y divide-gray-200/60 rounded-xl overflow-hidden bg-gray-50">
        {items.map((trend, index) => (
          <div key={index} className="flex items-center justify-between p-3 md:p-3.5 hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                {index + 1}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate max-w-[200px] md:max-w-[260px]">{trend.title}</p>
                <div className="flex items-center gap-2 text-[11px] md:text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1"><Search className="w-3 h-3" />{trend.appType}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(trend.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-green-600 font-bold text-sm">{(trend.score ?? 0).toFixed(1)}</span>
              <p className="text-[11px] text-gray-500">score</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 md:mt-4">
        <p className="text-[11px] md:text-xs text-gray-500 text-center">
          Data updated every hour · Based on global search trends
        </p>
      </div>
    </div>
  );
};