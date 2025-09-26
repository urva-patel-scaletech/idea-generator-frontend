import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Lightbulb, ChevronRight, Clock, TrendingUp } from 'lucide-react';
import { GenerateService } from '../services/apiService';
import { UserHistoryItem, BusinessIdea, UserHistoryData } from '../types';
import { useToast } from './Toast';

interface HistoryPageProps {
  onBack: () => void;
  onViewIdea?: (idea: BusinessIdea, threadId: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onBack, onViewIdea }) => {
  const { showToast } = useToast();
  const [history, setHistory] = useState<UserHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({ totalThreads: 0, totalIdeas: 0 });
  const [expandedThread, setExpandedThread] = useState<string | null>(null);
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Debounce search input to avoid excessive reloads and focus loss
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadHistory = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await GenerateService.getUserHistory(showSavedOnly, debouncedSearch);
      
      // Handle nested response structure from backend
      const historyData: UserHistoryData = 'data' in response.data 
        ? (response.data as { data: UserHistoryData }).data 
        : response.data as UserHistoryData;
      
      setHistory(historyData.history || []);
      setTotalStats({
        totalThreads: historyData.totalThreads || 0,
        totalIdeas: historyData.totalIdeas || 0
      });
    } catch (error) {
      console.error('Error loading history:', error);
      setHistory([]);
      setTotalStats({ totalThreads: 0, totalIdeas: 0 });
      showToast({ 
        type: 'error', 
        title: 'Failed to load history. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast, showSavedOnly, debouncedSearch]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

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

  const toggleThreadExpansion = (threadId: string) => {
    setExpandedThread(expandedThread === threadId ? null : threadId);
  };

  const handleIdeaClick = (idea: BusinessIdea, threadId: string) => {
    if (onViewIdea) {
      onViewIdea(idea, threadId);
    }
  };

  // Do not fully unmount the page on loading; keep input focused

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
              <span>Back</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-2">
              <Lightbulb className="w-8 h-8 text-purple-600" />
              <span>Your Ideas</span>
            </h1>
          </div>
          {/* Actions: Search + Saved Filter Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your ideas..."
              className="w-56 md:w-72 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setShowSavedOnly(false)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${!showSavedOnly ? 'bg-purple-600 text-white' : 'text-gray-700'}`}
              >
                All
              </button>
              <button
                onClick={() => setShowSavedOnly(true)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${showSavedOnly ? 'bg-purple-600 text-white' : 'text-gray-700'}`}
              >
                Saved
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Ideas Generated</p>
                <p className="text-2xl font-bold text-gray-800">{totalStats.totalIdeas}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Generation Sessions</p>
                <p className="text-2xl font-bold text-gray-800">{totalStats.totalThreads}</p>
              </div>
            </div>
          </div>
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div className="text-center py-16">
            <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No ideas generated yet</h3>
            <p className="text-gray-500 mb-6">Start generating ideas to see your history here!</p>
            <button
              onClick={onBack}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Generate Ideas
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((session) => (
              <div
                key={session.threadId}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
              >
                {/* Session Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleThreadExpansion(session.threadId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Lightbulb className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {session.title || 'Idea Generation Session'}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(session.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>{session.totalIdeas} ideas</span>
                          </div>
                          {session.hasRefinements && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              Refined
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedThread === session.threadId ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Ideas */}
                {expandedThread === session.threadId && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    <div className="p-6 space-y-4">
                      {session.generatedIdeas.map((idea, index) => (
                        <div
                          key={idea.id || index}
                          className="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => handleIdeaClick(idea, session.threadId)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 mb-2">
                                {idea.title || 'Untitled Idea'}
                              </h4>
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {idea.description || 'No description available'}
                              </p>
                              {idea.score && (
                                <div className="mt-2 flex items-center space-x-2">
                                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                    Score: {idea.score}/10
                                  </div>
                                </div>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0 ml-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
