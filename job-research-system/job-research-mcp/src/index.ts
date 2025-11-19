#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { JobDatabase } from './db/schema.js';
import {
  searchNewJobs,
  getJobs,
  getJobDetails,
  analyzeJobFit,
  batchAnalyzeJobs,
  updateJobStatus,
  markApplied,
  markReviewed,
  archiveJob,
  getApplicationStats,
  getJobsNeedingAttention,
} from './tools/index.js';

// Initialize database
const db = new JobDatabase();

// Create MCP server
const server = new Server(
  {
    name: 'job-research-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_ai_jobs',
        description: 'Search for new AI/design system jobs from watched companies. Returns newly found jobs.',
        inputSchema: {
          type: 'object',
          properties: {
            companies: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional: Filter by specific companies (e.g., ["Anthropic", "Vercel"])',
            },
          },
        },
      },
      {
        name: 'get_jobs',
        description: 'Get jobs from database with optional filters',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['new', 'reviewed', 'applied', 'rejected', 'interview', 'archived'],
              description: 'Filter by application status',
            },
            priority: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'Filter by priority level',
            },
            minAlignment: {
              type: 'number',
              description: 'Minimum alignment score (0-100)',
            },
          },
        },
      },
      {
        name: 'get_job_details',
        description: 'Get full details for a specific job',
        inputSchema: {
          type: 'object',
          properties: {
            job_id: {
              type: 'string',
              description: 'Job ID to retrieve',
            },
          },
          required: ['job_id'],
        },
      },
      {
        name: 'analyze_job_fit',
        description: 'Analyze how well a job matches your CV. Returns alignment score, strong matches, and gaps.',
        inputSchema: {
          type: 'object',
          properties: {
            job_id: {
              type: 'string',
              description: 'Job ID to analyze',
            },
            cv_path: {
              type: 'string',
              description: 'Optional: Path to CV file for detailed analysis',
            },
          },
          required: ['job_id'],
        },
      },
      {
        name: 'batch_analyze_jobs',
        description: 'Analyze multiple jobs at once',
        inputSchema: {
          type: 'object',
          properties: {
            job_ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of job IDs to analyze',
            },
            cv_path: {
              type: 'string',
              description: 'Optional: Path to CV file',
            },
          },
          required: ['job_ids'],
        },
      },
      {
        name: 'mark_job_applied',
        description: 'Mark a job as applied with optional notes',
        inputSchema: {
          type: 'object',
          properties: {
            job_id: {
              type: 'string',
              description: 'Job ID',
            },
            notes: {
              type: 'string',
              description: 'Optional notes about the application',
            },
          },
          required: ['job_id'],
        },
      },
      {
        name: 'mark_job_reviewed',
        description: 'Mark a job as reviewed',
        inputSchema: {
          type: 'object',
          properties: {
            job_id: {
              type: 'string',
              description: 'Job ID',
            },
            priority: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'Set priority level',
            },
            notes: {
              type: 'string',
              description: 'Optional review notes',
            },
          },
          required: ['job_id'],
        },
      },
      {
        name: 'archive_job',
        description: 'Archive a job (no longer interested)',
        inputSchema: {
          type: 'object',
          properties: {
            job_id: {
              type: 'string',
              description: 'Job ID',
            },
            reason: {
              type: 'string',
              description: 'Optional reason for archiving',
            },
          },
          required: ['job_id'],
        },
      },
      {
        name: 'get_application_stats',
        description: 'Get statistics about job applications (total, by status, by company, etc)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_jobs_needing_attention',
        description: 'Get jobs that need attention: new jobs, high-priority not applied, and upcoming interviews',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_ai_jobs': {
        const companies = args?.companies as string[] | undefined;
        const jobs = await searchNewJobs(db, companies);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(jobs, null, 2),
            },
          ],
        };
      }

      case 'get_jobs': {
        const filters = args as any;
        const jobs = getJobs(db, filters);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(jobs, null, 2),
            },
          ],
        };
      }

      case 'get_job_details': {
        const jobId = args?.job_id as string;
        const job = getJobDetails(db, jobId);
        return {
          content: [
            {
              type: 'text',
              text: job ? JSON.stringify(job, null, 2) : 'Job not found',
            },
          ],
        };
      }

      case 'analyze_job_fit': {
        const jobId = args?.job_id as string;
        const cvPath = args?.cv_path as string | undefined;
        const analysis = analyzeJobFit(db, jobId, cvPath);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(analysis, null, 2),
            },
          ],
        };
      }

      case 'batch_analyze_jobs': {
        const jobIds = args?.job_ids as string[];
        const cvPath = args?.cv_path as string | undefined;
        const analyses = batchAnalyzeJobs(db, jobIds, cvPath);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(analyses, null, 2),
            },
          ],
        };
      }

      case 'mark_job_applied': {
        const jobId = args?.job_id as string;
        const notes = args?.notes as string | undefined;
        const job = markApplied(db, jobId, notes);
        return {
          content: [
            {
              type: 'text',
              text: job ? `Marked ${job.title} as applied` : 'Job not found',
            },
          ],
        };
      }

      case 'mark_job_reviewed': {
        const jobId = args?.job_id as string;
        const priority = args?.priority as any;
        const notes = args?.notes as string | undefined;
        const job = markReviewed(db, jobId, priority, notes);
        return {
          content: [
            {
              type: 'text',
              text: job ? `Marked ${job.title} as reviewed` : 'Job not found',
            },
          ],
        };
      }

      case 'archive_job': {
        const jobId = args?.job_id as string;
        const reason = args?.reason as string | undefined;
        const job = archiveJob(db, jobId, reason);
        return {
          content: [
            {
              type: 'text',
              text: job ? `Archived ${job.title}` : 'Job not found',
            },
          ],
        };
      }

      case 'get_application_stats': {
        const stats = getApplicationStats(db);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(stats, null, 2),
            },
          ],
        };
      }

      case 'get_jobs_needing_attention': {
        const attention = getJobsNeedingAttention(db);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(attention, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Job Research MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
