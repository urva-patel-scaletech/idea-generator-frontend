import React from 'react';
import { X, Crown, Check } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Crown className="w-6 h-6" />
              <h2 className="text-xl font-bold">Upgrade to Pro</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-purple-100">
            You've used your free refine! Unlock unlimited idea refinements and more.
          </p>
        </div>

        {/* Features */}
        <div className="p-6">
          <div className="space-y-4 mb-6">
            {[
              'Unlimited idea refinements',
              'Save ideas to your library',
              'Export ideas to PDF',
              'Priority customer support',
              'Early access to new features'
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => alert('Sign up functionality coming soon!')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 
                       hover:from-purple-700 hover:to-blue-700
                       text-white font-semibold py-3 px-6 rounded-xl 
                       transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Start Free Trial
            </button>
            
            <button
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-800 font-medium py-2
                       transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};