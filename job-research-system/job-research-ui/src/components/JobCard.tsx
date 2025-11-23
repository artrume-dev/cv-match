import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Building2, MapPin, ExternalLink, Sparkles, Info } from 'lucide-react';
import { ScoreBreakdownDialog } from './ScoreBreakdownDialog';
import type { Job } from '../types';

interface JobCardProps {
  job: Job;
  onOptimizeCV?: (job: Job) => void;
  isSelected?: boolean;
  onSelect?: (job: Job) => void;
}

export function JobCard({ job, onOptimizeCV, isSelected = false, onSelect }: JobCardProps) {
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  
  // Get job type from location/remote field
  const workType = job.remote ? 'Remote' : 'Hybrid';
  const location = job.location || 'London, UK';

  // Format match score - handle null/undefined
  const matchScore = job.alignment_score !== null && job.alignment_score !== undefined
    ? job.alignment_score
    : null;

  // Determine employment type (default to Full-time if not specified)
  const employmentType = 'Full-time'; // Could be extracted from job data if available

  // Determine match score color based on value
  const getMatchColorClasses = (score: number | null) => {
    if (score === null) return 'text-gray-400 bg-transparent border-transparent';
    if (score >= 70) return 'text-green-700 bg-green-50 border-green-300';
    if (score >= 50) return 'text-orange-700 bg-orange-50 border-orange-300';
    return 'text-red-700 bg-red-50 border-red-300';
  };

  const matchColorClasses = getMatchColorClasses(matchScore);

  const handleClick = () => {
    if (onSelect) {
      onSelect(job);
    }
  };

  const handleOptimizeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOptimizeCV) {
      onOptimizeCV(job);
    }
  };

  const handleViewJobClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(job.url, '_blank');
  };

  const handleScoreInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowScoreDialog(true);
  };

  return (
    <>
      <ScoreBreakdownDialog 
        job={job}
        open={showScoreDialog}
        onOpenChange={setShowScoreDialog}
      />
      <div
      className={`border-b-0 border-gray-200 last:border-b-0 py-4 transition-all duration-200 cursor-pointer group relative ${
        isSelected
          ? 'bg-blue-50 border-l-4 !border-l-black pl-3 pr-4'
          : 'hover:bg-gray-50 border-l-4 border-l-transparent px-4'
      }`}
      onClick={handleClick}
    >
      <div className="space-y-3">
        {/* Job Title and View Job Button Row */}
        <div className="flex items-start justify-between gap-3">
          <h3 className={`font-bold text-sm leading-tight flex-1 ${
            isSelected ? 'text-black font-semibold' : 'text-gray-900'
          }`}>
            {job.title}
          </h3>
          
        </div>

        {/* Company and Location Row */}
      <div className="pb-2">
        <div className="flex items-center gap-2 text-xs font-normal text-gray-700">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-gray-400" />
            <span>{job.company}</span>
          </div>
         
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{location}</span>
          </div>          
        </div>
</div>
        {/* Employment Type, Work Type, and Match Score Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-sm text-[10px] px-2.5 py-0.5 border-gray-300 text-gray-700 font-normal">
              {employmentType}
            </Badge>
            <Badge variant="outline" className="rounded-sm text-[10px] px-2.5 py-0.5 border-gray-300 text-gray-700 font-normal">
              {workType}
            </Badge>
            {matchScore !== null ? (
              <div className="flex items-center gap-1.5">
                <span className={`rounded-sm text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${matchColorClasses}`}>
                  {matchScore}% Match
                </span>
                <button
                  onClick={handleScoreInfoClick}
                  className="text-gray-600 text-[10px] hover:text-black transition-colors p-0.5 rounded hover:bg-gray-100"
                  title="View match score breakdown"
                  aria-label="View match score details"
                >
                  <Info className="h-4 w-4" />
                </button>

                         <Button
            size="sm"
            variant="ghost"
            className="gap-1 text-xs h-6 shrink-0 font-normal text-gray-500"
            onClick={handleViewJobClick}
          >
            <ExternalLink className="h-3 w-3" />
            View Job
          </Button>

              </div>
            ) : (
              <span className="text-xs text-gray-400 italic" title="Click 'Analyze All Jobs' to calculate match score">
                Not Analyzed
              </span>
            )}
          </div>
        </div>
    

        {/* Action Buttons - Reserved for future features */}
        {/* {onOptimizeCV && (
          <div className="flex items-center gap-2 mt-2">
            <Button
              size="sm"
              className="gap-1 text-xs h-7"
              onClick={handleOptimizeClick}
            >
              <Sparkles className="h-3 w-3" />
              Optimize CV
            </Button>
          </div>
        )} */}
      </div>
    </div>
    </>
  );
}
