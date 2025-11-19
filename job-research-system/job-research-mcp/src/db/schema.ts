import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface Job {
  id: number;
  job_id: string;
  company: string;
  title: string;
  url: string;
  description: string;
  requirements: string;
  tech_stack: string;
  location: string;
  remote: boolean;
  alignment_score: number | null;
  status: 'new' | 'reviewed' | 'applied' | 'rejected' | 'interview' | 'archived';
  priority: 'high' | 'medium' | 'low';
  notes: string | null;
  found_date: string;
  last_updated: string;
}

export interface CompanyWatch {
  id: number;
  company: string;
  careers_url: string;
  last_checked: string;
  active: boolean;
}

export class JobDatabase {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const path = dbPath || join(__dirname, '../../data/jobs.db');
    this.db = new Database(path);
    this.initialize();
  }

  private initialize() {
    // Create jobs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id TEXT UNIQUE NOT NULL,
        company TEXT NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        tech_stack TEXT,
        location TEXT,
        remote BOOLEAN DEFAULT 0,
        alignment_score REAL,
        status TEXT DEFAULT 'new',
        priority TEXT DEFAULT 'medium',
        notes TEXT,
        found_date TEXT DEFAULT CURRENT_TIMESTAMP,
        last_updated TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create company watch list table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS company_watch (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT UNIQUE NOT NULL,
        careers_url TEXT NOT NULL,
        last_checked TEXT,
        active BOOLEAN DEFAULT 1
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
      CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
      CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);
      CREATE INDEX IF NOT EXISTS idx_jobs_found_date ON jobs(found_date);
    `);

    // Seed initial company watch list
    this.seedCompanies();
  }

  private seedCompanies() {
    const companies = [
      { company: 'Anthropic', careers_url: 'https://www.anthropic.com/careers' },
      { company: 'OpenAI', careers_url: 'https://openai.com/careers' },
      { company: 'Vercel', careers_url: 'https://vercel.com/careers' },
      { company: 'Cursor', careers_url: 'https://www.cursor.com/careers' },
      { company: 'Perplexity', careers_url: 'https://www.perplexity.ai/hub/careers' },
      { company: 'Hugging Face', careers_url: 'https://huggingface.co/jobs' },
      { company: 'Replit', careers_url: 'https://replit.com/careers' },
      { company: 'GitHub', careers_url: 'https://github.com/careers' },
      { company: 'Microsoft', careers_url: 'https://careers.microsoft.com' },
      { company: 'Google DeepMind', careers_url: 'https://www.deepmind.com/careers' },
    ];

    const insert = this.db.prepare(`
      INSERT OR IGNORE INTO company_watch (company, careers_url)
      VALUES (?, ?)
    `);

    companies.forEach(({ company, careers_url }) => {
      insert.run(company, careers_url);
    });
  }

  // Job CRUD operations
  addJob(job: Omit<Job, 'id' | 'found_date' | 'last_updated'>): number {
    const stmt = this.db.prepare(`
      INSERT INTO jobs (
        job_id, company, title, url, description, requirements, 
        tech_stack, location, remote, alignment_score, status, priority, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      job.job_id,
      job.company,
      job.title,
      job.url,
      job.description,
      job.requirements,
      job.tech_stack,
      job.location,
      job.remote ? 1 : 0,
      job.alignment_score,
      job.status,
      job.priority,
      job.notes
    );

    return result.lastInsertRowid as number;
  }

  getJobs(filters?: {
    status?: string;
    company?: string;
    priority?: string;
    minAlignment?: number;
  }): Job[] {
    let query = 'SELECT * FROM jobs WHERE 1=1';
    const params: any[] = [];

    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters?.company) {
      query += ' AND company = ?';
      params.push(filters.company);
    }
    if (filters?.priority) {
      query += ' AND priority = ?';
      params.push(filters.priority);
    }
    if (filters?.minAlignment) {
      query += ' AND alignment_score >= ?';
      params.push(filters.minAlignment);
    }

    query += ' ORDER BY found_date DESC';

    return this.db.prepare(query).all(...params) as Job[];
  }

  getJobById(jobId: string): Job | undefined {
    return this.db
      .prepare('SELECT * FROM jobs WHERE job_id = ?')
      .get(jobId) as Job | undefined;
  }

  updateJobStatus(jobId: string, status: Job['status'], notes?: string): void {
    const stmt = this.db.prepare(`
      UPDATE jobs 
      SET status = ?, notes = COALESCE(?, notes), last_updated = CURRENT_TIMESTAMP
      WHERE job_id = ?
    `);
    stmt.run(status, notes, jobId);
  }

  updateAlignmentScore(jobId: string, score: number): void {
    this.db
      .prepare('UPDATE jobs SET alignment_score = ?, last_updated = CURRENT_TIMESTAMP WHERE job_id = ?')
      .run(score, jobId);
  }

  // Company watch list operations
  getWatchedCompanies(activeOnly: boolean = true): CompanyWatch[] {
    const query = activeOnly
      ? 'SELECT * FROM company_watch WHERE active = 1'
      : 'SELECT * FROM company_watch';
    return this.db.prepare(query).all() as CompanyWatch[];
  }

  updateLastChecked(company: string): void {
    this.db
      .prepare('UPDATE company_watch SET last_checked = CURRENT_TIMESTAMP WHERE company = ?')
      .run(company);
  }

  addCompanyWatch(company: string, careersUrl: string): void {
    this.db
      .prepare('INSERT OR REPLACE INTO company_watch (company, careers_url) VALUES (?, ?)')
      .run(company, careersUrl);
  }

  close() {
    this.db.close();
  }
}
