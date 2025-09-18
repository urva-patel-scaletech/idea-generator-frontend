import React from 'react';
import { TrendingUp, Lightbulb } from 'lucide-react';
import { TrendingIdea } from '../types';

interface TrendingInsightsProps {
  trendingSearches: TrendingIdea[];
  onTrendingClick?: (trend: TrendingIdea) => void;
}

export const TrendingInsights: React.FC<TrendingInsightsProps> = ({ trendingSearches, onTrendingClick }) => {
  const items = (Array.isArray(trendingSearches) ? trendingSearches : []).slice(0, 5);
  
  // Show empty state when no trending data is available
  if (items.length === 0) {
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

        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <div className="text-gray-400 mb-2">
            <Lightbulb className="w-8 h-8 mx-auto opacity-50" />
          </div>
          <p className="text-sm text-gray-500">
            Trending ideas temporarily unavailable
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Please check your connection and try again
          </p>
        </div>
      </div>
    );
  }
  
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
          <div 
            key={index} 
            className={`p-3 md:p-4 transition-colors ${onTrendingClick ? 'hover:bg-gray-100 cursor-pointer' : 'hover:bg-gray-100'}`}
            onClick={() => onTrendingClick?.(trend)}
          >
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <h4 className="font-semibold text-gray-800 text-sm leading-tight">{trend.title}</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{trend.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 md:mt-4">
        <p className="text-[11px] md:text-xs text-gray-500 text-center">
          AI-generated trending ideas · Updated in real-time
        </p>
      </div>
    </div>
  );
};