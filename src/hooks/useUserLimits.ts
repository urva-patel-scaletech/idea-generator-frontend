import { useState } from 'react';
import { UserLimits } from '../types';

export const useUserLimits = () => {
  const [limits, setLimits] = useState<UserLimits>({
    refinesUsed: 0,
    maxRefines: Infinity
  });

  const canRefine = limits.refinesUsed < limits.maxRefines;

  const useRefine = () => {
    if (canRefine) {
      setLimits(prev => ({
        ...prev,
        refinesUsed: prev.refinesUsed + 1
      }));
      return true;
    }
    return false;
  };

  const resetLimits = () => {
    setLimits({
      refinesUsed: 0,
      maxRefines: Infinity
    });
  };

  return {
    limits,
    canRefine,
    useRefine,
    resetLimits
  };
};