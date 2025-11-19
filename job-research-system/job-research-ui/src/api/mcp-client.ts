import type { Job, JobAnalysis, ApplicationStats, MCPResponse } from '../types';

const API_BASE = 'http://localhost:3001/api';

class MCPClient {
  async callTool(tool: string, args: Record<string, any> = {}): Promise<MCPResponse> {
    try {
      const response = await fetch(`${API_BASE}/tools/${tool}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Job search and retrieval
  async searchJobs(companies?: string[]): Promise<Job[]> {
    const result = await this.callTool('search_ai_jobs', { companies });
    return result.success ? result.data : [];
  }

  async getJobs(filters?: {
    status?: string;
    priority?: string;
    minAlignment?: number;
  }): Promise<Job[]> {
    const result = await this.callTool('get_jobs', filters);
    return result.success ? result.data : [];
  }

  async getJobDetails(jobId: string): Promise<Job | null> {
    const result = await this.callTool('get_job_details', { job_id: jobId });
    return result.success ? result.data : null;
  }

  // Job analysis
  async analyzeJob(jobId: string, cvPath?: string): Promise<JobAnalysis | null> {
    const result = await this.callTool('analyze_job_fit', { job_id: jobId, cv_path: cvPath });
    return result.success ? result.data : null;
  }

  async batchAnalyzeJobs(jobIds: string[], cvPath?: string): Promise<JobAnalysis[]> {
    const result = await this.callTool('batch_analyze_jobs', { job_ids: jobIds, cv_path: cvPath });
    return result.success ? result.data : [];
  }

  // Job status updates
  async markApplied(jobId: string, notes?: string): Promise<boolean> {
    const result = await this.callTool('mark_job_applied', { job_id: jobId, notes });
    return result.success;
  }

  async markReviewed(jobId: string, priority?: string, notes?: string): Promise<boolean> {
    const result = await this.callTool('mark_job_reviewed', { job_id: jobId, priority, notes });
    return result.success;
  }

  async archiveJob(jobId: string, reason?: string): Promise<boolean> {
    const result = await this.callTool('archive_job', { job_id: jobId, reason });
    return result.success;
  }

  // Statistics and insights
  async getStats(): Promise<ApplicationStats | null> {
    const result = await this.callTool('get_application_stats');
    return result.success ? result.data : null;
  }

  async getJobsNeedingAttention(): Promise<any> {
    const result = await this.callTool('get_jobs_needing_attention');
    return result.success ? result.data : null;
  }

  // AI Agent invocation
  async invokeAgent(agentType: 'cv-optimizer' | 'job-analyzer', prompt: string, context?: any): Promise<string> {
    const result = await this.callTool('invoke_agent', {
      agent_type: agentType,
      prompt,
      context,
    });
    return result.success ? result.data : 'Agent invocation failed';
  }
}

export const mcpClient = new MCPClient();
