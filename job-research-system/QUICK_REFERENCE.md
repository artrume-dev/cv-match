# Quick Reference Card

## 🔧 Installation

```bash
./setup.sh                      # Run setup script
```

## 🎯 MCP Tools (Claude Desktop)

```
scan_new_jobs                   # Find new jobs from target companies
search_ai_jobs                  # Search stored jobs with filters
get_job_details                 # Get full job posting
analyze_job_fit                 # Calculate alignment score
update_job_status               # Track application status
get_new_jobs_since              # Jobs since date
```

## 🤖 Sub-agents (Claude Code)

```bash
/cv-optimizer                   # Generate 3 CV versions
/job-analyzer                   # Deep job analysis
```

## 💬 Natural Language Examples

### Job Discovery
```
"Check for new AI jobs"
"Find design systems roles at Anthropic"
"Show me all remote jobs with 75%+ alignment"
"What new jobs since yesterday?"
```

### Job Analysis
```
"Analyze this job: [URL]"
"Should I apply to the Vercel role?"
"What's the competition for this role?"
"Tell me about the Anthropic role from earlier"
```

### CV Optimization
```
"Optimize my CV for this role"
"Create a tailored CV for the OpenAI position"
"Generate CV versions for the jobs you found"
```

### Tracking
```
"Mark job #5 as applied"
"What jobs have I applied to?"
"Update Anthropic to interview stage"
"Show me all pending applications"
```

## 🔄 Daily Workflow

### Morning (5 min)
```
1. "Check for new AI jobs since yesterday"
2. "Analyze the top matches"
3. "Which ones should I prioritize?"
```

### Application (30 min)
```
1. "Optimize CV for [Company] role"
2. Review 3 versions
3. "Use optimized version"
4. "Mark as applied"
```

### Weekly Review (15 min)
```
1. "What's my application status?"
2. "Any interviews scheduled?"
3. "Jobs to follow up on?"
```

## 📊 Database Queries

```bash
# View database directly
sqlite3 data/jobs.db

# Useful queries
SELECT company, title, alignment_score FROM jobs 
WHERE status = 'new' ORDER BY alignment_score DESC;

SELECT COUNT(*) FROM jobs WHERE status = 'applied';
```

## 🛠️ Development (with Claude Code)

```bash
# Add new scraper
"Add Indeed scraper for remote design systems roles"

# Fix scraper
"Debug why Anthropic scraper is failing"

# Add feature
"Create weekly email digest of new jobs"

# Improve alignment
"Use AI to better calculate job fit scores"
```

## 🎨 Target Companies

Current:
- Anthropic
- OpenAI
- Vercel
- Cursor
- Replit
- Perplexity
- Hugging Face

Add more: "Add [Company] to target list"

## 📝 File Locations

```
MCP Server:
~/job-research-system/job-research-mcp/

Sub-agents:
~/.claude-code/sub-agents/

Database:
~/job-research-system/job-research-mcp/data/jobs.db

CV outputs:
/mnt/user-data/outputs/

Config:
~/Library/Application Support/Claude/claude_desktop_config.json  # Mac
~/.config/Claude/claude_desktop_config.json                      # Linux
%APPDATA%\Claude\claude_desktop_config.json                      # Windows
```

## 🚨 Troubleshooting

```
MCP not working → Check config, restart Claude Desktop
Scraper failing → Ask Claude Code to debug
Database locked → Close other connections
Sub-agent missing → Verify ~/.claude-code/sub-agents/
```

## 🎯 Status Values

```
new       → Just discovered
reviewed  → Analyzed, considering
applied   → Application submitted
interview → Interview scheduled
rejected  → Not moving forward
```

## 📈 Alignment Scores

```
85-100% → Strong fit, apply immediately
70-84%  → Good fit, competitive
50-69%  → Stretch role, consider
<50%    → Not recommended right now
```

## 💡 Pro Tips

1. Run scans daily
2. Analyze before applying
3. Use optimized CV for most roles
4. Track everything
5. Follow up weekly
6. Let Claude Code help customize

## ⚡ Keyboard Shortcuts (Claude Code)

```
Cmd/Ctrl + K        → Invoke Claude
Cmd/Ctrl + L        → Clear chat
/[agent-name]       → Invoke specific sub-agent
```

---

**Keep this card handy for quick reference!**
