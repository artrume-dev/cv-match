import { JobDatabase, Job } from '../db/schema.js';
import { scrapeAllCompanies, scrapeCompanies } from '../scrapers/index.js';

export interface SearchFilters {
  companies?: string[];
  status?: Job['status'];
  priority?: Job['priority'];
  minAlignment?: number;
}

/**
 * Search for new jobs from watched companies
 */
export async function searchNewJobs(
  db: JobDatabase,
  companies?: string[]
): Promise<Job[]> {
  // Scrape jobs based on company filter
  const scrapedJobs = companies && companies.length > 0
    ? await scrapeCompanies(companies)
    : await scrapeAllCompanies();

  const newJobs: Job[] = [];

  for (const job of scrapedJobs) {
    // Check if job already exists
    const existing = db.getJobById(job.job_id);
    
    if (!existing) {
      // Add new job to database
      const id = db.addJob({
        job_id: job.job_id,
        company: job.company,
        title: job.title,
        url: job.url,
        description: job.description,
        requirements: job.requirements,
        tech_stack: job.tech_stack,
        location: job.location,
        remote: job.remote,
        alignment_score: null,
        status: 'new',
        priority: 'medium',
        notes: null,
      });

      const added = db.getJobById(job.job_id);
      if (added) {
        newJobs.push(added);
      }
    }
  }

  return newJobs;
}

/**
 * Get jobs from database with filters
 */
export function getJobs(db: JobDatabase, filters?: SearchFilters): Job[] {
  return db.getJobs({
    status: filters?.status,
    priority: filters?.priority,
    minAlignment: filters?.minAlignment,
  });
}

/**
 * Get details for a specific job
 */
export function getJobDetails(db: JobDatabase, jobId: string): Job | null {
  return db.getJobById(jobId) || null;
}
