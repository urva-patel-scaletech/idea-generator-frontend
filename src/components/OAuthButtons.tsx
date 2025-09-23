import React from 'react';
import { AuthService } from '../services/apiService';
import { useToast } from './Toast';

interface OAuthButtonsProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export const OAuthButtons: React.FC<OAuthButtonsProps> = ({ 
  onSuccess, 
  onError, 
  disabled = false 
}) => {
  const { showToast } = useToast();

  const handleGoogleLogin = () => {
    try {
      AuthService.initiateGoogleOAuth();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google login failed';
      onError?.(errorMessage);
      showToast({
        type: 'error',
        title: 'Google Login Failed',
        message: errorMessage
      });
    }
  };

  const handleAppleLogin = () => {
    try {
      AuthService.initiateAppleOAuth();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Apple login failed';
      onError?.(errorMessage);
      showToast({
        type: 'error',
        title: 'Apple Login Failed',
        message: errorMessage
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Google OAuth Button */}
      <button
        onClick={handleGoogleLogin}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-gray-700 font-medium">Continue with Google</span>
      </button>

      {/* Apple OAuth Button */}
      <button
        onClick={handleAppleLogin}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        <span className="font-medium">Continue with Apple</span>
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or</span>
        </div>
      </div>
    </div>
  );
};

// Separate component for mobile OAuth (when using native SDKs)
interface MobileOAuthButtonsProps {
  onGoogleSuccess?: (token: string) => void;
  onAppleSuccess?: (token: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export const MobileOAuthButtons: React.FC<MobileOAuthButtonsProps> = ({
  onGoogleSuccess,
  onAppleSuccess,
  onError,
  disabled = false
}) => {
  const { showToast } = useToast();

  const handleGoogleMobile = async () => {
    try {
      // This would integrate with Google SDK for mobile
      // For now, we'll show a placeholder
      showToast({
        type: 'info',
        title: 'Mobile OAuth',
        message: 'Mobile Google OAuth integration requires native SDK setup'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google mobile login failed';
      onError?.(errorMessage);
    }
  };

  const handleAppleMobile = async () => {
    try {
      // This would integrate with Apple SDK for mobile
      // For now, we'll show a placeholder
      showToast({
        type: 'info',
        title: 'Mobile OAuth',
        message: 'Mobile Apple OAuth integration requires native SDK setup'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Apple mobile login failed';
      onError?.(errorMessage);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleGoogleMobile}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-gray-700 font-medium">Google (Mobile SDK)</span>
      </button>

      <button
        onClick={handleAppleMobile}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        <span className="font-medium">Apple (Mobile SDK)</span>
      </button>
    </div>
  );
};
