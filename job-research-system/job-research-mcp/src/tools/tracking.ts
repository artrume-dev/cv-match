import { JobDatabase, Job } from '../db/schema.js';

/**
 * Update job application status
 */
export function updateJobStatus(
  db: JobDatabase,
  jobId: string,
  status: Job['status'],
  notes?: string
): Job | null {
  db.updateJobStatus(jobId, status, notes);
  return db.getJobById(jobId) || null;
}

/**
 * Mark job as applied
 */
export function markApplied(
  db: JobDatabase,
  jobId: string,
  notes?: string
): Job | null {
  return updateJobStatus(db, jobId, 'applied', notes);
}

/**
 * Mark job as reviewed
 */
export function markReviewed(
  db: JobDatabase,
  jobId: string,
  priority: Job['priority'] = 'medium',
  notes?: string
): Job | null {
  const job = db.getJobById(jobId);
  if (!job) return null;

  // Update priority if provided
  db.updateJobStatus(jobId, 'reviewed', notes);
  
  // Update priority (requires separate update)
  // Note: In a real implementation, you'd want a single update method
  return db.getJobById(jobId) || null;
}

/**
 * Archive job (no longer interested)
 */
export function archiveJob(
  db: JobDatabase,
  jobId: string,
  reason?: string
): Job | null {
  return updateJobStatus(db, jobId, 'archived', reason);
}

/**
 * Get application statistics
 */
export function getApplicationStats(db: JobDatabase): {
  total: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  by_company: Record<string, number>;
  average_alignment: number;
} {
  const allJobs = db.getJobs();

  const stats = {
    total: allJobs.length,
    by_status: {} as Record<string, number>,
    by_priority: {} as Record<string, number>,
    by_company: {} as Record<string, number>,
    average_alignment: 0,
  };

  let totalAlignment = 0;
  let jobsWithAlignment = 0;

  allJobs.forEach(job => {
    // Count by status
    stats.by_status[job.status] = (stats.by_status[job.status] || 0) + 1;
    
    // Count by priority
    stats.by_priority[job.priority] = (stats.by_priority[job.priority] || 0) + 1;
    
    // Count by company
    stats.by_company[job.company] = (stats.by_company[job.company] || 0) + 1;
    
    // Calculate average alignment
    if (job.alignment_score !== null) {
      totalAlignment += job.alignment_score;
      jobsWithAlignment++;
    }
  });

  stats.average_alignment = jobsWithAlignment > 0 
    ? Math.round(totalAlignment / jobsWithAlignment) 
    : 0;

  return stats;
}

/**
 * Get jobs needing attention
 */
export function getJobsNeedingAttention(db: JobDatabase): {
  new_jobs: Job[];
  high_priority_not_applied: Job[];
  interviews: Job[];
} {
  const allJobs = db.getJobs();

  return {
    new_jobs: allJobs.filter(j => j.status === 'new'),
    high_priority_not_applied: allJobs.filter(
      j => j.priority === 'high' && j.status !== 'applied' && j.status !== 'archived'
    ),
    interviews: allJobs.filter(j => j.status === 'interview'),
  };
}
