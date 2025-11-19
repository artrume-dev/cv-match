# Job Research System - Documentation Index

Welcome to your AI-powered job research system! 🎉

## 📚 Start Here

1. **[GET_STARTED.md](GET_STARTED.md)** - Quick overview and 3-step setup
2. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Commands cheat sheet
3. **[README.md](README.md)** - Complete technical documentation

## 📖 Detailed Guides

- **[CLAUDE_CODE_GUIDE.md](CLAUDE_CODE_GUIDE.md)** - How to use with Claude Code in VS Code
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and data flow diagrams

## 🔧 Installation

Run the setup script:
```bash
chmod +x setup.sh
./setup.sh
```

## 🎯 What You Built

### MCP Server (`job-research-mcp/`)
- **Purpose**: Background service that monitors AI companies for jobs
- **Tech**: TypeScript, MCP SDK, SQLite
- **Location**: `job-research-mcp/`
- **Start**: `npm install && npm run build && npm start`

**Key Files:**
- `src/index.ts` - MCP server entry point
- `src/db/schema.ts` - Database schema
- `src/scrapers/greenhouse.ts` - Job scraper
- `src/tools/index.ts` - MCP tools

### Sub-agents (`claude-code-agents/`)
- **Purpose**: Specialized AI assistants for Claude Code
- **Tech**: Markdown prompt files
- **Location**: `claude-code-agents/`
- **Install**: Copy to `~/.claude-code/sub-agents/`

**Files:**
- `cv-optimizer.md` - Generates tailored CVs
- `job-analyzer.md` - Deep job analysis

## 🚀 Quick Start Checklist

- [ ] Run `./setup.sh`
- [ ] Add config to Claude Desktop config file
- [ ] Restart Claude Desktop
- [ ] Test: "Scan for new AI jobs"
- [ ] Install Claude Code: `npm install -g @anthropic-ai/claude-code`
- [ ] Copy sub-agents to `~/.claude-code/sub-agents/`
- [ ] Test in VS Code: "Find design systems roles"

## 📋 Documentation by Use Case

### I want to get started quickly
→ [GET_STARTED.md](GET_STARTED.md)

### I need command reference
→ [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

### I want to understand how it works
→ [ARCHITECTURE.md](ARCHITECTURE.md)

### I want to use it with Claude Code
→ [CLAUDE_CODE_GUIDE.md](CLAUDE_CODE_GUIDE.md)

### I want technical details
→ [README.md](README.md)

### I want to customize/extend it
→ Use Claude Code with the source files!

## 🎨 What Can It Do?

### Automated Job Discovery
```
✓ Monitors 7+ AI companies daily
✓ Scrapes Greenhouse, Lever, custom sites
✓ Filters for relevant roles
✓ Stores in local database
```

### Intelligent Analysis
```
✓ Calculates CV-job alignment
✓ Identifies requirements (hard/soft/hidden)
✓ Assesses competition level
✓ Provides strategic guidance
```

### CV Optimization
```
✓ Generates 3 versions per job
✓ Never fabricates experience
✓ ATS-friendly keywords
✓ Side-by-side comparison
```

### Full Tracking
```
✓ Application status
✓ Interview scheduling
✓ Follow-up reminders
✓ Historical insights
```

## 🛠️ Tech Stack

**MCP Server:**
- TypeScript 5.4+
- MCP SDK 1.0
- SQLite (better-sqlite3)
- Cheerio (web scraping)
- Node.js 20+

**Sub-agents:**
- Markdown prompt files
- Claude Code compatible
- Natural language interface

## 📊 Target Companies (Current)

- Anthropic
- OpenAI
- Vercel
- Cursor
- Replit
- Perplexity
- Hugging Face

**Add more**: "Add [Company] to target list"

## 🔄 Typical Workflow

1. **Morning** (5 min)
   - "Check for new AI jobs"
   - Review matches
   
2. **Analysis** (15 min)
   - "Analyze top 3 matches"
   - Review requirements
   
3. **Application** (30 min)
   - "Optimize CV for [Role]"
   - Review versions
   - Apply
   
4. **Tracking** (2 min)
   - "Mark as applied"
   - Add notes

## 💡 Pro Tips

1. **Run scans daily** - New jobs appear constantly
2. **Use sub-agents liberally** - They're designed to help
3. **Track everything** - Data helps improve over time
4. **Let Claude Code customize** - It can add features you need
5. **Review weekly** - Stay on top of applications

## 🚨 Troubleshooting

### MCP not loading?
- Check config file (absolute paths)
- Restart Claude Desktop
- View logs: `~/.local/state/Claude/logs/`

### Scrapers failing?
- Ask Claude Code: "Debug Anthropic scraper"
- Companies change sites frequently
- Add delays for rate limiting

### Sub-agents not found?
- Verify: `ls ~/.claude-code/sub-agents/`
- Should show: cv-optimizer.md, job-analyzer.md

## 🎯 Next Steps

1. Read [GET_STARTED.md](GET_STARTED.md)
2. Run setup script
3. Configure Claude Desktop
4. Test with "Scan for new jobs"
5. Use Claude Code to customize
6. Start applying!

## 📧 Support

If you get stuck:
1. Read the relevant documentation above
2. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for commands
3. Ask Claude Code: "Help me fix X"

## 🎉 Ready to Go!

You now have a complete AI-powered job research system that will:
- Find relevant jobs automatically
- Analyze fit with your background
- Generate tailored CVs
- Track your applications
- Improve with feedback

**Let's land that dream AI role!** 🚀

---

**Version**: 1.0.0  
**Built with**: Claude 4 Sonnet  
**Date**: November 2025  
**License**: MIT
