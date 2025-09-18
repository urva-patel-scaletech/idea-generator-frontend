// Backend API Types
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assistant {
  id: string;
  name: string;
  category: 'idea' | 'strategy' | 'execution' | 'growth';
  description: string;
  systemPrompt: string;
  isActive: boolean;
  appType: string;
  promptConfig?: {
    userTemplate?: string;
    systemTemplate?: string;
    refinementTemplates?: Record<string, string>;
  };
  outputFormat?: {
    type?: string;
    structure?: Record<string, string>;
  };
  appSettings?: {
    defaultCount?: number;
    defaultFormat?: string;
    defaultIndustry?: string;
    refinementOptions?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Thread {
  id: string;
  userId: string;
  assistantId: string;
  title: string;
  summary?: string;
  stage: 'idea' | 'strategy' | 'execution' | 'growth';
  metadata?: {
    appType?: string;
    createdAt?: string;
    userInput?: string;
    userActions?: {
      saved?: unknown[];
      shared?: unknown[];
      refined?: unknown[];
    };
    resolvedParams?: {
      count?: number;
      format?: string;
      industry?: string;
      target_audience?: string;
    };
    generatedContent?: BusinessIdea[];
    refinementHistory?: unknown[];
  };
  createdAt: string;
  updatedAt: string;
  assistant?: Assistant;
}

export interface Message {
  id: string;
  threadId: string;
  sender: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

// Generate API Types
export interface GenerateRequest {
  appId: string;
  message: string;
}

export interface GenerateResult {
  content: string;
  score: number;
}

export interface GenerateResponse {
  success: boolean;
  message: string;
  data: {
    threadId: string;
    appType: string;
    results: GenerateResult | GenerateResult[];
    refinementOptions: string[];
  };
  timestamp: string;
}

export interface RefineRequest {
  cardId: string;
  aspect: 'business-model' | 'target-audience' | 'marketing-strategy' | 'financial-planning' | 'risk-assessment' | 'technical-requirements' | 'legal-compliance' | 'competitive-analysis' | 'revenue-streams' | 'operational-planning' | 'growth-strategy' | 'partnerships' | 'market-entry';
  options?: Record<string, unknown>;
}

export interface RefineResponse {
  success: boolean;
  message: string;
  data: {
    threadId: string;
    aspect: string;
    refinedContent: {
      content: string;
    };
    originalContent: BusinessIdea;
  };
  timestamp: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    user: User;
  };
  timestamp: string;
  path: string;
}

// Standard API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

// Assistants API Response
export type AssistantsResponse = ApiResponse<Assistant[]>;

// Threads API Response
export type ThreadsResponse = ApiResponse<Thread[]>;

// Messages API Response
export type MessagesResponse = ApiResponse<Message[]>;

// Frontend UI Types
export interface BusinessIdea {
  id: string;
  title: string;
  description: string;
  industry?: string;
  marketScore?: number; // 1-10 scale
  trendDirection?: 'up' | 'down' | 'stable';
  searchVolume?: string;
  score?: number;
}

export interface RefineOption {
  id: string;
  label: string;
  prompt: string;
}

export interface UserLimits {
  refinesUsed: number;
  maxRefines: number;
}

export interface TrendingIdea {
  title: string;
  description: string;
}

export interface TrendingResponse {
  success: boolean;
  message: string;
  data: TrendingIdea[];
  timestamp: string;
  path: string;
}

// Legacy type for backward compatibility
export interface TrendingSearch {
  id: string;
  title: string;
  appType: string;
  generatedContent?: Record<string, unknown>;
  userActions?: Record<string, unknown>;
  score: number;
  updatedAt: string;
}

// User History Types
export interface UserHistoryItem {
  threadId: string;
  title: string;
  appType: string;
  createdAt: string;
  updatedAt: string;
  generatedIdeas: BusinessIdea[];
  refinements: unknown[];
  totalIdeas: number;
  hasRefinements: boolean;
}

export interface UserHistoryData {
  totalThreads: number;
  totalIdeas: number;
  history: UserHistoryItem[];
}

export interface UserHistoryResponse {
  success: boolean;
  message: string;
  data: UserHistoryData | {
    success: boolean;
    data: UserHistoryData;
  };
  timestamp: string;
  path: string;
}

// API Error Response
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}