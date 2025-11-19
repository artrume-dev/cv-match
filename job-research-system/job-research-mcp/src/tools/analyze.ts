import { JobDatabase, Job } from '../db/schema.js';
import { readFileSync } from 'fs';

export interface AlignmentResult {
  job_id: string;
  company: string;
  title: string;
  alignment_score: number;
  strong_matches: string[];
  gaps: string[];
  recommendation: 'high' | 'medium' | 'low';
  reasoning: string;
}

/**
 * Analyze job fit against CV
 * This is a simplified heuristic - in Claude Code, you can use Claude to do deeper analysis
 */
export function analyzeJobFit(
  db: JobDatabase,
  jobId: string,
  cvPath?: string
): AlignmentResult {
  const job = db.getJobById(jobId);
  
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  // Load CV if provided (optional)
  let cvContent = '';
  if (cvPath) {
    try {
      cvContent = readFileSync(cvPath, 'utf-8');
    } catch (error) {
      console.warn(`Could not read CV from ${cvPath}`);
    }
  }

  // Calculate alignment based on keywords and requirements
  const result = calculateAlignment(job, cvContent);
  
  // Update alignment score in database
  db.updateAlignmentScore(jobId, result.alignment_score);

  return result;
}

function calculateAlignment(job: Job, cvContent: string): AlignmentResult {
  const strongMatches: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  const jobText = `${job.title} ${job.description} ${job.requirements}`.toLowerCase();
  const cv = cvContent.toLowerCase();

  // Check for strong experience matches
  const experienceKeywords = {
    'design system': 20,
    'enterprise scale': 15,
    'cross-functional': 10,
    'governance': 10,
    'accessibility': 10,
    'wcag': 10,
    'figma': 8,
    'react': 8,
    'typescript': 8,
    'storybook': 8,
    'design tokens': 12,
    'ai': 15,
    'llm': 12,
    'claude': 10,
    'developer experience': 15,
    'platform': 10,
    'technical leadership': 15,
  };

  for (const [keyword, points] of Object.entries(experienceKeywords)) {
    if (jobText.includes(keyword)) {
      if (cv.includes(keyword) || cv.includes(keyword.replace(/\s/g, ''))) {
        score += points;
        strongMatches.push(keyword);
      } else {
        gaps.push(keyword);
      }
    }
  }

  // Check for tech stack alignment
  const techStack = job.tech_stack?.toLowerCase() || '';
  const cvTechKeywords = [
    'react', 'typescript', 'javascript', 'figma', 'css', 'html',
    'storybook', 'git', 'node', 'python'
  ];

  cvTechKeywords.forEach(tech => {
    if (techStack.includes(tech) && cv.includes(tech)) {
      score += 5;
    }
  });

  // Normalize score to percentage
  const maxPossibleScore = Object.values(experienceKeywords).reduce((a, b) => a + b, 0);
  const alignmentScore = Math.min(Math.round((score / maxPossibleScore) * 100), 100);

  // Determine recommendation
  let recommendation: 'high' | 'medium' | 'low';
  let reasoning: string;

  if (alignmentScore >= 70) {
    recommendation = 'high';
    reasoning = `Strong alignment (${alignmentScore}%). Your experience closely matches requirements.`;
  } else if (alignmentScore >= 50) {
    recommendation = 'medium';
    reasoning = `Good alignment (${alignmentScore}%) with some gaps. Consider emphasizing transferable skills.`;
  } else {
    recommendation = 'low';
    reasoning = `Limited alignment (${alignmentScore}%). Significant gaps in key requirements.`;
  }

  return {
    job_id: job.job_id,
    company: job.company,
    title: job.title,
    alignment_score: alignmentScore,
    strong_matches: strongMatches.slice(0, 10),
    gaps: gaps.slice(0, 5),
    recommendation,
    reasoning,
  };
}

/**
 * Batch analyze multiple jobs
 */
export function batchAnalyzeJobs(
  db: JobDatabase,
  jobIds: string[],
  cvPath?: string
): AlignmentResult[] {
  return jobIds
    .map(id => {
      try {
        return analyzeJobFit(db, id, cvPath);
      } catch (error) {
        console.error(`Error analyzing job ${id}:`, error);
        return null;
      }
    })
    .filter((result): result is AlignmentResult => result !== null);
}
