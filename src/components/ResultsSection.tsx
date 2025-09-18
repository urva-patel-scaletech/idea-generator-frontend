import React, { useMemo } from 'react';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { BusinessIdea } from '../types';
import { IdeaCard } from './IdeaCard';

interface ResultsSectionProps {
  ideas: BusinessIdea[];
  industry: string;
  onBack: () => void;
  onRefine: (idea: BusinessIdea) => void;
  onSave: () => void;
  onShare: () => void;
  canRefine: boolean;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  ideas,
  industry,
  onBack,
  onRefine,
  onSave,
  onShare,
  canRefine,
}) => {

  // Helper: derive a clean industry label from a possibly long natural prompt
  const displayIndustry = useMemo(() => {
    if (!industry) return '';
    const raw = industry.trim();
    // 1) Pattern: "in <industry> to|:|$" (e.g., "in Travel & Tourism to ...")
    const inMatch = raw.match(/\bin\s+([^:]+?)(?=\s+to\b|:|$)/i);
    if (inMatch?.[1]) return inMatch[1].trim();

    // 2) Pattern: "into a/an/the <industry> business" (e.g., "into a Travel & Tourism business")
    const intoBusinessMatch = raw.match(/\binto\s+(?:an?\s+|the\s+)?([^:]+?)\s+business\b/i);
    if (intoBusinessMatch?.[1]) return intoBusinessMatch[1].trim();

    // 3) Pattern: "to start a/an/the <industry> business"
    const toStartBusinessMatch = raw.match(/\bto\s+start\s+(?:an?\s+|the\s+)?([^:]+?)\s+business\b/i);
    if (toStartBusinessMatch?.[1]) return toStartBusinessMatch[1].trim();

    // 4) Generic: "a/an/the <industry> business" if present anywhere
    const aBusinessMatch = raw.match(/\b(?:an?|the)\s+([^:]+?)\s+business\b/i);
    if (aBusinessMatch?.[1]) return aBusinessMatch[1].trim();

    // 5) If there's a colon, try to use the segment right before the colon,
    // but strip common leading phrases like "I want to", "I see", etc.
    if (raw.includes(':')) {
      const beforeColon = raw.split(':')[0]
        .replace(/^[Ii]\s*want\s*to\s*/i, '')
        .replace(/^[Ii]\s*see\s*/i, '')
        .replace(/^[Uu]sing\s*my\s*skills\s*to\s*start\s*/i, '')
        .replace(/\bto\s*solve\s*this\s*problem\b/i, '')
        .trim();
      // If that still contains "in <industry>", extract again
      const retryMatch = beforeColon.match(/\bin\s+(.+?)$/i);
      if (retryMatch?.[1]) return retryMatch[1].trim();
      return beforeColon || raw.split(':')[0].trim();
    }

    // 6) Fallback: if it's very long, truncate safely; otherwise return as-is
    return raw.length > 36 ? raw.slice(0, 34).trim() + '…' : raw;
  }, [industry]);


  const averageMarketScore = ideas.length
    ? ideas.reduce((sum, idea) => sum + (idea.marketScore ?? 0), 0) / ideas.length
    : 0;
  const getScoreColor = (score: number) => {
    if (score >= 7.5) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </button>

          <div className="text-center max-w-xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
              Ideas for {displayIndustry}
            </h1>
            <div className="flex items-center justify-center gap-4 mt-2">
              <p className="text-gray-600 text-sm md:text-base">{ideas.length} sparks generated</p>
              <div className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <span className={`font-semibold text-sm md:text-base ${getScoreColor(averageMarketScore)}`}>
                  {averageMarketScore.toFixed(1)}/10 avg score
                </span>
              </div>
            </div>
          </div>

          <div className="w-14 md:w-20"></div> {/* Spacer for alignment */}
        </div>

        {/* Main Content Grid */}
        <div className="mb-12">
          {/* Ideas Grid */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onRefine={onRefine}
                onSave={onSave}
                onShare={onShare}
                canRefine={canRefine}
              />
            ))}
          </div>
        </div>

        {/* Community Section removed to avoid dummy/static content */}
      </div>
    </div>
  );
};