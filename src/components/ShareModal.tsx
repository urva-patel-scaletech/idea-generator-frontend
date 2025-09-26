import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { BusinessIdea } from '../types';
import { shareUtils } from '../utils/shareUtils';

interface ShareModalProps {
  idea: BusinessIdea;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ idea, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  React.useEffect(() => {
    if (isOpen && idea) {
      const url = shareUtils.createShareableUrl(idea);
      setShareUrl(url);
    }
  }, [isOpen, idea]);

  const handleCopyLink = async () => {
    const success = await shareUtils.copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Share Idea</h2>
          </div>
          <p className="text-gray-600 text-sm">Share this business idea with others</p>
        </div>

        {/* Idea Preview */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-1">{idea.title}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{idea.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Score: {idea.score}/10</span>
            <span>Growth: {idea.growthPercentage}%</span>
          </div>
        </div>

        {/* Copy Link */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Share Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-600"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>


        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Recipients will see the core idea details only (no chat history or refinements)
          </p>
        </div>
      </div>
    </div>
  );
};
