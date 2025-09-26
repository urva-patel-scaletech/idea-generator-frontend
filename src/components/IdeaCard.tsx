import React, { useState } from 'react';
import { Heart, Share2, Sparkles, TrendingUp, Users, Target, Lightbulb, DollarSign, Search } from 'lucide-react';
import { BusinessIdea } from '../types';
import { ShareModal } from './ShareModal';

interface IdeaCardProps {
  idea: BusinessIdea;
  onRefine: (idea: BusinessIdea) => void;
  onSave: (idea: BusinessIdea) => void;
  canRefine: boolean;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ 
  idea, 
  onRefine, 
  onSave, 
  canRefine 
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave(idea);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    // Trigger refine action when clicking anywhere on the card
    if (canRefine) {
      onRefine(idea);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    setIsDragging(true);
    const startX = e.clientX;
    let hasMoved = false;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      if (Math.abs(deltaX) > 5) {
        hasMoved = true;
      }
      setDragX(deltaX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragX(0);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Handle swipe actions
      if (Math.abs(dragX) > 100) {
        if (dragX > 0) {
          handleSave(); // Swipe right = save
        }
        // Swipe left could be discard, but we'll just reset for now
      } else if (!hasMoved) {
        // If no significant movement, treat as a click
        handleCardClick(e);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getGrowthColor = (growth: number) => {
    if (growth >= 20) return 'text-green-600 bg-green-100';
    if (growth >= 10) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const MetricBar = ({ value, max = 10, color = 'bg-blue-500' }: { value: number; max?: number; color?: string }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full ${color}`} 
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  );

  return (
    <div className="relative">
      <div
        className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 
                    ${canRefine ? 'cursor-pointer' : 'cursor-default'} border border-gray-100
                    ${isDragging ? 'scale-105 shadow-xl' : ''}
                    ${canRefine ? 'hover:border-purple-200' : ''}`}
        style={{
          transform: `translateX(${dragX}px) ${isDragging ? 'rotate(2deg)' : ''}`,
        }}
        onMouseDown={handleMouseDown}
        onClick={handleCardClick}
      >
        {/* Swipe Indicators */}
        {isDragging && (
          <>
            <div className={`absolute -left-16 top-1/2 transform -translate-y-1/2 
                            bg-red-500 text-white px-3 py-2 rounded-lg transition-opacity
                            ${dragX < -50 ? 'opacity-100' : 'opacity-0'}`}>
              Discard
            </div>
            <div className={`absolute -right-16 top-1/2 transform -translate-y-1/2 
                            bg-green-500 text-white px-3 py-2 rounded-lg transition-opacity
                            ${dragX > 50 ? 'opacity-100' : 'opacity-0'}`}>
              Save
            </div>
          </>
        )}

        {/* Header with Overall Score and Growth */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-lg text-sm font-bold ${getScoreColor(idea.score)}`}>
              {idea.score}/10
            </div>
            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getGrowthColor(idea.growthPercentage)}`}>
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {idea.growthPercentage}%
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
            {idea.title}
          </h3>
          <p className="text-gray-600 leading-relaxed mb-3">
            {idea.description}
          </p>
        </div>

        {/* Search Volume Data */}
        {idea.searchData && (
          <div className="mb-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 rounded-lg">
                  <Search className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-orange-800 text-sm">
                      {idea.searchData.monthlyVolume >= 1000 
                        ? `${(idea.searchData.monthlyVolume / 1000).toFixed(1)}K` 
                        : idea.searchData.monthlyVolume
                      }
                    </span>
                    <span className="text-orange-600 text-xs">searches/month</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      idea.searchData.trend === 'rising' ? 'bg-green-100 text-green-800' :
                      idea.searchData.trend === 'falling' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {idea.searchData.trend === 'rising' ? '↗ Rising' : idea.searchData.trend === 'falling' ? '↘ Falling' : '→ Stable'}
                    </span>
                  </div>
                  <div className="text-xs text-orange-600 mt-0.5">
                    Related Keywords: {idea.searchData.relatedTerms?.slice(0, 2).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Metrics */}
        <div className="mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1" title="Size of the target market and potential customer base">
                  <Users className="w-3 h-3 text-blue-500" />
                  <span className="text-gray-600">Market Size</span>
                </div>
                <span className="font-medium">{idea.metrics.marketSize}/10</span>
              </div>
              <MetricBar value={idea.metrics.marketSize} color="bg-blue-500" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1" title="Level of competition in the market (10 = blue ocean, 1 = saturated)">
                  <Target className="w-3 h-3 text-purple-500" />
                  <span className="text-gray-600">Competition</span>
                </div>
                <span className="font-medium">{idea.metrics.competition}/10</span>
              </div>
              <MetricBar value={idea.metrics.competition} color="bg-purple-500" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1" title="How realistic and achievable this business idea is">
                  <Lightbulb className="w-3 h-3 text-yellow-500" />
                  <span className="text-gray-600">Feasibility</span>
                </div>
                <span className="font-medium">{idea.metrics.feasibility}/10</span>
              </div>
              <MetricBar value={idea.metrics.feasibility} color="bg-yellow-500" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1" title="Potential for generating profit and sustainable revenue">
                  <DollarSign className="w-3 h-3 text-green-500" />
                  <span className="text-gray-600">Profitability</span>
                </div>
                <span className="font-medium">{idea.metrics.profitability}/10</span>
              </div>
              <MetricBar value={idea.metrics.profitability} color="bg-green-500" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => onRefine(idea)}
              disabled={!canRefine}
              className={`flex items-center space-x-1 px-4 py-2 rounded-xl text-sm font-medium
                         transition-all duration-200 ${
                           canRefine
                             ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 hover:scale-105'
                             : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                         }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Refine</span>
              {!canRefine && <span className="text-xs">🔒</span>}
            </button>
            
            <button
              onClick={handleSave}
              className={`flex items-center space-x-1 px-4 py-2 rounded-xl text-sm font-medium
                         transition-all duration-200 hover:scale-105 ${
                           isSaved
                             ? 'bg-pink-100 text-pink-700'
                             : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                         }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center space-x-1 px-4 py-2 rounded-xl text-sm font-medium
                     bg-blue-100 text-blue-700 hover:bg-blue-200 hover:scale-105
                     transition-all duration-200"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        idea={idea}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
};