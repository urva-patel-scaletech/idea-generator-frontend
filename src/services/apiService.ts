import {
  BusinessIdea,
  GenerateRequest,
  GenerateResult,
  GenerateResponse,
  RefineRequest,
  RefineResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Assistant,
  Thread,
  Message,
  User,
  TrendingSearch,
  ApiError,
  AssistantsResponse,
  ThreadsResponse,
  MessagesResponse
} from '../types';

import { API_CONFIG } from '../config/api';

// API Configuration
const API_BASE_URL = API_CONFIG.BASE_URL;

class ApiClient {
  private static getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private static getAuthHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        statusCode: response.status,
        message: response.statusText,
        error: 'Unknown Error'
      }));
      throw new Error(Array.isArray(error.message) ? error.message.join(', ') : error.message);
    }
    return response.json();
  }

  static async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<T>(response);
  }

  static async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });
    return this.handleResponse<T>(response);
  }

  static async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });
    return this.handleResponse<T>(response);
  }

  static async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<T>(response);
  }
}

// Authentication Service
export class AuthService {
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await ApiClient.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem('auth_token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response;
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await ApiClient.post<AuthResponse>('/auth/register', userData);
    localStorage.setItem('auth_token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response;
  }

  static logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  static getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      // Handle cases where storage contains the string values 'undefined' or 'null'
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        if (userStr === 'undefined' || userStr === 'null') {
          localStorage.removeItem('user');
        }
        return null;
      }
      const parsed = JSON.parse(userStr) as User | unknown;
      // Basic shape check
      if (parsed && typeof parsed === 'object' && 'id' in (parsed as Record<string, unknown>)) {
        return parsed as User;
      }
      return null;
    } catch {
      // If parsing fails, clear the bad value to avoid repeated errors
      localStorage.removeItem('user');
      return null;
    }
  }

  static isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    const user = this.getCurrentUser();
    return Boolean(token && user);
  }
}

// Assistant Service
export class AssistantService {
  static async getAllAssistants(): Promise<Assistant[]> {
    const response = await ApiClient.get<AssistantsResponse>('/assistants');
    return response.data;
  }

  static async getAssistantsByCategory(category: string): Promise<Assistant[]> {
    const response = await ApiClient.get<AssistantsResponse>(`/assistants?category=${category}`);
    return response.data;
  }

  static async getAssistantById(id: string): Promise<Assistant> {
    const response = await ApiClient.get<{ success: boolean; message: string; data: Assistant; timestamp: string; path: string }>(`/assistants/${id}`);
    return response.data;
  }
}

// Thread Service
export class ThreadService {
  static async getAllThreads(): Promise<Thread[]> {
    const response = await ApiClient.get<ThreadsResponse>('/threads');
    return response.data;
  }

  static async getThreadsByUser(userId: string): Promise<Thread[]> {
    const response = await ApiClient.get<ThreadsResponse>(`/threads?userId=${userId}`);
    return response.data;
  }

  static async getThreadById(id: string): Promise<Thread> {
    const response = await ApiClient.get<{ success: boolean; message: string; data: Thread; timestamp: string; path: string }>(`/threads/${id}`);
    return response.data;
  }

  static async createThread(data: { userId: string; assistantId: string; title: string; stage: string }): Promise<Thread> {
    const response = await ApiClient.post<{ success: boolean; message: string; data: Thread; timestamp: string; path: string }>('/threads', data);
    return response.data;
  }

  static async updateThread(id: string, data: Partial<Thread>): Promise<Thread> {
    const response = await ApiClient.patch<{ success: boolean; message: string; data: Thread; timestamp: string; path: string }>(`/threads/${id}`, data);
    return response.data;
  }

  static async deleteThread(id: string): Promise<void> {
    await ApiClient.delete<{ success: boolean; message: string; timestamp: string; path: string }>(`/threads/${id}`);
  }
}

// Message Service
export class MessageService {
  static async getMessagesByThread(threadId: string): Promise<Message[]> {
    const response = await ApiClient.get<MessagesResponse>(`/messages/thread/${threadId}`);
    return response.data;
  }

  static async sendMessage(data: { threadId: string; content: string }): Promise<{ userMessage: Message; assistantMessage: Message }> {
    const response = await ApiClient.post<{ success: boolean; message: string; data: { userMessage: Message; assistantMessage: Message }; timestamp: string; path: string }>('/messages/send', data);
    return response.data;
  }
}

// Generate Service (Main AI functionality)
export class GenerateService {
  static async generateContent(request: GenerateRequest): Promise<GenerateResponse> {
    return ApiClient.post<GenerateResponse>('/generate', request);
  }

  static async refineContent(threadId: string, request: RefineRequest): Promise<RefineResponse> {
    return ApiClient.post<RefineResponse>(`/generate/${threadId}/refine`, request);
  }

  static async saveIdea(threadId: string, ideaId: string, customTitle?: string): Promise<void> {
    await ApiClient.post<{ success: boolean; message: string; timestamp: string; path: string }>(`/generate/${threadId}/save`, { ideaId, customTitle });
  }

  static async shareIdea(threadId: string, ideaId: string, shareSettings?: Record<string, unknown>): Promise<void> {
    await ApiClient.post<{ success: boolean; message: string; timestamp: string; path: string }>(`/generate/${threadId}/share`, { ideaId, shareSettings });
  }

  static async getThread(threadId: string): Promise<Thread> {
    const response = await ApiClient.get<{ success: boolean; message: string; data: Thread; timestamp: string; path: string }>(`/generate/${threadId}`);
    return response.data;
  }

  static async getTrendingIdeas(appType?: string): Promise<TrendingSearch[]> {
    const endpoint = appType ? `/generate/trending?appType=${appType}` : '/generate/trending';
    const response = await ApiClient.get<{ success: boolean; message: string; data: TrendingSearch[]; timestamp: string; path: string }>(endpoint);
    return response.data;
  }

  static async chatWithAi(threadId: string, chatDto: { cardId: string; message: string }) {
    const response = await ApiClient.post(`/generate/${threadId}/chat`, chatDto);
    return response;
  }

  static async getChatHistory(threadId: string, cardId: string) {
    const response = await ApiClient.get(`/generate/${threadId}/chat/${cardId}`);
    return response;
  }
}

// Main Idea Generator Service (Updated to use backend)
export class IdeaGeneratorService {
  // ... (rest of the class remains the same)
  // Keep track of the latest generation thread to enable refinement calls
  private static currentThreadId?: string;

  static getCurrentThreadId(): string | undefined {
    return IdeaGeneratorService.currentThreadId;
  }

  static async generateIdeas(industry: string): Promise<BusinessIdea[]> {
    try {
      // Use fixed app ID as requested, instead of fetching assistants
      const appId = '0354d0c9-8e35-4a1a-b635-e611cab72fb1';

      const request: GenerateRequest = {
        appId: appId,
        message: industry,
      };

      const response = await GenerateService.generateContent(request);
      // Capture threadId for subsequent refine requests
      IdeaGeneratorService.currentThreadId = response.data.threadId;

      // Type guards for results shape
      const results = response.data.results;
      const isGenerateResultArray = (x: unknown): x is GenerateResult[] => Array.isArray(x);
      const isGenerateResult = (x: unknown): x is GenerateResult =>
        typeof x === 'object' && x !== null && typeof (x as GenerateResult).content === 'string';

      // Handle results array directly (each result is now a proper JSON object)
      if (isGenerateResultArray(results)) {
        return results.map((result) => {
          // Check if result is already a proper object with title/description
          if (typeof result === 'object' && result !== null && 'title' in result && 'description' in result) {
            // Result is already a proper card object
            const cardResult = result as Record<string, unknown>;
            return {
              id: (cardResult.id as string) || `fallback-${Date.now()}`,
              title: (cardResult.title as string) || 'Untitled Idea',
              description: (cardResult.description as string) || 'No description available',
              score: (cardResult.score as number) || result.score || 7.5,
              marketScore: (cardResult.score as number) || result.score || 7.5,
              complexity: 'simple'
            } as BusinessIdea;
          }
          
          // Fallback: Parse the content if it's still a string (backward compatibility)
          let parsedIdea: Record<string, unknown> = {};
          try {
            // Try to parse the JSON content
            const jsonMatch = result.content.match(/```json\s*([\s\S]*?)\s*```/);
            const jsonPayload = jsonMatch && jsonMatch[1] ? jsonMatch[1] : result.content;
            const parsed = JSON.parse(jsonPayload);
            
            if (Array.isArray(parsed) && parsed.length > 0) {
              parsedIdea = parsed[0]; // Take first item if array
            } else if (typeof parsed === 'object') {
              parsedIdea = parsed;
            }
          } catch {
            // If JSON parsing fails, try to extract from plain text
            const content = result.content;
            const titleMatch = content.match(/["""']title["""']:\s*["""']([^"""']+)["""']/i) || 
                             content.match(/title:\s*([^\n,}]+)/i);
            const descMatch = content.match(/["""']description["""']:\s*["""']([^"""']+)["""']/i) || 
                             content.match(/description:\s*([^\n,}]+)/i);
            
            if (titleMatch) parsedIdea.title = titleMatch[1].trim();
            if (descMatch) parsedIdea.description = descMatch[1].trim();
          }

          const resultWithId = result as unknown as Record<string, unknown>;
          return {
            id: (resultWithId.id as string) || `fallback-${Date.now()}`,
            title: (parsedIdea.title as string) || 'Untitled Idea',
            description: (parsedIdea.description as string) || 'No description available',
            score: result.score ?? (parsedIdea.score as number),
            marketScore: result.score ?? (parsedIdea.score as number),
            complexity: 'simple'
          } as BusinessIdea;
        });
      } else if (isGenerateResult(results)) {
        // Handle single result
        let parsedIdea: Record<string, unknown> = {};
        try {
          const jsonMatch = results.content.match(/```json\s*([\s\S]*?)\s*```/);
          const jsonPayload = jsonMatch && jsonMatch[1] ? jsonMatch[1] : results.content;
          const parsed = JSON.parse(jsonPayload);
          
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsedIdea = parsed[0]; // Take first item if array
          } else if (typeof parsed === 'object') {
            parsedIdea = parsed;
          }
        } catch {
          // If JSON parsing fails, try to extract from plain text
          const content = results.content;
          const titleMatch = content.match(/["""]title["""]:\s*["""]([^"""]+)["""]/i) || 
                           content.match(/title:\s*([^\n,}]+)/i);
          const descMatch = content.match(/["""]description["""]:\s*["""]([^"""]+)["""]/i) || 
                           content.match(/description:\s*([^\n,}]+)/i);
          
          if (titleMatch) parsedIdea.title = titleMatch[1].trim();
          if (descMatch) parsedIdea.description = descMatch[1].trim();
        }

        const resultsWithId = results as unknown as Record<string, unknown>;
        return [{
          id: (resultsWithId.id as string) || `fallback-${Date.now()}`,
          title: (parsedIdea.title as string) || 'Untitled Idea',
          description: (parsedIdea.description as string) || 'No description available',
          score: results.score ?? (parsedIdea.score as number),
          marketScore: results.score ?? (parsedIdea.score as number),
          complexity: 'simple'
        } as BusinessIdea];
      }

      // If parsing fails, return empty array (no dummy data)
      return [];
    } catch (error) {
      console.error('Error generating ideas:', error);
      // No fallback dummy data
      return [];
    }
  }

  static async refineIdea(idea: BusinessIdea, refinementType: string, threadId?: string): Promise<string> {
    try {
      const effectiveThreadId = threadId || IdeaGeneratorService.getCurrentThreadId();
      if (!effectiveThreadId) throw new Error('Thread ID is required for refinement');

      // Use refinementType directly as it's now the option.id
      const aspect = refinementType;
      
      const request: RefineRequest = {
        cardId: idea.id, // Pass the card ID from the idea
        aspect: aspect as RefineRequest['aspect']
      };

      const response = await GenerateService.refineContent(effectiveThreadId, request);
      return response.data.refinedContent.content;
    } catch (error) {
      console.error('Error refining idea:', error);
      // No dummy fallback
      throw error;
    }
  }

  static async getTrendingSearches(): Promise<TrendingSearch[]> {
    try {
      return await GenerateService.getTrendingIdeas();
    } catch (error) {
      console.error('Error fetching trending searches:', error);
      // No dummy fallback
      return [];
    }
  }


  // Removed all fallback/dummy methods to ensure only backend data is shown
}