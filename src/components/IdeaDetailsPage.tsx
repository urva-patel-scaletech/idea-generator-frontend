import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lightbulb, Clock, TrendingUp, Sparkles, MessageCircle } from 'lucide-react';
import { GenerateService } from '../services/apiService';
import { BusinessIdea, Thread } from '../types';
import { useToast } from './Toast';

interface IdeaDetailsPageProps {
  onBack: () => void;
  threadId: string;
  selectedIdeaId?: string;
}

interface RefinementItem {
  cardId: string;
  aspect: string;
  refinedContent: {
    content: string;
  };
  timestamp: string;
}

export const IdeaDetailsPage: React.FC<IdeaDetailsPageProps> = ({ 
  onBack, 
  threadId, 
  selectedIdeaId 
}) => {
  const { showToast } = useToast();
  const [thread, setThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<BusinessIdea | null>(null);
  const [refinements, setRefinements] = useState<RefinementItem[]>([]);

  useEffect(() => {
    const loadThreadDetails = async () => {
      try {
        setIsLoading(true);
        const threadData = await GenerateService.getThread(threadId);
        setThread(threadData);

        // Extract ideas from thread metadata
        const generatedContent = threadData.metadata?.generatedContent || [];
        const ideas = Array.isArray(generatedContent) ? generatedContent : [generatedContent];
        
        // Find the selected idea or default to first one
        const ideaToSelect = selectedIdeaId 
          ? ideas.find(idea => idea.id === selectedIdeaId) || ideas[0]
          : ideas[0];
        
        setSelectedIdea(ideaToSelect);

        // Extract refinements for the selected idea
        const allRefinements = threadData.metadata?.refinementHistory || [];
        const ideaRefinements = allRefinements.filter(
          (ref: RefinementItem) => ref.cardId === ideaToSelect?.id
        );
        setRefinements(ideaRefinements);

      } catch (error) {
        console.error('Error loading thread details:', error);
        showToast({ 
          type: 'error', 
          title: 'Failed to load idea details. Please try again.' 
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadThreadDetails();
  }, [threadId, selectedIdeaId, showToast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatRefinementAspect = (aspect: string) => {
    return aspect.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading idea details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!thread || !selectedIdea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Idea not found</h3>
              <p className="text-gray-500 mb-6">The idea you're looking for could not be found.</p>
              <button
                onClick={onBack}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to History</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-2">
              <Lightbulb className="w-8 h-8 text-purple-600" />
              <span>Idea Details</span>
            </h1>
          </div>
        </div>

        {/* Thread Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {thread.title || 'Idea Generation Session'}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Created {formatDate(thread.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{thread.appType}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Idea Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {selectedIdea.title || 'Untitled Idea'}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {selectedIdea.description || 'No description available'}
              </p>
              
              {selectedIdea.score && (
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                    Score: {selectedIdea.score}/10
                  </div>
                  {selectedIdea.complexity && (
                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium capitalize">
                      {selectedIdea.complexity}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Refinements Section */}
        {refinements.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h4 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <span>Refinements</span>
              </h4>
              <p className="text-gray-600 mt-1">
                Additional insights and details for this idea
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {refinements.map((refinement, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-semibold text-gray-800">
                      {formatRefinementAspect(refinement.aspect)}
                    </h5>
                    <span className="text-sm text-gray-500">
                      {formatDate(refinement.timestamp)}
                    </span>
                  </div>
                  
                  <div className="prose prose-gray max-w-none">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {refinement.refinedContent.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Refinements State */}
        {refinements.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 mb-2">No refinements yet</h4>
            <p className="text-gray-500">
              This idea hasn't been refined with additional details yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
