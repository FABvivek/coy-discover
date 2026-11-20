'use client';

import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Gender, LookingFor, FeedFilterOptions } from '@/lib/types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  userGender: Gender;
  userLookingFor: LookingFor;
  onUpdateUserGender: (gender: Gender, lookingFor: LookingFor) => void;
  filters: FeedFilterOptions;
  onUpdateFilters: (filters: FeedFilterOptions) => void;
}

const CITIES = [
  'All Cities',
  'Bangalore',
  'Mumbai',
  'Delhi',
  'Kolkata',
  'Chennai',
  'Pondicherry',
  'Goa',
  'Ahmedabad',
];

export function FilterModal({
  isOpen,
  onClose,
  userGender,
  userLookingFor,
  onUpdateUserGender,
  filters,
  onUpdateFilters,
}: FilterModalProps) {
  if (!isOpen) return null;

  const handleGenderSelect = (gender: Gender) => {
    const autoLookingFor: LookingFor = gender === 'male' ? 'female' : 'male';
    onUpdateUserGender(gender, autoLookingFor);
    onUpdateFilters({ ...filters, gender: autoLookingFor });
  };

  const handleLookingForSelect = (lookingFor: LookingFor) => {
    onUpdateUserGender(userGender, lookingFor);
    onUpdateFilters({ ...filters, gender: lookingFor === 'everyone' ? 'all' : lookingFor });
  };

  const handleCitySelect = (city: string) => {
    onUpdateFilters({
      ...filters,
      city: city === 'All Cities' ? undefined : city,
    });
  };

  const handleClear = () => {
    onUpdateFilters({});
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-[32px] sm:rounded-[32px] bg-bg-card border border-line p-6 max-h-[85vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-accent" />
            <span className="font-serif text-xl font-medium text-ink-primary">
              Discovery Preferences
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preferences"
            className="p-2 rounded-full hover:bg-bg-secondary text-ink-secondary hover:text-ink-primary min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Gender Identity & Orientation */}
        <div className="py-5 border-b border-line">
          <label className="block text-xs font-medium uppercase tracking-wider text-ink-muted mb-2.5">
            I am
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleGenderSelect('male')}
              className={`py-2.5 px-3 rounded-full text-xs font-medium border transition-all ${
                userGender === 'male'
                  ? 'bg-ink-primary text-bg-primary border-ink-primary shadow-sm'
                  : 'bg-bg-secondary text-ink-primary border-line hover:border-ink-secondary/40'
              }`}
            >
              Man
            </button>
            <button
              type="button"
              onClick={() => handleGenderSelect('female')}
              className={`py-2.5 px-3 rounded-full text-xs font-medium border transition-all ${
                userGender === 'female'
                  ? 'bg-ink-primary text-bg-primary border-ink-primary shadow-sm'
                  : 'bg-bg-secondary text-ink-primary border-line hover:border-ink-secondary/40'
              }`}
            >
              Woman
            </button>
          </div>

          <label className="block text-xs font-medium uppercase tracking-wider text-ink-muted mt-5 mb-2.5">
            Show me
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleLookingForSelect('female')}
              className={`py-2.5 px-3 rounded-full text-xs font-medium border transition-all ${
                userLookingFor === 'female'
                  ? 'bg-accent text-white border-accent shadow-sm'
                  : 'bg-bg-secondary text-ink-primary border-line hover:border-ink-secondary/40'
              }`}
            >
              Women
            </button>
            <button
              type="button"
              onClick={() => handleLookingForSelect('male')}
              className={`py-2.5 px-3 rounded-full text-xs font-medium border transition-all ${
                userLookingFor === 'male'
                  ? 'bg-accent text-white border-accent shadow-sm'
                  : 'bg-bg-secondary text-ink-primary border-line hover:border-ink-secondary/40'
              }`}
            >
              Men
            </button>
            <button
              type="button"
              onClick={() => handleLookingForSelect('everyone')}
              className={`py-2.5 px-3 rounded-full text-xs font-medium border transition-all ${
                userLookingFor === 'everyone'
                  ? 'bg-accent text-white border-accent shadow-sm'
                  : 'bg-bg-secondary text-ink-primary border-line hover:border-ink-secondary/40'
              }`}
            >
              Everyone
            </button>
          </div>
          <p className="text-[11px] text-ink-muted mt-2">
            Coy automatically tailors your feed based on your gender identity and who you are interested in meeting.
          </p>
        </div>

        {/* Section 2: Location Filter */}
        <div className="py-5 border-b border-line">
          <label className="block text-xs font-medium uppercase tracking-wider text-ink-muted mb-2.5">
            Location
          </label>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => {
              const isSelected = (!filters.city && c === 'All Cities') || filters.city === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCitySelect(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-ink-primary text-bg-primary border-ink-primary'
                      : 'bg-bg-secondary text-ink-secondary border-line hover:text-ink-primary'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 py-3 px-4 rounded-full bg-bg-secondary text-ink-primary text-xs font-medium hover:bg-bg-hover active:scale-95 transition-all"
          >
            Clear filters
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-full bg-ink-primary text-bg-primary text-xs font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
