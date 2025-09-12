import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sparkles, Lightbulb, Target, TrendingUp, Users, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';
import { TrendingInsights } from './TrendingInsights';
import { IdeaGeneratorService, AuthService } from '../services/apiService';
import { TrendingSearch, User } from '../types';

interface LandingPageProps {
  onGenerateIdeas: (industry: string) => void;
  isLoading: boolean;
}

// Business context options
const BUSINESS_CONTEXTS = [
  { id: 'problem', label: 'Solve a Problem', icon: Target, description: 'I see a problem that needs solving' },
  { id: 'passion', label: 'Follow Passion', icon: Sparkles, description: 'I want to turn my passion into business' },
  { id: 'market', label: 'Market Opportunity', icon: TrendingUp, description: 'I spotted a market opportunity' },
  { id: 'skills', label: 'Use My Skills', icon: Users, description: 'I want to monetize my expertise' }
];

const INDUSTRY_SUGGESTIONS = [
  'Healthcare & Wellness', 'Technology & Software', 'E-commerce & Retail', 'Education & Training',
  'Food & Beverage', 'Finance & Fintech', 'Real Estate', 'Entertainment & Media',
  'Sustainability & Green Tech', 'Travel & Tourism', 'Fitness & Sports', 'Beauty & Fashion'
];

const EXAMPLE_PROMPTS = {
  problem: [
    'Small businesses struggle with inventory management',
    'Students find it hard to focus while studying online',
    'Pet owners worry when leaving pets alone'
  ],
  passion: [
    'I love cooking and want to share recipes',
    'I\'m passionate about sustainable living',
    'I enjoy teaching people new skills'
  ],
  market: [
    'Remote work tools are in high demand',
    'Elderly care services are growing rapidly',
    'Plant-based food market is expanding'
  ],
  skills: [
    'I\'m a graphic designer with 5 years experience',
    'I\'m fluent in 3 languages and love teaching',
    'I\'m a certified fitness trainer'
  ]
};

export const LandingPage: React.FC<LandingPageProps> = ({ onGenerateIdeas, isLoading }) => {
  // Mobile-first step controller
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [anim, setAnim] = useState<'idle' | 'in' | 'out'>('idle');
  const [animDir, setAnimDir] = useState<'left' | 'right'>('right');
  const [selectedContext, setSelectedContext] = useState<string>('');
  const [industry, setIndustry] = useState('');
  const [businessIdea, setBusinessIdea] = useState('');
  const [showIndustrySuggestions, setShowIndustrySuggestions] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });
  const [authLoading, setAuthLoading] = useState(false);
  const cardsRef = useRef<HTMLFormElement>(null);

  // Derived
  const isFormValid = useMemo(() => selectedContext && industry.trim() && businessIdea.trim().length >= 10, [selectedContext, industry, businessIdea]);

  useEffect(() => {
    // Check if user is authenticated
    setCurrentUser(AuthService.getCurrentUser());
    
    // Load trending searches
    const loadTrendingSearches = async () => {
      try {
        const searches = await IdeaGeneratorService.getTrendingSearches();
        setTrendingSearches(searches);
      } catch (error) {
        console.error('Failed to load trending searches:', error);
      }
    };
    
    loadTrendingSearches();
  }, []);

  // Auto-advance removed per request; user proceeds via explicit Next button

  // Removed automatic scrolling per user feedback

  const validateInput = (): string | null => {
    if (!selectedContext) return 'Please select what type of business idea you\'re looking for';
    if (!industry.trim()) return 'Please specify an industry or area of interest';
    if (!businessIdea.trim()) return 'Please describe your business idea or situation';
    if (businessIdea.trim().length < 10) return 'Please provide more details about your idea (at least 10 characters)';
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateInput();
    if (validationError) {
      alert(validationError);
      return;
    }
    
    if (!AuthService.isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }
    
    // Create a natural language prompt that the backend can parse
    let naturalPrompt = '';
    
    if (selectedContext === 'problem') {
      naturalPrompt = `I want to start a business in ${industry} to solve this problem: ${businessIdea}`;
    } else if (selectedContext === 'passion') {
      naturalPrompt = `I want to turn my passion into a ${industry} business: ${businessIdea}`;
    } else if (selectedContext === 'market') {
      naturalPrompt = `I see a market opportunity in ${industry}: ${businessIdea}`;
    } else if (selectedContext === 'skills') {
      naturalPrompt = `I want to use my skills to start a ${industry} business: ${businessIdea}`;
    } else {
      naturalPrompt = `I want to start something in ${industry}: ${businessIdea}`;
    }
    
    onGenerateIdeas(naturalPrompt);
  };

  const handleExampleClick = (example: string) => {
    setBusinessIdea(example);
    setShowExamples(false);
  };

  const handleSelectContext = (id: string) => {
    // Selecting context will advance via the effect above
    setSelectedContext(id);
  };

  const handleIndustrySelect = (selectedIndustry: string) => {
    setIndustry(selectedIndustry);
    setShowIndustrySuggestions(false);
    goNext();
  };

  // Step navigation with simple slide animation
  const goNext = () => {
    if (step === 1 && !selectedContext) return;
    if (step === 2 && !industry.trim()) return;
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    
    try {
      if (authMode === 'login') {
        await AuthService.login({ email: authData.email, password: authData.password });
      } else {
        await AuthService.register({ name: authData.name, email: authData.email, password: authData.password });
      }
      
      setCurrentUser(AuthService.getCurrentUser());
      setShowAuthModal(false);
      setAuthData({ name: '', email: '', password: '' });
      
      // Proceed with idea generation if form is valid
      if (isFormValid) {
        let naturalPrompt = '';
        
        if (selectedContext === 'problem') {
          naturalPrompt = `I want to start a business in ${industry} to solve this problem: ${businessIdea}`;
        } else if (selectedContext === 'passion') {
          naturalPrompt = `I want to turn my passion into a ${industry} business: ${businessIdea}`;
        } else if (selectedContext === 'market') {
          naturalPrompt = `I see a market opportunity in ${industry}: ${businessIdea}`;
        } else if (selectedContext === 'skills') {
          naturalPrompt = `I want to use my skills to start a ${industry} business: ${businessIdea}`;
        } else {
          naturalPrompt = `I want to start something in ${industry}: ${businessIdea}`;
        }
        
        onGenerateIdeas(naturalPrompt);
      }
    } catch (error) {
      alert(`${authMode === 'login' ? 'Login' : 'Registration'} failed: ${error}`);
    } finally {
      setAuthLoading(false);
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

            {/* Auth */}
            <div className="flex items-center gap-2 sm:gap-3">
              {currentUser ? (
                <>
                  <span className="hidden sm:block text-gray-600">Hi, {currentUser.name.split(' ')[0]}!</span>
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
                    onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                    className="px-3 py-2 text-sm md:text-base text-purple-700 hover:text-purple-900"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
                    className="px-3 py-2 rounded-lg bg-purple-600 text-white text-sm md:text-base hover:bg-purple-700 shadow-sm"
                  >
                    Sign Up
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
              {/* Step 1 */}
              {step === 1 && (
                <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-purple-100 ${anim === 'out' ? (animDir==='right' ? 'translate-x-6 opacity-0' : '-translate-x-6 opacity-0') : anim==='in' ? 'translate-x-0 opacity-100' : 'opacity-100'} transition-all duration-200`}> 
                  <div className="flex items-center mb-3">
                    <h3 className="text-base font-semibold text-gray-800">What type of business idea are you looking for?</h3>
                  </div>

                  <div className="grid gap-2">
                    {BUSINESS_CONTEXTS.map((context) => {
                      const IconComponent = context.icon;
                      const selected = selectedContext === context.id;
                      return (
                        <button
                          key={context.id}
                          type="button"
                          onClick={() => handleSelectContext(context.id)}
                          className={`p-4 rounded-xl border text-left transition-all duration-200 active:scale-[0.99] ${
                            selected ? 'border-purple-400 bg-purple-50 shadow-md' : 'border-gray-200 hover:border-purple-200'
                          }`}
                          disabled={isLoading}
                        >
                          <div className="flex items-start space-x-3">
                            <IconComponent className={`w-5 h-5 mt-0.5 ${selected ? 'text-purple-600' : 'text-gray-500'}`} />
                            <div>
                              <div className={`font-medium ${selected ? 'text-purple-800' : 'text-gray-800'}`}>{context.label}</div>
                              <div className="text-sm text-gray-600 mt-1">{context.description}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-end mt-4">
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!selectedContext}
                      className="px-4 py-2 rounded-xl bg-purple-600 text-white disabled:bg-gray-300 disabled:text-gray-600"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-purple-100 ${anim === 'out' ? (animDir==='right' ? 'translate-x-6 opacity-0' : '-translate-x-6 opacity-0') : anim==='in' ? 'translate-x-0 opacity-100' : 'opacity-100'} transition-all duration-200`}>
                  <div className="flex items-center mb-3">
                    <h3 className="text-base font-semibold text-gray-800">Which industry or area interests you?</h3>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => {
                        setIndustry(e.target.value);
                        setShowIndustrySuggestions(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowIndustrySuggestions(true)}
                      placeholder="e.g., Healthcare, Technology, E-commerce..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300 outline-none"
                      disabled={isLoading}
                    />
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

                  <div className="flex items-center justify-between mt-4">
                    <button type="button" onClick={goBack} className="text-gray-600 hover:text-gray-800 text-sm">Back</button>
                    <button type="button" onClick={goNext} disabled={!industry.trim()} className="px-4 py-2 rounded-xl bg-purple-600 text-white disabled:bg-gray-300 disabled:text-gray-600">Next</button>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-purple-100 ${anim === 'out' ? (animDir==='right' ? 'translate-x-6 opacity-0' : '-translate-x-6 opacity-0') : anim==='in' ? 'translate-x-0 opacity-100' : 'opacity-100'} transition-all duration-200`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <h3 className="text-base font-semibold text-gray-800">Describe your idea or situation</h3>
                    </div>
                    <button type="button" onClick={() => setShowExamples(!showExamples)} className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 transition-colors">
                      <HelpCircle className="w-4 h-4" />
                      <span className="text-sm">Examples</span>
                      {showExamples ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>

                  {showExamples && (
                    <div className="mb-4 p-4 bg-purple-50 rounded-xl">
                      <h4 className="font-medium text-purple-800 mb-2">Example prompts for {BUSINESS_CONTEXTS.find(c => c.id === selectedContext)?.label}:</h4>
                      <div className="space-y-2">
                        {EXAMPLE_PROMPTS[selectedContext as keyof typeof EXAMPLE_PROMPTS]?.map((example, index) => (
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
                    onChange={(e) => setBusinessIdea(e.target.value)}
                    placeholder={`Tell us more about your ${selectedContext === 'problem' ? 'problem' : selectedContext === 'passion' ? 'passion' : selectedContext === 'market' ? 'market opportunity' : 'skills and experience'}...`}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300 outline-none resize-none"
                    rows={4}
                    disabled={isLoading}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className={`text-sm ${businessIdea.length < 10 ? 'text-gray-400' : businessIdea.length < 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {businessIdea.length}/200 characters
                      {businessIdea.length < 10 && ' (minimum 10)'}
                    </div>
                    {businessIdea.length >= 10 && (
                      <div className="text-sm text-green-600 flex items-center space-x-1">
                        <span>✓</span>
                        <span>Good detail level</span>
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

        {/* Features Preview */}
        <div className="mt-10 md:mt-16 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 md:mb-10">
            How It Works
          </h2>
          <div className="grid lg:grid-cols-4 gap-6 md:gap-8">
            <div className="lg:col-span-3">
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
            
            <div className="lg:col-span-1">
              <TrendingInsights trendingSearches={trendingSearches} />
            </div>
          </div>
        </div>
        
        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-center mb-6">
                {authMode === 'login' ? 'Login' : 'Create Account'}
              </h2>
              
              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'register' && (
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={authData.name}
                    onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                )}
                
                <input
                  type="email"
                  placeholder="Email"
                  value={authData.email}
                  onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                
                <input
                  type="password"
                  placeholder="Password"
                  value={authData.password}
                  onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {authLoading ? 'Loading...' : (authMode === 'login' ? 'Login' : 'Sign Up')}
                  </button>
                </div>
              </form>
              
              <div className="text-center mt-4">
                <button
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-purple-600 hover:text-purple-800 transition-colors"
                >
                  {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};