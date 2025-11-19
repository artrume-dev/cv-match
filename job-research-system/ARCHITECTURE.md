# System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER (You)                              │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ├─────────────────────┬───────────────────────────┐
                │                     │                           │
                ▼                     ▼                           ▼
    ┌───────────────────┐ ┌───────────────────┐    ┌──────────────────┐
    │  Claude Desktop   │ │  Claude Code      │    │   VS Code        │
    │                   │ │  (Terminal)       │    │   + Extension    │
    │  Web interface    │ │                   │    │                  │
    │  for chat         │ │  Command line     │    │  IDE integration │
    └─────────┬─────────┘ └─────────┬─────────┘    └────────┬─────────┘
              │                     │                        │
              │                     │                        │
              └─────────────────────┴────────────────────────┘
                                    │
                                    │ Uses MCP Protocol
                                    │
              ┌─────────────────────▼─────────────────────────────┐
              │           MCP Server (job-research-mcp)           │
              │                                                   │
              │  Tools Available:                                │
              │  • scan_new_jobs      → Scrape company sites     │
              │  • search_ai_jobs     → Query database           │
              │  • get_job_details    → Fetch full posting       │
              │  • analyze_job_fit    → Calculate alignment      │
              │  • update_job_status  → Track applications       │
              │  • get_new_jobs_since → Get recent additions     │
              └─────────┬─────────────────────────────────────────┘
                        │
                        ├────────────────┬────────────────────────┐
                        │                │                        │
                        ▼                ▼                        ▼
            ┌──────────────────┐  ┌────────────┐    ┌──────────────────┐
            │   Job Scrapers   │  │  Database  │    │  Sub-agents      │
            │                  │  │            │    │                  │
            │ • Greenhouse     │  │  SQLite    │    │ • cv-optimizer   │
            │ • Lever          │  │            │    │ • job-analyzer   │
            │ • Custom         │  │  Storage:  │    │                  │
            │                  │  │  - Jobs    │    │  Specialized AI  │
            │ Target:          │  │  - Status  │    │  assistants for  │
            │ • Anthropic      │  │  - Notes   │    │  deep analysis   │
            │ • OpenAI         │  │  - Scores  │    │                  │
            │ • Vercel         │  │            │    │                  │
            │ • Cursor         │  │            │    │                  │
            │ • Replit         │  │            │    │                  │
            │ • Perplexity     │  │            │    │                  │
            │ • Hugging Face   │  │            │    │                  │
            └──────────────────┘  └────────────┘    └──────────────────┘


DATA FLOW:
==========

1. DISCOVERY PHASE
   Scrapers → Fetch jobs from company sites
         ↓
   Parse job details (title, description, requirements)
         ↓
   Store in SQLite database
         ↓
   Calculate basic alignment score

2. ANALYSIS PHASE
   User asks Claude → "Analyze this job"
         ↓
   Claude calls get_job_details via MCP
         ↓
   Invokes job-analyzer sub-agent
         ↓
   Deep analysis (requirements, culture, competition)
         ↓
   Returns strategic guidance

3. OPTIMIZATION PHASE
   User asks Claude → "Optimize my CV"
         ↓
   Claude calls get_job_details via MCP
         ↓
   Invokes cv-optimizer sub-agent
         ↓
   Analyzes gap between job and CV
         ↓
   Generates 3 CV versions
         ↓
   User selects version
         ↓
   Save to /mnt/user-data/outputs/

4. TRACKING PHASE
   User applies to job
         ↓
   Claude calls update_job_status
         ↓
   Database updated (status: applied)
         ↓
   Notes and timeline tracked


COMMUNICATION:
=============

MCP Protocol:
    Claude Desktop/Code ←→ MCP Server
    (JSON-RPC over stdio)

Sub-agents:
    Claude Code reads .md files
    Specialized instructions for specific tasks
    Natural language interface


FILE SYSTEM:
===========

/job-research-system/
├── job-research-mcp/           ← MCP Server code
│   ├── src/                    ← TypeScript source
│   ├── dist/                   ← Compiled JavaScript
│   └── data/                   ← SQLite database
│
├── claude-code-agents/         ← Sub-agent definitions
│   ├── cv-optimizer.md
│   └── job-analyzer.md
│
└── ~/.claude-code/             ← Claude Code config
    └── sub-agents/             ← Installed sub-agents
        ├── cv-optimizer.md
        └── job-analyzer.md


SCALABILITY:
===========

Current: 7 target companies, local SQLite
         ↓
Easy additions:
- More companies (just add to TARGET_COMPANIES)
- More scrapers (extend BaseScraper)
- Better scoring (AI-powered analysis)
- Email notifications
- Slack integration
- Cover letter generation

Future enhancements:
- PostgreSQL for multi-user
- Web dashboard
- Mobile app
- Interview prep assistant
- Salary insights
- Network graph


SECURITY & PRIVACY:
==================

✓ All data stored locally
✓ No cloud sync required
✓ SQLite file on your machine
✓ CV never leaves your computer
✓ Respects robots.txt
✓ Rate limiting on scrapers
✓ No API keys stored in code


WHY THIS ARCHITECTURE?
=====================

MCP Server:
- Persistent (runs in background)
- Reusable (any MCP client can use it)
- Scalable (easy to add tools)
- Fast (local database)

Sub-agents:
- Specialized (focused on one task)
- Iterative (easy to improve prompts)
- Interactive (guides user through process)
- Portable (just markdown files)

Hybrid approach gives you:
- Automation (MCP handles persistence)
- Intelligence (Sub-agents provide analysis)
- Flexibility (Use with any MCP client)
- Control (You approve all actions)
```
