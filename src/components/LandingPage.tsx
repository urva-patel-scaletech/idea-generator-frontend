import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Lightbulb, ChevronDown, ChevronRight, HelpCircle, History, X } from 'lucide-react';
import { TrendingInsights } from './TrendingInsights';
import { OAuthButtons } from './OAuthButtons';
import { FilterStep, FilterOptions } from './FilterStep';
import { IdeaGeneratorService, AuthService } from '../services/apiService';
import { useToast } from './Toast';
import { User, TrendingIdea } from '../types';

interface LandingPageProps {
  onGenerateIdeas: (industry: string) => void;
  isLoading: boolean;
  onTrendingSearchesLoad: (searches: TrendingIdea[]) => void;
  onViewHistory?: () => void;
}


const INDUSTRY_SUGGESTIONS = [
  'Healthcare & Wellness', 'Technology & Software', 'E-commerce & Retail', 'Education & Training',
  'Food & Beverage', 'Finance & Fintech', 'Real Estate', 'Entertainment & Media',
  'Sustainability & Green Tech', 'Travel & Tourism', 'Fitness & Sports', 'Beauty & Fashion'
];


export const LandingPage: React.FC<LandingPageProps> = ({ onGenerateIdeas, isLoading, onTrendingSearchesLoad, onViewHistory }) => {
  const { showToast } = useToast();
  // Mobile-first step controller - now includes filters step
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [anim, setAnim] = useState<'idle' | 'in' | 'out'>('idle');
  const [animDir, setAnimDir] = useState<'left' | 'right'>('right');
  const [industry, setIndustry] = useState('');
  const [businessIdea, setBusinessIdea] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({ budget: '', location: '', skills: [] });
  const [showIndustrySuggestions, setShowIndustrySuggestions] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [trendingSearches, setTrendingSearches] = useState<TrendingIdea[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const cardsRef = useRef<HTMLFormElement>(null);
  const industryInputRef = useRef<HTMLDivElement>(null);

  // Derived - businessIdea is now optional
  const isFormValid = useMemo(() => industry.trim().length > 0, [industry]);

  useEffect(() => {
    // Handle OAuth callback first, before checking authentication
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('token') || urlParams.has('error')) {
      const result = AuthService.handleOAuthCallback();
      
      if (result.success) {
        // Force update the current user state
        const user = AuthService.getCurrentUser();
        setCurrentUser(user);
        
        showToast({
          type: 'success',
          title: 'Login Successful',
          message: `Welcome ${user?.name || 'User'}! You have been successfully logged in.`
        });
        
        // Don't reload the page, just update the state
        return; // Exit early to prevent loading trending searches
      } else if (result.error) {
        showToast({
          type: 'error',
          title: 'OAuth Login Failed',
          message: result.error
        });
      }
    }
    
    // Check if user is authenticated (after OAuth callback processing)
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);
    
    // Load trending searches
    const loadTrendingSearches = async () => {
      try {
        const searches = await IdeaGeneratorService.getTrendingSearches();
        setTrendingSearches(searches);
        onTrendingSearchesLoad(searches);
      } catch {
        showToast({
          type: 'error',
          title: 'Failed to load trending ideas',
          message: 'Unable to fetch the latest trending business ideas. Please check your connection.',
          duration: 4000
        });
        // Set empty array so component doesn't show broken state
        setTrendingSearches([]);
        onTrendingSearchesLoad([]);
      }
    };
    
    loadTrendingSearches();
  }, [onTrendingSearchesLoad, showToast]);

  // Auto-advance removed per request; user proceeds via explicit Next button

  // Removed automatic scrolling per user feedback

  const validateInput = (): string | null => {
    if (!industry.trim()) return 'Please specify an industry or area of interest';
    // businessIdea is now optional - no validation needed
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateInput();
    if (validationError) {
      showToast({
        type: 'warning',
        title: 'Please complete the form',
        message: validationError
      });
      return;
    }
    
    // Anonymous users are now supported - no authentication required
    
    // Create a natural language prompt that includes filters
    let naturalPrompt = '';
    
    // Build base prompt
    if (businessIdea.trim()) {
      naturalPrompt = `I want to start a business in ${industry}: ${businessIdea}`;
    } else {
      naturalPrompt = `I want to start a business in ${industry}`;
    }
    
    // Add filter context
    const filterContext = [];
    if (filters.budget) {
      const budgetLabels = {
        'under-1k': 'with a budget under $1,000',
        '1k-5k': 'with a budget between $1,000-$5,000',
        '5k-25k': 'with a budget between $5,000-$25,000',
        '25k-100k': 'with a budget between $25,000-$100,000',
        'over-100k': 'with a budget over $100,000'
      };
      filterContext.push(budgetLabels[filters.budget as keyof typeof budgetLabels]);
    }
    
    if (filters.location) {
      const locationLabels = {
        'local': 'focusing on local/physical business',
        'online': 'focusing on online/digital business',
        'hybrid': 'combining online and physical presence'
      };
      filterContext.push(locationLabels[filters.location as keyof typeof locationLabels]);
    }
    
    if (filters.skills.length > 0) {
      filterContext.push(`leveraging skills in: ${filters.skills.join(', ')}`);
    }
    
    if (filterContext.length > 0) {
      naturalPrompt += ` ${filterContext.join(', ')}`;
    }
    
    try {
      await onGenerateIdeas(naturalPrompt);
    } catch (error: unknown) {
      // Extract error message from the error object
      let errorMessage = 'Failed to generate ideas. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      showToast({
        type: 'error',
        title: 'Generation Failed',
        message: errorMessage,
        duration: 5000
      });
    }
  };

  const handleExampleClick = (example: string) => {
    setBusinessIdea(example);
    setShowExamples(false);
  };


  const handleIndustrySelect = (suggestion: string) => {
    setIndustry(suggestion);
    setShowIndustrySuggestions(false);
  };

  // Handle click outside to close suggestions
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (industryInputRef.current && !industryInputRef.current.contains(event.target as Node)) {
      setShowIndustrySuggestions(false);
    }
  }, []);

  useEffect(() => {
    if (showIndustrySuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIndustrySuggestions, handleClickOutside]);

  const handleIndustryKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && industry.trim()) {
      e.preventDefault();
      setShowIndustrySuggestions(false);
      goNext();
    }
  };

  // Step navigation with simple slide animation
  const goNext = () => {
    if (step === 1 && !industry.trim()) return;
    setAnimDir('right');
    setAnim('out');
    setTimeout(() => {
      setStep((prev) => (prev === 3 ? 3 : ((prev + 1) as 1 | 2 | 3)));
      setAnim('in');
      setTimeout(() => setAnim('idle'), 250);
    }, 200);
  };

  const goBack = () => {
    if (step === 1) return;
    setAnimDir('left');
    setAnim('out');
    setTimeout(() => {
      setStep((prev) => (prev === 1 ? 1 : ((prev - 1) as 1 | 2 | 3)));
      setAnim('in');
      setTimeout(() => setAnim('idle'), 250);
    }, 200);
  };

  const handleOAuthSuccess = () => {
    setCurrentUser(AuthService.getCurrentUser());
    setShowAuthModal(false);
    
    // Proceed with idea generation if form is valid
    if (isFormValid) {
      let naturalPrompt = '';
      
      // Build prompt with filters for OAuth success
      if (businessIdea.trim()) {
        naturalPrompt = `I want to start a business in ${industry}: ${businessIdea}`;
      } else {
        naturalPrompt = `I want to start a business in ${industry}`;
      }
      
      // Add filter context for OAuth success flow too
      const filterContext = [];
      if (filters.budget) {
        const budgetLabels = {
          'under-1k': 'with a budget under $1,000',
          '1k-5k': 'with a budget between $1,000-$5,000',
          '5k-25k': 'with a budget between $5,000-$25,000',
          '25k-100k': 'with a budget between $25,000-$100,000',
          'over-100k': 'with a budget over $100,000'
        };
        filterContext.push(budgetLabels[filters.budget as keyof typeof budgetLabels]);
      }
      
      if (filters.location) {
        const locationLabels = {
          'local': 'focusing on local/physical business',
          'online': 'focusing on online/digital business',
          'hybrid': 'combining online and physical presence'
        };
        filterContext.push(locationLabels[filters.location as keyof typeof locationLabels]);
      }
      
      if (filters.skills.length > 0) {
        filterContext.push(`leveraging skills in: ${filters.skills.join(', ')}`);
      }
      
      if (filterContext.length > 0) {
        naturalPrompt += ` ${filterContext.join(', ')}`;
      }
      
      onGenerateIdeas(naturalPrompt);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-14">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl shadow-lg">
                <Lightbulb className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div className="leading-tight">
                <div className="text-base md:text-xl font-bold text-gray-800">AI Factory</div>
                <div className="hidden sm:block text-xs text-gray-500">Business Idea Studio</div>
              </div>
            </div>

            {/* Navigation & Auth */}
            <div className="flex items-center gap-2 sm:gap-3">
              {onViewHistory && (
                <button
                  onClick={onViewHistory}
                  className="flex items-center gap-1 px-3 py-2 text-sm md:text-base text-gray-700 hover:text-gray-900 transition-colors"
                  title="View History"
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">History</span>
                </button>
              )}
              {currentUser ? (
                <>
                  <span className="text-gray-600 text-sm md:text-base">Hi, {currentUser.name.split(' ')[0]}!</span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm md:text-base text-gray-700 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-3 py-2 rounded-lg bg-purple-600 text-white text-sm md:text-base hover:bg-purple-700 shadow-sm"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Hero */}
          <div className="text-center mt-8 md:mt-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
              Idea Spark Generator
            </h1>
            <p className="mt-3 md:mt-4 text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Transform your interests into breakthrough business opportunities.
              Get AI-powered ideas tailored to any industry in seconds.
            </p>
          </div>
        </div>

        {/* Guided Input - Mobile-first step cards */}
        <div className="max-w-md mx-auto relative">
          {/* Decorative animated gradient ring */}
          <div className="pointer-events-none absolute -inset-10 blur-3xl opacity-30 hidden sm:block" aria-hidden>
            <div className="w-full h-32 bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 rounded-full animate-pulse"></div>
          </div>
          {/* Progress */}
          <div className="flex items-center justify-center mb-4 gap-2">
            {[1,2,3].map((i) => (
              <span key={i} className={`h-2 rounded-full transition-all duration-300 ${step >= i ? 'bg-purple-600 w-10' : 'bg-purple-200 w-4'}`}></span>
            ))}
          </div>

          <form onSubmit={handleSubmit} ref={cardsRef}>
            {/* Cards container */}
            <div className="relative h-full">
              {/* Step 1 - Industry Input (previously Step 2) */}
              {step === 1 && (
                <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-purple-100 ${anim === 'out' ? (animDir==='right' ? 'translate-x-6 opacity-0' : '-translate-x-6 opacity-0') : anim==='in' ? 'translate-x-0 opacity-100' : 'opacity-100'} transition-all duration-200`}>
                  <div className="flex items-center mb-3">
                    <h3 className="text-base font-semibold text-gray-800">Which industry or area interests you?</h3>
                  </div>

                  <div className="relative" ref={industryInputRef}>
                    <div className="relative">
                      <input
                        type="text"
                        value={industry}
                        onChange={(e) => {
                          setIndustry(e.target.value);
                          setShowIndustrySuggestions(e.target.value.length > 0);
                        }}
                        onFocus={() => setShowIndustrySuggestions(true)}
                        onKeyPress={handleIndustryKeyPress}
                        placeholder="e.g., Healthcare, Technology, E-commerce... (Press Enter to continue)"
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300 outline-none"
                        disabled={isLoading}
                      />
                      {industry && (
                        <button
                          type="button"
                          onClick={() => {
                            setIndustry('');
                            setShowIndustrySuggestions(true);
                          }}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-20"
                          title="Clear selection"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {showIndustrySuggestions && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                        {INDUSTRY_SUGGESTIONS
                          .filter(suggestion => industry === '' || suggestion.toLowerCase().includes(industry.toLowerCase()))
                          .map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleIndustrySelect(suggestion)}
                              className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                            >
                              {suggestion}
                            </button>
                          ))
                        }
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end mt-4">
                    <button type="button" onClick={goNext} disabled={!industry.trim()} className="px-4 py-2 rounded-xl bg-purple-600 text-white disabled:bg-gray-300 disabled:text-gray-600">Next</button>
                  </div>
                </div>
              )}

              {/* Step 2 - Filters (Optional) */}
              {step === 2 && (
                <div className={`${anim === 'out' ? (animDir==='right' ? 'translate-x-6 opacity-0' : '-translate-x-6 opacity-0') : anim==='in' ? 'translate-x-0 opacity-100' : 'opacity-100'} transition-all duration-200`}>
                  <FilterStep
                    filters={filters}
                    onFiltersChange={setFilters}
                    onNext={goNext}
                    onBack={goBack}
                    isLoading={isLoading}
                  />
                </div>
              )}

              {/* Step 3 - Description (previously Step 2, now optional) */}
              {step === 3 && (
                <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-purple-100 ${anim === 'out' ? (animDir==='right' ? 'translate-x-6 opacity-0' : '-translate-x-6 opacity-0') : anim==='in' ? 'translate-x-0 opacity-100' : 'opacity-100'} transition-all duration-200`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <h3 className="text-base font-semibold text-gray-800">Describe your idea or situation <span className="text-sm text-gray-500 font-normal">(Optional)</span></h3>
                    </div>
                    <button type="button" onClick={() => setShowExamples(!showExamples)} className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 transition-colors">
                      <HelpCircle className="w-4 h-4" />
                      <span className="text-sm">Examples</span>
                      {showExamples ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>

                  {showExamples && (
                    <div className="mb-4 p-4 bg-purple-50 rounded-xl">
                      <h4 className="font-medium text-purple-800 mb-2">Example prompts:</h4>
                      <div className="space-y-2">
                        {[
                          'Small businesses struggle with inventory management',
                          'I love cooking and want to share recipes',
                          'Remote work tools are in high demand',
                          'I\'m a graphic designer with 5 years experience'
                        ].map((example, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleExampleClick(example)}
                            className="block w-full text-left p-2 text-sm text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                          >
                            "{example}"
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <textarea
                    value={businessIdea}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 500) {
                        setBusinessIdea(value);
                      }
                    }}
                    placeholder="Tell us more about your business idea, problem you want to solve, or leave blank to get general ideas..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300 outline-none resize-none"
                    rows={4}
                    maxLength={500}
                    disabled={isLoading}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className={`text-sm ${businessIdea.length > 450 ? 'text-orange-500' : businessIdea.length > 400 ? 'text-yellow-600' : 'text-gray-400'}`}>
                      {businessIdea.length}/500 characters (optional)
                    </div>
                    {businessIdea.length > 0 && (
                      <div className="text-sm text-green-600 flex items-center space-x-1">
                        <span>✓</span>
                        <span>Additional context provided</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <button type="button" onClick={goBack} className="text-gray-600 hover:text-gray-800 text-sm">Back</button>
                    <button
                      type="submit"
                      disabled={!isFormValid || isLoading}
                      className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white disabled:from-gray-400 disabled:to-gray-500 disabled:text-gray-100"
                    >
                      {isLoading ? 'Generating...' : 'Generate Ideas'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Trending Ideas Section */}
        <div className={`max-w-6xl mx-auto transition-all duration-300 ${showIndustrySuggestions ? 'mt-40 md:mt-45' : 'mt-10 md:mt-16'}`}>
          <div className="flex justify-center mb-6 md:mb-10">
            <div className="max-w-md">
              <TrendingInsights 
                trendingSearches={trendingSearches} 
                onTrendingClick={(trend) => {
                  setIndustry(trend.title);
                  setBusinessIdea(trend.description);
                  setStep(2);
                }}
              />
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-10 md:mt-16 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 md:mb-10">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            <div className="text-center p-4 md:p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-2xl">💭</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Tell Us Your Interest</h3>
              <p className="text-gray-600 text-sm">Enter any industry or passion you're curious about</p>
            </div>
            
            <div className="text-center p-4 md:p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Get AI Ideas</h3>
              <p className="text-gray-600 text-sm">Receive personalized business concepts instantly</p>
              {/* Intentionally not showing API items in this tile per request */}
            </div>
            
            <div className="text-center p-4 md:p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Refine & Launch</h3>
              <p className="text-gray-600 text-sm">Develop your favorites with detailed insights</p>
            </div>
          </div>
        </div>
        
        {/* Auth Modal - OAuth Only */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-center mb-6">
                Sign In to Continue
              </h2>
              
              {/* OAuth Buttons */}
              <OAuthButtons 
                onSuccess={handleOAuthSuccess}
                onError={(error) => {
                  showToast({
                    type: 'error',
                    title: 'OAuth Login Failed',
                    message: error
                  });
                }}
              />
              
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};