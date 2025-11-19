# Web UI for Job Research System - Complete Guide

## What Was Built

I've created a complete browser-based UI for your Job Research System that works alongside the existing command-line interface. Both interfaces share the same database and MCP server!

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACES                         │
├──────────────────────┬──────────────────────────────────────┤
│   Command Line       │        Browser UI (NEW!)             │
│  (Claude Code/       │                                      │
│   Claude Desktop)    │   React + Tailwind + shadcn/ui       │
└──────────┬───────────┴────────────────┬─────────────────────┘
           │                            │
           │                            │
           ▼                            ▼
    ┌──────────────┐          ┌─────────────────┐
    │  MCP Server  │◄─────────┤  HTTP API       │
    │   (stdio)    │          │  (port 3001)    │
    └──────┬───────┘          └─────────────────┘
           │
           ▼
    ┌──────────────┐
    │   SQLite     │
    │  Database    │
    └──────────────┘
```

## Files Created

### 1. HTTP API Server
**Location:** `job-research-mcp/src/http-server.ts`
- Bridges browser UI to MCP server
- REST API on port 3001
- Handles all MCP tool calls
- CORS enabled for browser access

### 2. React UI Application
**Location:** `job-research-ui/`

#### Core Components:
- `src/App.tsx` - Main application with stats, filters, job grid
- `src/components/JobCard.tsx` - Individual job display card
- `src/components/PromptInput.tsx` - Natural language command input
- `src/components/ui/` - shadcn/ui components (Button, Card, Input, Badge)

#### API Layer:
- `src/api/mcp-client.ts` - HTTP client for MCP tools
- `src/types/index.ts` - TypeScript type definitions

#### Styling:
- `src/index.css` - Tailwind base styles + theme variables
- `tailwind.config.js` - Tailwind configuration
- shadcn/ui design system

### 3. Helper Scripts:
- `start-ui.sh` - One-command startup script
- `job-research-ui/README.md` - Full documentation

## Features

### 1. Dashboard View
- **Stats Cards**: Total jobs, applications, high priority, avg alignment
- **Filters**: Quick filter by status (all, new, reviewed, applied, interview)
- **Grid Layout**: Responsive 1-3 column grid of job cards

### 2. Job Cards
Each card shows:
- Job title and company
- Location
- Match score with progress bar
- Status indicator (color-coded dot)
- Priority badge
- Quick actions (View, Analyze, Apply, Archive)

### 3. Natural Language Commands
Type simple commands:
- "Find new jobs at Anthropic"
- "Show high-priority jobs"
- "What jobs need attention?"
- "Show applied jobs"

### 4. Interactive Actions
- Click "View Job" to open posting
- "Analyze" to calculate alignment
- "Mark Applied" to update status
- "Archive" to remove from list

## How to Start

### Option 1: Use the Start Script (Easiest)
```bash
cd job-research-system
./start-ui.sh
```

This starts both servers automatically!

### Option 2: Manual Start
```bash
# Terminal 1: Start HTTP API
cd job-research-system/job-research-mcp
npm run build
npm run start:http

# Terminal 2: Start UI
cd job-research-system/job-research-ui
npm run dev
```

Then open: **http://localhost:5173**

## Dual Interface Usage

### Command Line (Existing)
Best for:
- Deep job analysis with AI agents
- CV optimization
- Complex multi-step workflows
- Conversational exploration

### Browser UI (New)
Best for:
- Visual job management
- Quick status updates
- Filtering and sorting
- At-a-glance stats
- Fast job browsing

**Both work together!** Changes in one are reflected in the other since they share the same database.

## Example Workflow

1. **Browse jobs in UI**
   - Open http://localhost:5173
   - Type "Find new jobs at Anthropic"
   - See visual cards of all jobs

2. **Analyze in command line**
   - Switch to Claude Code
   - "Analyze the Product Operations Manager role"
   - Get deep AI-powered analysis

3. **Update status in UI**
   - Go back to browser
   - Click "Mark Applied" on the job
   - See stats update in real-time

4. **Optimize CV in command line**
   - Use CV optimizer agent
   - Generate tailored versions

5. **Track progress in UI**
   - Monitor application stats
   - Filter by status
   - See alignment scores

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS 3
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Backend**: Node.js HTTP server
- **Database**: Shared SQLite with MCP server

## Future Enhancements

Potential additions:
- Real-time WebSocket updates
- Inline AI agent chat
- CV upload and optimization UI
- Drag-and-drop status updates
- Export to CSV/PDF
- Dark mode toggle
- Mobile responsive improvements
- Interview scheduling
- Notes and reminders

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### API Not Connecting
1. Check HTTP server is running: `curl http://localhost:3001/health`
2. Check browser console for errors
3. Verify CORS headers in response

### No Jobs Showing
1. First, search for jobs: "Find new jobs"
2. Check database: `sqlite3 job-research-mcp/data/jobs.db "SELECT COUNT(*) FROM jobs;"`
3. Run scrapers if needed

## Integration with Existing System

This UI **complements** (not replaces) your existing setup:

- ✅ Command-line MCP still works
- ✅ Claude Code integration unchanged
- ✅ Sub-agents still accessible
- ✅ Database shared
- ✅ All tools available in both interfaces

The HTTP server is an **additional interface**, not a replacement!

## Performance

- **Fast:** Vite dev server with HMR
- **Lightweight:** Minimal dependencies
- **Responsive:** Works on all screen sizes
- **Efficient:** Direct SQLite queries via MCP

## Security Notes

- Local-only by default (localhost)
- No external API calls
- All data stays on your machine
- CORS enabled for local development
- For production, add authentication

---

## Quick Reference

**Start Everything:**
```bash
./start-ui.sh
```

**Access Points:**
- UI: http://localhost:5173
- API: http://localhost:3001
- Health: http://localhost:3001/health

**Stop Everything:**
Press `Ctrl+C` in the terminal running start-ui.sh

---

Enjoy your new visual interface! 🎉
