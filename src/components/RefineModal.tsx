import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Users, Target, TrendingUp, MessageCircle, Send, ChevronRight, DollarSign, Shield, Settings, Scale, BarChart3, Coins, Cog, Rocket, Handshake, MapPin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { BusinessIdea, RefineOption } from '../types';
import { GenerateService } from '../services/apiService';

interface RefineModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: BusinessIdea;
  onRefine: (option: RefineOption) => void;
  isLoading: boolean;
  refinedContent?: string;
  threadId?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const refineOptions: RefineOption[] = [
  {
    id: 'business-model',
    label: 'Business Model',
    prompt: 'business model'
  },
  {
    id: 'target-audience',
    label: 'Target Audience',
    prompt: 'target audience'
  },
  {
    id: 'marketing-strategy',
    label: 'Marketing Strategy',
    prompt: 'marketing strategy'
  },
  {
    id: 'financial-planning',
    label: 'Financial Planning',
    prompt: 'financial planning'
  },
  {
    id: 'risk-assessment',
    label: 'Risk Assessment',
    prompt: 'risk assessment'
  },
  {
    id: 'technical-requirements',
    label: 'Technical Requirements',
    prompt: 'technical requirements'
  },
  {
    id: 'legal-compliance',
    label: 'Legal & Compliance',
    prompt: 'legal compliance'
  },
  {
    id: 'competitive-analysis',
    label: 'Competitive Analysis',
    prompt: 'competitive analysis'
  },
  {
    id: 'revenue-streams',
    label: 'Revenue Streams',
    prompt: 'revenue streams'
  },
  {
    id: 'operational-planning',
    label: 'Operational Planning',
    prompt: 'operational planning'
  },
  {
    id: 'growth-strategy',
    label: 'Growth Strategy',
    prompt: 'growth strategy'
  },
  {
    id: 'partnerships',
    label: 'Partnerships',
    prompt: 'partnerships'
  },
  {
    id: 'market-entry',
    label: 'Market Entry',
    prompt: 'market entry'
  }
];

export const RefineModal: React.FC<RefineModalProps> = ({
  isOpen,
  onClose,
  idea,
  onRefine,
  isLoading,
  refinedContent,
  threadId
}) => {
  const [selectedOption, setSelectedOption] = useState<RefineOption | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeOptionId, setActiveOptionId] = useState<string | null>(null);
  const [hasNewContent, setHasNewContent] = useState(false);

  const loadChatHistory = React.useCallback(async () => {
    if (!threadId || !idea?.id) return;
    
    try {
      const response = await GenerateService.getChatHistory(threadId, idea.id) as { data: Array<{ sender: string; content: string; createdAt: string }> };
      const messages = response.data || [];
      
      // Convert backend messages to frontend format
      const chatMessages: ChatMessage[] = messages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
        timestamp: new Date(msg.createdAt),
      }));
      
      setChatMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setChatMessages([]);
    }
  }, [threadId, idea?.id]);

  // Load chat history when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedOption(null);
      setShowChat(false);
      setCurrentMessage('');
      setActiveOptionId(null);
      setHasNewContent(false);
      
      // Load existing chat history if threadId is available
      if (threadId && idea?.id) {
        loadChatHistory();
      } else {
        setChatMessages([]);
      }
    }
  }, [isOpen, threadId, idea?.id, loadChatHistory]);

  // Mark when fresh content arrives for the current selection
  useEffect(() => {
    if (selectedOption && !isLoading && refinedContent) {
      setHasNewContent(true);
    }
  }, [selectedOption, isLoading, refinedContent]);

  // Chat autoscroll to last message (declare hooks before any early return)
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (showChat) {
      // On opening chat or when messages change, scroll to bottom
      scrollToBottom('auto');
      // small timeout ensures layout is painted
      const id = setTimeout(() => scrollToBottom('smooth'), 0);
      return () => clearTimeout(id);
    }
  }, [showChat, chatMessages.length]);

  if (!isOpen) return null;

  const handleOptionSelect = (option: RefineOption) => {
    setSelectedOption(option);
    setActiveOptionId(option.id);
    setHasNewContent(false);
    onRefine(option);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || !threadId || isChatLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsChatLoading(true);

    try {
      const response = await GenerateService.chatWithAi(threadId, {
        cardId: idea.id,
        message: userMessage.content,
      }) as { data?: { aiResponse: string; timestamp: string }; aiResponse?: string; timestamp?: string };

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response.data?.aiResponse || response.aiResponse || 'No response received',
        timestamp: new Date(response.data?.timestamp || response.timestamp || new Date()),
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getIcon = (optionId: string) => {
    switch (optionId) {
      case 'business-model': return <TrendingUp className="w-5 h-5" />;
      case 'target-audience': return <Users className="w-5 h-5" />;
      case 'marketing-strategy': return <Target className="w-5 h-5" />;
      case 'financial-planning': return <DollarSign className="w-5 h-5" />;
      case 'risk-assessment': return <Shield className="w-5 h-5" />;
      case 'technical-requirements': return <Settings className="w-5 h-5" />;
      case 'legal-compliance': return <Scale className="w-5 h-5" />;
      case 'competitive-analysis': return <BarChart3 className="w-5 h-5" />;
      case 'revenue-streams': return <Coins className="w-5 h-5" />;
      case 'operational-planning': return <Cog className="w-5 h-5" />;
      case 'growth-strategy': return <Rocket className="w-5 h-5" />;
      case 'partnerships': return <Handshake className="w-5 h-5" />;
      case 'market-entry': return <MapPin className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200/60 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mt-1">Refine Your Idea</h2>
            <h3 className="text-base font-semibold text-gray-800 ">{idea.title}</h3>
            <p className="text-sm text-gray-600">Make this idea sharper with focused refinements</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 h-[calc(100vh-100px)] flex flex-col min-h-0">
        {/* Tabs */}
        <div className="px-6 py-5">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex bg-white/70 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg border border-white/50">
              <button
                onClick={() => setShowChat(false)}
                className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${!showChat ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'}`}
              >
                Refine Options
              </button>
              {threadId && (
                <button
                  onClick={() => setShowChat(true)}
                  className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${showChat ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'}`}
                >
                  <MessageCircle className="w-4 h-4 inline mr-1.5" /> Chat with AI
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className={`flex-1 px-6 pb-6 ${showChat ? 'overflow-y-hidden' : 'overflow-y-auto'} min-h-0 flex flex-col`}>
          <div className="max-w-4xl mx-auto h-full min-h-0 w-full flex flex-col">
            {!showChat && !selectedOption && (
              <div className="space-y-4">
                <p className="text-gray-700 mb-3">Choose how you'd like to refine this idea:</p>
                {refineOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option)}
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-purple-200 transition-all text-left flex items-center gap-4"
                  >
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-purple-50 text-purple-600">
                      {getIcon(option.id)}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-500">Generate focused guidance</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            )}

            {!showChat && selectedOption && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-700">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-purple-50 text-purple-600">
                    {getIcon(selectedOption.id)}
                  </span>
                  <span className="font-medium">Refining: {selectedOption.label}</span>
                </div>

                {isLoading && (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-8 h-8 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin"></div>
                    <span className="ml-3 text-gray-600">Generating refined content…</span>
                  </div>
                )}

                {!isLoading && hasNewContent && refinedContent && activeOptionId === selectedOption.id && (
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="font-semibold mb-2 text-gray-900">Refined Content</h4>
                    <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                          h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-gray-900">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-gray-800">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-medium mb-1 text-gray-700">{children}</h3>,
                          ul: ({ children }) => <ul className="mb-3 last:mb-0 pl-0 space-y-1">{children}</ul>,
                          li: ({ children }) => <li className="flex items-start gap-2"><span className="text-purple-600 mt-1">•</span><span>{children}</span></li>,
                          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                          em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                        }}
                      >
                        {refinedContent}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                <div className="pt-4 mt-4">
                  <button
                    onClick={() => setSelectedOption(null)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-purple-700 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    ← Back to options
                  </button>
                </div>
              </div>
            )}

            {showChat && (
              <div className="flex-1 flex flex-col min-h-0 bg-white border border-gray-200 rounded-xl shadow-sm">
                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 pb-25">
                  {chatMessages.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Start a conversation about this idea!</p>
                      <p className="text-sm">Ask questions, get suggestions, or explore improvements.</p>
                    </div>
                  )}
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <div className="text-sm prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="mb-2 last:mb-0 pl-4">{children}</ul>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat input */}
                <div className="border-t border-gray-200 p-3 sticky bottom-2 md:bottom-4 bg-white/95 backdrop-blur-sm rounded-xl z-10 shadow-md mx-3">
                  <form onSubmit={handleChatSubmit} className="flex space-x-2">
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder={`Ask about "${idea.title}"...`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={isChatLoading || !threadId}
                    />
                    <button
                      type="submit"
                      disabled={!currentMessage.trim() || isChatLoading || !threadId}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};