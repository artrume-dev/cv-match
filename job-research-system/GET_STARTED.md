# 🎉 Your Job Research System is Ready!

I've built a complete AI-powered job research and CV optimization system for you. Here's what you got:

## 📦 What's Inside

### 1. **MCP Server** (job-research-mcp/)
A Model Context Protocol server that:
- ✅ Scrapes AI company job boards (Anthropic, OpenAI, Vercel, Cursor, etc.)
- ✅ Stores jobs in local SQLite database
- ✅ Exposes 6 tools Claude can use
- ✅ Tracks application status
- ✅ Calculates job-CV alignment scores

### 2. **Claude Code Sub-agents** (claude-code-agents/)
Two specialized AI assistants:
- **cv-optimizer.md**: Generates 3 tailored CV versions per job
- **job-analyzer.md**: Deep job analysis with strategic guidance

### 3. **Complete Documentation**
- README.md: Full system documentation
- CLAUDE_CODE_GUIDE.md: How to use with Claude Code
- setup.sh: One-command installation script

## 🚀 Quick Start (3 Steps)

### Step 1: Run Setup Script

```bash
cd job-research-system
chmod +x setup.sh
./setup.sh
```

This installs everything automatically!

### Step 2: Configure Claude Desktop

The setup script will show you the exact config to add. It looks like:

```json
{
  "mcpServers": {
    "job-research": {
      "command": "node",
      "args": ["/your/path/to/job-research-mcp/dist/index.js"],
      "env": {
        "JOB_DB_PATH": "/your/path/to/data/jobs.db"
      }
    }
  }
}
```

Add this to your Claude Desktop config and **restart Claude**.

### Step 3: Test It!

**In Claude Desktop:**
```
"Scan for new AI jobs using the job-research MCP"
```

**In VS Code with Claude Code:**
```bash
npx @anthropic-ai/claude-code

> "Find design systems roles at AI companies"
```

## 💡 Example Usage

### Morning Routine
```
You: Any new AI jobs since yesterday?

Claude: 
- Scans target companies
- Found 3 matches:
  1. Anthropic - Design Systems (85% fit)
  2. Vercel - DX Lead (78% fit)
  3. OpenAI - TPM (72% fit)

You: Analyze the Anthropic role

Claude: [Deep analysis with requirements, gaps, strategy]

You: Optimize my CV for this role

Claude: [Generates 3 CV versions]

You: Use optimized version and mark as applied

Claude: ✓ CV saved, status updated
```

## 🎯 Key Features

### Automated Job Discovery
- Targets 7+ AI companies (easy to add more)
- Scrapes Greenhouse, Lever, and custom ATS
- Finds design systems, DX, and engineering roles
- Filters by relevance automatically

### Smart CV Optimization
- 3 versions per job (Conservative/Optimized/Stretch)
- Never fabricates - only reframes existing experience
- ATS-friendly keyword optimization
- Side-by-side comparison

### Strategic Analysis
- Requirements breakdown (hard/soft/hidden)
- Culture indicators from job language
- Competitive assessment
- Application timing recommendations

### Full Tracking
- SQLite database for all jobs
- Status tracking (new/reviewed/applied/interview)
- Notes and follow-up reminders
- Historical data for insights

## 🛠️ Customization with Claude Code

Once installed, use Claude Code to enhance it:

```bash
# Add new companies
> "Add Figma and Adobe to target companies"

# Improve scrapers
> "Make the scraper extract salary ranges"

# Better alignment
> "Use AI to deeply compare job requirements vs my CV"

# Add features
> "Create email digest of weekly jobs"
```

Claude Code will read the existing code and help you build exactly what you need!

## 📂 File Structure

```
job-research-system/
├── job-research-mcp/           # MCP Server
│   ├── src/
│   │   ├── index.ts            # Server entry point
│   │   ├── db/schema.ts        # Database
│   │   ├── scrapers/           # Job scrapers
│   │   └── tools/              # MCP tools
│   ├── package.json
│   └── tsconfig.json
│
├── claude-code-agents/         # Sub-agents
│   ├── cv-optimizer.md
│   └── job-analyzer.md
│
├── README.md                   # Full docs
├── CLAUDE_CODE_GUIDE.md        # Usage guide
├── setup.sh                    # Install script
└── GET_STARTED.md             # This file!
```

## 🔧 Tech Stack

- **MCP SDK**: Server framework
- **TypeScript**: Type-safe code
- **SQLite**: Local database
- **Cheerio**: Web scraping
- **Node.js**: Runtime

## 📚 Documentation

- **README.md**: Complete technical documentation
- **CLAUDE_CODE_GUIDE.md**: Detailed usage examples
- **Sub-agent files**: Built-in instructions for AI

## 🎨 What Makes This Special

1. **Hybrid Architecture**: MCP for persistence, sub-agents for interaction
2. **Local-First**: Your data stays on your machine
3. **Truthful**: Never fabricates CV content
4. **Extensible**: Easy to add companies, features
5. **AI-Native**: Built to work WITH Claude, not replace your judgment

## 🤝 How It Works Together

```
MCP Server (Background)
    ↓
Monitors job boards daily
    ↓
Stores in local database
    ↓
Claude Code uses MCP tools
    ↓
Sub-agents analyze & optimize
    ↓
You review and apply
```

## ⚡ Pro Tips

1. **Run scans daily**: `scan_new_jobs` once per day
2. **Use sub-agents liberally**: They're designed to help
3. **Track everything**: Update status after every action
4. **Iterate on CVs**: Don't settle for first version
5. **Let Claude Code help**: Ask it to add features you need

## 🎯 Next Steps

1. ✅ Run `./setup.sh`
2. ✅ Configure Claude Desktop
3. ✅ Restart Claude
4. ✅ Test with `scan_new_jobs`
5. ✅ Use Claude Code to customize
6. ✅ Start applying!

## 🐛 Troubleshooting

**MCP not loading?**
- Check config file path (absolute paths only)
- Restart Claude Desktop
- Check logs: `~/.local/state/Claude/logs/`

**Scrapers failing?**
- Companies change their sites frequently
- Use Claude Code: "Debug why Anthropic scraper failed"
- Claude will fix it!

**Sub-agents not found?**
- Verify: `ls ~/.claude-code/sub-agents/`
- Should show: cv-optimizer.md, job-analyzer.md

## 📧 Support

This is a personal tool, but if you get stuck:
1. Read the full README.md
2. Check CLAUDE_CODE_GUIDE.md for examples
3. Ask Claude Code: "Help me fix X"

## 🎉 You're All Set!

Your personal AI job researcher is ready. It will:
- Find relevant jobs daily
- Analyze fit automatically
- Generate tailored CVs
- Track your applications
- Improve with your feedback

**Let's find you that perfect AI role!** 🚀

---

Built with Claude 4 Sonnet | Version 1.0.0 | November 2025
