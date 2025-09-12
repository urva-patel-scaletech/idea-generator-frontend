import React, { useState } from 'react';
import { Heart, Share2, Zap } from 'lucide-react';
import { BusinessIdea } from '../types';

interface IdeaCardProps {
  idea: BusinessIdea;
  onRefine: (idea: BusinessIdea) => void;
  onSave: (idea: BusinessIdea) => void;
  onShare: (idea: BusinessIdea) => void;
  canRefine: boolean;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ 
  idea, 
  onRefine, 
  onSave, 
  onShare, 
  canRefine 
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave(idea);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const startX = e.clientX;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
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
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getMarketScoreColor = (score?: number) => {
    const s = typeof score === 'number' ? score : 0;
    if (s >= 8) return 'text-green-600 bg-green-100';
    if (s >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="relative">
      <div
        className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 
                    cursor-grab active:cursor-grabbing border border-gray-100
                    ${isDragging ? 'scale-105 shadow-xl' : ''}`}
        style={{
          transform: `translateX(${dragX}px) ${isDragging ? 'rotate(2deg)' : ''}`,
        }}
        onMouseDown={handleMouseDown}
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

        {/* Market Score Only (searches removed) */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getMarketScoreColor(idea.marketScore)}`}>
              {(idea.marketScore ?? 0)}/10
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
            {idea.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {idea.description}
          </p>
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
              <Zap className="w-4 h-4" />
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
            onClick={() => onShare(idea)}
            className="flex items-center space-x-1 px-4 py-2 rounded-xl text-sm font-medium
                     bg-blue-100 text-blue-700 hover:bg-blue-200 hover:scale-105
                     transition-all duration-200"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};