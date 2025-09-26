import { useState, useCallback, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { ResultsSection } from './components/ResultsSection';
import { HistoryPage } from './components/HistoryPage';
import { IdeaDetailsPage } from './components/IdeaDetailsPage';
import { SharedIdeaPage } from './components/SharedIdeaPage';
import { RefineModal } from './components/RefineModal';
import { UpgradeModal } from './components/UpgradeModal';
import { ToastProvider } from './components/Toast';
import { IdeaGeneratorService, GenerateService } from './services/apiService';
import { useUserLimits } from './hooks/useUserLimits';
import { BusinessIdea, RefineOption } from './types';

type AppState = 'landing' | 'results' | 'history' | 'idea-details' | 'shared';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [currentIndustry, setCurrentIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for shared URL on app load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('data')) {
      setAppState('shared');
    }
  }, []);
  
  // Idea details state
  const [selectedThreadId, setSelectedThreadId] = useState<string>('');
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>('');
  
  // Modal states
  const [refineModal, setRefineModal] = useState<{
    isOpen: boolean;
    idea: BusinessIdea | null;
    isLoading: boolean;
    content?: string;
  }>({
    isOpen: false,
    idea: null,
    isLoading: false
  });
  
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
  // User limits
  const { canRefine, useRefine: consumeRefineCredit } = useUserLimits();

  // Memoized callback to prevent unnecessary re-renders
  const handleTrendingSearchesLoad = useCallback(() => {
    // This function is intentionally empty as trending searches are handled internally
  }, []);

  const handleGenerateIdeas = async (industry: string) => {
    setIsLoading(true);
    setCurrentIndustry(industry);
    
    try {
      const generatedIdeas = await IdeaGeneratorService.generateIdeas(industry);
      setIdeas(generatedIdeas.map(idea => ({ ...idea, industry })));
      setAppState('results');
      setIsLoading(false);
    } catch (error: unknown) {
      console.error('Error generating ideas:', error);
      setIsLoading(false);
      // Don't change app state - stay on landing page
      // Re-throw error so LandingPage can handle it with toast
      throw error;
    }
  };

  const handleRefineIdea = (idea: BusinessIdea) => {
    if (canRefine) {
      setRefineModal({
        isOpen: true,
        idea,
        isLoading: false
      });
    } else {
      setUpgradeModalOpen(true);
    }
  };

  const handleRefineOption = async (option: RefineOption) => {
    if (!refineModal.idea) return;
    
    setRefineModal(prev => ({
      ...prev,
      isLoading: true
    }));

    try {
      const refinedContent = await IdeaGeneratorService.refineIdea(refineModal.idea, option.id);
      consumeRefineCredit(); // Consume a refine credit
      
      setRefineModal(prev => ({
        ...prev,
        isLoading: false,
        content: refinedContent
      }));
    } catch (error) {
      console.error('Error refining idea:', error);
      setRefineModal(prev => ({
        ...prev,
        isLoading: false
      }));
      // Error handling will be added with toast system
    }
  };

  const handleSaveIdea = async (idea: BusinessIdea) => {
    try {
      const threadId = IdeaGeneratorService.getCurrentThreadId();
      if (!threadId) throw new Error('Missing thread id');
      await GenerateService.saveIdea(threadId, idea.id);
    } catch (e) {
      console.error('Failed to save idea', e);
    }
  };


  const handleBackToLanding = () => {
    setAppState('landing');
    setIdeas([]);
    setCurrentIndustry('');
    setSelectedThreadId('');
    setSelectedIdeaId('');
    setRefineModal({ isOpen: false, idea: null, isLoading: false });
  };

  const handleBackToHistory = () => {
    setAppState('history');
    setSelectedThreadId('');
    setSelectedIdeaId('');
  };

  const handleViewHistory = () => {
    setAppState('history');
  };

  const handleViewIdea = (idea: BusinessIdea, threadId: string) => {
    console.log('View idea:', idea, 'from thread:', threadId);
    setSelectedThreadId(threadId);
    setSelectedIdeaId(idea.id);
    setAppState('idea-details');
  };

  const closeRefineModal = () => {
    setRefineModal({ isOpen: false, idea: null, isLoading: false });
  };

  return (
    <ToastProvider>
      {appState === 'landing' ? (
        <LandingPage
          onGenerateIdeas={handleGenerateIdeas}
          isLoading={isLoading}
          onTrendingSearchesLoad={handleTrendingSearchesLoad}
          onViewHistory={handleViewHistory}
        />
      ) : appState === 'history' ? (
        <HistoryPage
          onBack={handleBackToLanding}
          onViewIdea={handleViewIdea}
        />
      ) : appState === 'idea-details' ? (
        <IdeaDetailsPage
          onBack={handleBackToHistory}
          threadId={selectedThreadId}
          selectedIdeaId={selectedIdeaId}
        />
      ) : appState === 'shared' ? (
        <SharedIdeaPage onNavigateToLanding={handleBackToLanding} />
      ) : (
        <ResultsSection
          ideas={ideas}
          industry={currentIndustry}
          onBack={handleBackToLanding}
          onRefine={handleRefineIdea}
          onSave={handleSaveIdea}
          canRefine={canRefine}
        />
      )}

      <RefineModal
        isOpen={refineModal.isOpen}
        onClose={closeRefineModal}
        idea={refineModal.idea!}
        onRefine={handleRefineOption}
        isLoading={refineModal.isLoading}
        refinedContent={refineModal.content}
        threadId={IdeaGeneratorService.getCurrentThreadId()}
      />

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
      />
    </ToastProvider>
  );
}

export default App;