import { AuthService } from './apiService';
import { deviceService } from '../utils/deviceFingerprint';

export interface UserState {
  isAuthenticated: boolean;
  isAnonymous: boolean;
  deviceId?: string;
  user?: any;
}

class UserStateService {
  private static instance: UserStateService;
  private currentState: UserState | null = null;

  private constructor() {}

  static getInstance(): UserStateService {
    if (!UserStateService.instance) {
      UserStateService.instance = new UserStateService();
    }
    return UserStateService.instance;
  }

  getCurrentState(): UserState {
    if (!this.currentState) {
      this.currentState = this.calculateUserState();
    }
    return this.currentState;
  }

  private calculateUserState(): UserState {
    const isAuthenticated = AuthService.isAuthenticated();
    const user = AuthService.getCurrentUser();
    
    if (isAuthenticated && user) {
      return {
        isAuthenticated: true,
        isAnonymous: false,
        user
      };
    }

    // Anonymous user state
    const deviceInfo = deviceService.getDeviceInfo();
    return {
      isAuthenticated: false,
      isAnonymous: true,
      deviceId: deviceInfo.deviceId
    };
  }

  refreshState(): UserState {
    this.currentState = this.calculateUserState();
    return this.currentState;
  }

  onLogin(): void {
    this.refreshState();
  }

  onLogout(): void {
    AuthService.logout();
    this.refreshState();
  }

  onRegister(): void {
    this.refreshState();
  }

  // Check if user should save data locally (anonymous) or use backend (authenticated)
  shouldSaveLocally(): boolean {
    const state = this.getCurrentState();
    return state.isAnonymous;
  }

  // Get user identifier for API calls
  getUserIdentifier(): string | null {
    const state = this.getCurrentState();
    if (state.isAuthenticated && state.user) {
      return state.user.id;
    }
    if (state.isAnonymous && state.deviceId) {
      return state.deviceId;
    }
    return null;
  }
}

export const userStateService = UserStateService.getInstance();
