import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Building2, MapPin, Calendar, ExternalLink, Target } from 'lucide-react';
import type { Job } from '../types';
import { stripHtml } from '../lib/utils';

interface JobCardProps {
  job: Job;
  onAnalyze?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  onArchive?: (jobId: string) => void;
  onOptimizeCV?: (job: Job) => void;
}

const statusColors = {
  new: 'bg-blue-500',
  reviewed: 'bg-yellow-500',
  applied: 'bg-green-500',
  rejected: 'bg-red-500',
  interview: 'bg-purple-500',
  archived: 'bg-gray-500',
};

const priorityColors = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
};

export function JobCard({ job, onAnalyze, onApply, onArchive, onOptimizeCV }: JobCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {job.company}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className={`w-3 h-3 rounded-full ${statusColors[job.status]}`} title={job.status} />
            {job.priority && (
              <Badge variant={priorityColors[job.priority] as any}>
                {job.priority}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {job.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {job.location}
          </div>
        )}

        {job.alignment_score !== undefined && (
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Match Score</span>
                <span className="font-semibold">{job.alignment_score}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${job.alignment_score}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {job.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {stripHtml(job.description)}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          Found: {new Date(job.found_date).toLocaleDateString()}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(job.url, '_blank')}
          className="flex-1 min-w-[100px]"
        >
          <ExternalLink className="h-4 w-4" />
          View Job
        </Button>
        {onOptimizeCV && (
          <Button
            size="sm"
            variant="default"
            onClick={() => onOptimizeCV(job)}
            className="flex-1 min-w-[120px]"
          >
            Optimize CV
          </Button>
        )}
        {onAnalyze && job.status === 'new' && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onAnalyze(job.id)}
            className="flex-1"
          >
            Analyze
          </Button>
        )}
        {onApply && (job.status === 'new' || job.status === 'reviewed') && (
          <Button
            size="sm"
            onClick={() => onApply(job.id)}
            className="flex-1"
          >
            Mark Applied
          </Button>
        )}
        {onArchive && job.status !== 'archived' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onArchive(job.id)}
          >
            Archive
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
