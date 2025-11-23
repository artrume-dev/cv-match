import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface FilterOption {
  label: string;
  value: string;
  checked: boolean;
}

interface ActiveFilter {
  label: string;
  type: string;
}

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeFilters: ActiveFilter[];
  onRemoveFilter: (filterType: string) => void;
  onClearAll: () => void;
  onApplyFilters: (filters: {
    locations: string[];
    jobTypes: string[];
  }) => void;
}

export function FilterModal({
  open,
  onOpenChange,
  activeFilters,
  onRemoveFilter,
  onClearAll,
  onApplyFilters,
}: FilterModalProps) {
  // Initialize filter states from user profile
  const [locations, setLocations] = useState<FilterOption[]>([
    { label: 'London, UK', value: 'London', checked: false },
    { label: 'Remote', value: 'Remote', checked: false },
    { label: 'New York, US', value: 'New York', checked: false },
    { label: 'San Francisco, US', value: 'San Francisco', checked: false },
  ]);

  const [jobTypes, setJobTypes] = useState<FilterOption[]>([
    { label: 'Full-time', value: 'Full-time', checked: false },
    { label: 'Part-time', value: 'Part-time', checked: false },
    { label: 'Contract', value: 'Contract', checked: false },
    { label: 'Hybrid', value: 'Hybrid', checked: false },
  ]);

  // Load saved preferences when modal opens
  useEffect(() => {
    if (!open) return;

    // Get user profile from localStorage only when modal opens
    const userProfile = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('user-storage') || '{}')?.state?.profile
      : null;

    if (!userProfile) return;

    // Load locations
    try {
      const savedLocations = JSON.parse(userProfile.preferred_locations || '[]');
      setLocations(prev => prev.map(loc => ({
        ...loc,
        checked: savedLocations.includes(loc.value)
      })));
    } catch (e) {
      console.error('Error loading locations:', e);
    }

    // Load job types
    try {
      const savedTypes = JSON.parse(userProfile.preferred_job_types || '[]');
      setJobTypes(prev => prev.map(type => ({
        ...type,
        checked: savedTypes.includes(type.value)
      })));
    } catch (e) {
      console.error('Error loading job types:', e);
    }
  }, [open]);

  const handleToggleLocation = (value: string) => {
    setLocations(prev =>
      prev.map(loc =>
        loc.value === value ? { ...loc, checked: !loc.checked } : loc
      )
    );
  };

  const handleToggleJobType = (value: string) => {
    setJobTypes(prev =>
      prev.map(type =>
        type.value === value ? { ...type, checked: !type.checked } : type
      )
    );
  };

  const handleApply = () => {
    const selectedLocations = locations.filter(l => l.checked).map(l => l.value);
    const selectedJobTypes = jobTypes.filter(t => t.checked).map(t => t.value);

    onApplyFilters({
      locations: selectedLocations,
      jobTypes: selectedJobTypes,
    });

    onOpenChange(false);
  };

  const handleClearAll = () => {
    setLocations(prev => prev.map(loc => ({ ...loc, checked: false })));
    setJobTypes(prev => prev.map(type => ({ ...type, checked: false })));
    onClearAll();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Active Filters Section */}
          {activeFilters.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Active Filters</h3>
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.slice(0, 2).map((filter, idx) => (
                  <Badge
                    key={`${filter.type}-${idx}`}
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 text-xs flex items-center gap-2 cursor-pointer hover:bg-blue-100"
                    onClick={() => onRemoveFilter(filter.type)}
                  >
                    <span>{filter.label}</span>
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
                {activeFilters.length > 2 && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 text-xs"
                  >
                    +{activeFilters.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Location Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Location</h3>
            <div className="space-y-2">
              {locations.map((location) => (
                <label
                  key={location.value}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md"
                >
                  <input
                    type="checkbox"
                    checked={location.checked}
                    onChange={() => handleToggleLocation(location.value)}
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">{location.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Job Type Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Job Type</h3>
            <div className="space-y-2">
              {jobTypes.map((jobType) => (
                <label
                  key={jobType.value}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md"
                >
                  <input
                    type="checkbox"
                    checked={jobType.checked}
                    onChange={() => handleToggleJobType(jobType.value)}
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">{jobType.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="bg-black text-white hover:bg-gray-800"
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
