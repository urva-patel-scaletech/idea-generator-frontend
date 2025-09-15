import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { ResultsSection } from './components/ResultsSection';
import { RefineModal } from './components/RefineModal';
import { UpgradeModal } from './components/UpgradeModal';
import { IdeaGeneratorService } from './services/apiService';
import { useUserLimits } from './hooks/useUserLimits';
import { BusinessIdea, RefineOption } from './types';

type AppState = 'landing' | 'results';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [currentIndustry, setCurrentIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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

  const handleGenerateIdeas = async (industry: string) => {
    setIsLoading(true);
    setCurrentIndustry(industry);
    
    try {
      const generatedIdeas = await IdeaGeneratorService.generateIdeas(industry);
      setIdeas(generatedIdeas.map(idea => ({ ...idea, industry })));
      setAppState('results');
    } catch (error) {
      console.error('Error generating ideas:', error);
      alert('Failed to generate ideas. Please try again.');
    } finally {
      setIsLoading(false);
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
      alert('Failed to refine idea. Please try again.');
    }
  };

  const handleSaveIdea = () => {
    alert('Coming soon! Save functionality will be available in the next update.');
  };

  const handleShareIdea = () => {
    alert('Coming soon! Share functionality will be available in the next update.');
  };

  const handleBackToLanding = () => {
    setAppState('landing');
    setIdeas([]);
    setCurrentIndustry('');
    setRefineModal({ isOpen: false, idea: null, isLoading: false });
  };

  const closeRefineModal = () => {
    setRefineModal({ isOpen: false, idea: null, isLoading: false });
  };

  return (
    <>
      {appState === 'landing' ? (
        <LandingPage
          onGenerateIdeas={handleGenerateIdeas}
          isLoading={isLoading}
        />
      ) : (
        <ResultsSection
          ideas={ideas}
          industry={currentIndustry}
          onBack={handleBackToLanding}
          onRefine={handleRefineIdea}
          onSave={handleSaveIdea}
          onShare={handleShareIdea}
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
    </>
  );
}

export default App;