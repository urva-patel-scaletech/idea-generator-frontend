import React, { useState } from 'react';
import { DollarSign, MapPin, User, ChevronDown } from 'lucide-react';

export interface FilterOptions {
  budget: string;
  location: string;
  skills: string[];
}

interface FilterStepProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

const BUDGET_OPTIONS = [
  { value: '', label: 'Any Budget' },
  { value: 'under-1k', label: 'Under $1,000' },
  { value: '1k-5k', label: '$1,000 - $5,000' },
  { value: '5k-25k', label: '$5,000 - $25,000' },
  { value: '25k-100k', label: '$25,000 - $100,000' },
  { value: 'over-100k', label: '$100,000+' }
];

const LOCATION_OPTIONS = [
  { value: '', label: 'Any Location' },
  { value: 'local', label: 'Local/Physical Business' },
  { value: 'online', label: 'Online/Digital Business' },
  { value: 'hybrid', label: 'Hybrid (Online + Physical)' }
];

const SKILL_OPTIONS = [
  'Technical/Programming',
  'Creative/Design',
  'Sales/Marketing',
  'Management/Leadership',
  'Finance/Accounting',
  'Healthcare/Medical',
  'Education/Teaching',
  'No Experience Required'
];

export const FilterStep: React.FC<FilterStepProps> = ({
  filters,
  onFiltersChange,
  onNext,
  onBack,
  isLoading = false
}) => {
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);

  const handleBudgetChange = (budget: string) => {
    onFiltersChange({ ...filters, budget });
  };

  const handleLocationChange = (location: string) => {
    onFiltersChange({ ...filters, location });
  };

  const handleSkillToggle = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];
    onFiltersChange({ ...filters, skills: newSkills });
  };

  const clearAllFilters = () => {
    onFiltersChange({ budget: '', location: '', skills: [] });
  };

  const hasFilters = filters.budget || filters.location || filters.skills.length > 0;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-purple-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-800">
          Refine Your Ideas <span className="text-sm text-gray-500 font-normal">(Optional)</span>
        </h3>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Budget Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 text-purple-600" />
            Starting Budget
          </label>
          <select
            value={filters.budget}
            onChange={(e) => handleBudgetChange(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all outline-none"
            disabled={isLoading}
          >
            {BUDGET_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 text-purple-600" />
            Business Type
          </label>
          <select
            value={filters.location}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all outline-none"
            disabled={isLoading}
          >
            {LOCATION_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Skills Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 text-purple-600" />
            Your Skills/Experience
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSkillDropdown(!showSkillDropdown)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all outline-none text-left flex items-center justify-between"
              disabled={isLoading}
            >
              <span className="text-gray-700">
                {filters.skills.length === 0 
                  ? 'Select your skills...' 
                  : `${filters.skills.length} skill${filters.skills.length > 1 ? 's' : ''} selected`
                }
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showSkillDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showSkillDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {SKILL_OPTIONS.map((skill, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-purple-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.skills.includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{skill}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Selected Skills Display */}
          {filters.skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {filters.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter Summary */}
      {hasFilters && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-800 font-medium mb-1">Active Filters:</p>
          <div className="text-xs text-purple-700 space-y-1">
            {filters.budget && (
              <div>• Budget: {BUDGET_OPTIONS.find(b => b.value === filters.budget)?.label}</div>
            )}
            {filters.location && (
              <div>• Type: {LOCATION_OPTIONS.find(l => l.value === filters.location)?.label}</div>
            )}
            {filters.skills.length > 0 && (
              <div>• Skills: {filters.skills.join(', ')}</div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
          disabled={isLoading}
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:bg-gray-300"
          disabled={isLoading}
        >
          Next
        </button>
      </div>
    </div>
  );
};
