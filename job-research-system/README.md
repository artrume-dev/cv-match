# AI Job Research System

A complete job search automation system combining an MCP server for job monitoring with Claude Code sub-agents for CV optimization and job analysis.

## System Architecture

```
┌─────────────────────────────────────────────────┐
│  Job Research MCP Server (Background Service)  │
│  - Monitors AI company career pages daily       │
│  - Stores jobs in SQLite database               │
│  - Exposes tools Claude Code can use            │
└─────────────────┬───────────────────────────────┘
                  │
                  │ Claude Code calls MCP tools
                  ↓
┌─────────────────────────────────────────────────┐
│           Claude Code + Sub-agents              │
│                                                 │
│  Job Analyzer: Analyzes fit, provides strategy │
│  CV Optimizer: Generates tailored CV versions  │
└─────────────────────────────────────────────────┘
```

## What This System Does

### Job Research MCP Server
- **Monitors** career pages of AI companies (Anthropic, Vercel, OpenAI, etc.)
- **Filters** for relevant roles (design systems, developer experience, technical leadership)
- **Stores** job data in local SQLite database
- **Calculates** alignment scores against your CV
- **Tracks** application status and provides analytics

### Claude Code Sub-agents

**Job Analyzer:**
- Deep analysis of job requirements
- Strategic application advice
- Priority recommendations
- Red flag detection

**CV Optimizer:**
- Generates 3 CV versions (Conservative/Optimized/Stretch)
- Maintains factual accuracy
- Provides cover letter talking points
- Shows before/after comparisons

## Quick Start

### Prerequisites
- Node.js 18+
- npm
- Claude Code (CLI or VS Code extension)

### Installation

1. **Install MCP Server**
```bash
cd job-research-mcp
npm install
npm run build
```

2. **Configure Claude Code to Use MCP Server**

Add to your Claude Code config (`~/.config/claude-code/mcp.json` or `%APPDATA%/claude-code/mcp.json` on Windows):

```json
{
  "mcpServers": {
    "job-research": {
      "command": "node",
      "args": ["/absolute/path/to/job-research-mcp/dist/index.js"]
    }
  }
}
```

3. **Install Sub-agents**

Copy the sub-agent files to your Claude Code agents directory:

```bash
# Linux/Mac
mkdir -p ~/.config/claude-code/agents
cp claude-code-agents/*.md ~/.config/claude-code/agents/

# Windows
mkdir %APPDATA%\claude-code\agents
copy claude-code-agents\*.md %APPDATA%\claude-code\agents\
```

## Usage

### Daily Job Search Workflow

Open Claude Code (terminal or VS Code) and try:

```
> Check for new AI jobs matching my profile

Claude uses MCP → Finds new roles:
1. Anthropic - Design Systems Engineer (85% match) ⭐
2. Vercel - Developer Experience Lead (78% match) ⭐

> Analyze the Anthropic role in detail

Claude invokes Job Analyzer sub-agent:
- Detailed breakdown of requirements
- Alignment analysis
- Strategic application advice

> Optimize my CV for this role

Claude invokes CV Optimizer sub-agent:
- Generates 3 versions
- Shows before/after
- Provides cover letter brief

> Use the optimized version

Claude saves to: /outputs/cv-anthropic-2025-11-19.pdf

> Mark Anthropic role as applied

Claude uses MCP → Updates tracking database
```

### Specific Commands

**Search & Monitor:**
```
"Search for new jobs at Anthropic and Vercel"
"Show me all high-priority jobs I haven't applied to"
"What jobs need my attention this week?"
```

**Analysis:**
```
"Analyze job [job_id] from the database"
"Compare these 3 jobs and recommend which to prioritize"
"Show me application statistics"
```

**CV Optimization:**
```
"Optimize my CV for [job_url]"
"Create 3 versions of my CV for the Microsoft role"
"Generate cover letter talking points for this job"
```

**Tracking:**
```
"Mark [job_id] as applied"
"Show my application pipeline"
"Archive jobs from companies I'm not interested in"
```

## MCP Server Tools

The MCP server exposes these tools to Claude Code:

| Tool | Description |
|------|-------------|
| `search_ai_jobs` | Search for new jobs from watched companies |
| `get_jobs` | Get jobs with filters (status, priority, alignment) |
| `get_job_details` | Get full job description |
| `analyze_job_fit` | Calculate alignment score vs CV |
| `batch_analyze_jobs` | Analyze multiple jobs at once |
| `mark_job_applied` | Track application status |
| `mark_job_reviewed` | Mark as reviewed with priority |
| `archive_job` | Archive uninteresting jobs |
| `get_application_stats` | View statistics |
| `get_jobs_needing_attention` | Get action items |

## Database Schema

Jobs are stored in SQLite (`data/jobs.db`) with this schema:

```sql
jobs:
  - id, job_id, company, title, url
  - description, requirements, tech_stack
  - location, remote
  - alignment_score, status, priority
  - notes, found_date, last_updated

company_watch:
  - id, company, careers_url
  - last_checked, active
```

## Customization

### Add More Companies

Edit `src/scrapers/greenhouse.ts` or `src/scrapers/lever.ts` to add companies:

```typescript
export const greenhouseCompanies = {
  // ... existing companies
  mycompany: new GreenhouseScraper(
    'My Company',
    'https://mycompany.com/careers',
    'mycompany-greenhouse-id'
  ),
};
```

### Modify Relevance Filters

Edit `isRelevantRole()` in scraper files to change which jobs are captured:

```typescript
private isRelevantRole(title: string): boolean {
  const relevantKeywords = [
    'design system',
    'your custom keywords here',
  ];
  // ...
}
```

### Customize CV Optimizer

Edit `claude-code-agents/cv-optimizer.md` to adjust:
- Optimization strategies
- Output format
- Emphasis areas

### Adjust Alignment Scoring

Edit `src/tools/analyze.ts` to modify how alignment scores are calculated:

```typescript
const experienceKeywords = {
  'your skill': 20,  // points
  'another skill': 15,
};
```

## Advanced Usage

### Scheduled Job Monitoring

Set up a cron job to run searches automatically:

```bash
# Run daily at 9am
0 9 * * * node /path/to/job-research-mcp/dist/index.js search
```

### Bulk Analysis

Analyze all new jobs at once:

```
> Get all new jobs and analyze them

Claude:
1. Calls get_jobs(status='new')
2. Calls batch_analyze_jobs([job_ids])
3. Sorts by alignment score
4. Presents prioritized list
```

### Export to Spreadsheet

```
> Export all jobs to a spreadsheet for tracking

Claude:
1. Gets all jobs from database
2. Creates Excel file with stats
3. Saves to /outputs/jobs-tracker.xlsx
```

## Troubleshooting

### MCP Server Not Found
- Check config path is absolute
- Verify `npm run build` completed successfully
- Test server manually: `node dist/index.js`

### No Jobs Found
- Companies may have changed their ATS
- Check Greenhouse/Lever IDs are correct
- Verify network access (some corporate networks block job board APIs)

### Low Alignment Scores
- Update keywords in `src/tools/analyze.ts`
- Provide CV path for better analysis: `analyze_job_fit(job_id, '/path/to/cv.md')`

### Sub-agents Not Working
- Verify files are in correct agents directory
- Check file permissions (should be readable)
- Restart Claude Code after adding new agents

## File Structure

```
job-research-system/
├── job-research-mcp/           # MCP Server
│   ├── src/
│   │   ├── index.ts           # Main server
│   │   ├── db/
│   │   │   └── schema.ts      # Database schema
│   │   ├── scrapers/
│   │   │   ├── base.ts        # Base scraper class
│   │   │   ├── greenhouse.ts  # Greenhouse ATS
│   │   │   ├── lever.ts       # Lever ATS
│   │   │   └── index.ts       # Scraper registry
│   │   └── tools/
│   │       ├── search.ts      # Job search tools
│   │       ├── analyze.ts     # Analysis tools
│   │       ├── tracking.ts    # Tracking tools
│   │       └── index.ts       # Tools export
│   ├── package.json
│   └── tsconfig.json
├── claude-code-agents/         # Sub-agents
│   ├── cv-optimizer.md        # CV optimization specialist
│   └── job-analyzer.md        # Job analysis specialist
└── README.md                   # This file
```

## Privacy & Data

- All data stored locally in SQLite database
- No external services except job board APIs
- Your CV never leaves your machine unless you explicitly share it
- Job URLs and descriptions are cached locally

## Next Steps

1. **Test the System**
   - Run a manual job search
   - Analyze a known job posting
   - Generate a test CV version

2. **Customize for Your Needs**
   - Add companies you're interested in
   - Adjust relevance filters
   - Tweak alignment scoring

3. **Set Up Automation**
   - Configure daily job searches
   - Set up notifications for high-match jobs
   - Create weekly summary reports

4. **Iterate and Improve**
   - Track which optimizations work
   - Refine sub-agent prompts
   - Add new companies as you discover them

## Support

This is a custom system built specifically for your job search. Use Claude Code to modify, extend, and improve it as your needs evolve.

Key principle: **The system works for you, not the other way around.** Customize freely!
