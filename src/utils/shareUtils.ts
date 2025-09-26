import { BusinessIdea } from '../types';

// Simple base64 encoding/decoding for URL sharing
export const shareUtils = {
  /**
   * Create a shareable URL containing only core idea data
   */
  createShareableUrl: (idea: BusinessIdea): string => {
    const shareData = {
      id: idea.id,
      title: idea.title,
      description: idea.description,
      score: idea.score,
      growthPercentage: idea.growthPercentage,
      metrics: idea.metrics,
      sharedAt: Date.now(),
      version: 1
    };

    // Convert to JSON and encode
    const jsonString = JSON.stringify(shareData);
    const encoded = btoa(encodeURIComponent(jsonString));
    
    return `${window.location.origin}/shared?data=${encoded}`;
  },

  /**
   * Parse shared idea data from URL
   */
  parseSharedUrl: (): BusinessIdea | null => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const encodedData = urlParams.get('data');
      
      if (!encodedData) return null;

      // Decode and parse
      const jsonString = decodeURIComponent(atob(encodedData));
      const shareData = JSON.parse(jsonString);

      // Validate required fields
      if (!shareData.title || !shareData.description) {
        return null;
      }

      // Return as BusinessIdea format
      return {
        id: shareData.id || `shared-${Date.now()}`,
        title: shareData.title,
        description: shareData.description,
        score: shareData.score || 7.5,
        growthPercentage: shareData.growthPercentage || 15,
        metrics: shareData.metrics || {
          marketSize: 7,
          competition: 6,
          feasibility: 8,
          profitability: 7
        },
        marketScore: shareData.score || 7.5
      };
    } catch (error) {
      console.error('Error parsing shared URL:', error);
      return null;
    }
  },

  /**
   * Copy text to clipboard
   */
  copyToClipboard: async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        textArea.remove();
        return success;
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }
};
