# Using AI Job Research System with Claude Code

This guide shows you how to use the job research system within Claude Code (both CLI and VS Code extension).

## Setup (One-Time)

1. **Run the setup script:**
```bash
cd job-research-system
./setup.sh
```

2. **Configure Claude Code MCP:**

The setup script generates a config for you. Add it to your Claude Code config file:

**Mac/Linux:** `~/.config/claude-code/mcp.json`
**Windows:** `%APPDATA%\claude-code\mcp.json`

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

3. **Restart Claude Code**

## Daily Workflow Examples

### Morning Routine: Check New Jobs

**In Claude Code (CLI or VS Code):**

```
You: Check for new jobs matching my profile

Claude:
- Calls search_ai_jobs() via MCP
- Finds 3 new roles:
  1. Anthropic - Design Systems Engineer (85% match)
  2. Vercel - Developer Experience Lead (78% match)  
  3. Cursor - Senior Product Designer (65% match)
- Automatically invokes Job Analyzer for high-match jobs
- Presents priority recommendations

You: Analyze the Anthropic role in detail

Claude:
- Calls get_job_details(job_id)
- Calls analyze_job_fit(job_id, cv_path)
- Invokes Job Analyzer sub-agent
- Provides detailed breakdown:
  * Role alignment analysis
  * Technical requirements match
  * Company culture fit
  * Strategic application advice
```

### Optimize CV for Specific Role

```
You: Optimize my CV for the Anthropic Design Systems role

Claude:
- Fetches job details
- Invokes CV Optimizer sub-agent
- Generates 3 versions:
  * Conservative (minimal changes)
  * Optimized (recommended)
  * Stretch (maximum optimization)
- Shows side-by-side comparison
- Highlights key changes

You: Use the optimized version

Claude:
- Saves to /mnt/user-data/outputs/cv-anthropic-2025-11-19.md
- Provides download link
- Includes cover letter brief
```

### Track Applications

```
You: Mark Anthropic role as applied with note "Applied via careers page, emphasized Token Chain project"

Claude:
- Calls mark_job_applied(job_id, notes)
- Updates database
- Confirms tracking

You: Show my application pipeline

Claude:
- Calls get_application_stats()
- Shows:
  * Total jobs tracked: 15
  * Applied: 5
  * In review: 2  
  * Interviews: 1
  * Average alignment: 72%
```

## Command Patterns

### Search Commands

```
"Search for new jobs"
"Find jobs at Anthropic and Vercel"
"Show me jobs with 70%+ alignment"
"Get all high-priority jobs I haven't applied to"
"What's new since last week?"
```

### Analysis Commands

```
"Analyze job [url or job_id]"
"Compare these 3 jobs for me"
"What are the gaps in my profile for this role?"
"Is this role a good fit?"
"Show red flags for [company]"
```

### CV Optimization Commands

```
"Optimize my CV for [job]"
"Generate 3 CV versions for this role"
"What should I emphasize for this application?"
"Create cover letter talking points"
"Show me before/after for professional summary"
```

### Tracking Commands

```
"Mark [job] as applied"
"Archive jobs from [company]"
"Show application statistics"
"What needs my attention this week?"
"Update status for [job] to interview"
```

## Working with Files

### Upload Your CV

For better analysis, upload your CV to Claude Code:

```
You: [Upload Samar_M_Ascari_-_V2_docx.md]
You: Use this CV for all job analysis

Claude: 
- Stores CV reference
- Will use for alignment calculations
- Passes to CV Optimizer sub-agent
```

### Generate Optimized CV Files

```
You: Create optimized CV for Vercel role and save as PDF

Claude:
1. Generates optimized CV
2. Converts to PDF using available tools
3. Saves to /mnt/user-data/outputs/
4. Provides download link
```

## Advanced Usage

### Batch Operations

```
You: Get all new jobs, analyze them, and show me the top 3 matches

Claude:
1. Calls search_ai_jobs()
2. Calls batch_analyze_jobs([all_job_ids])
3. Sorts by alignment score
4. Presents top 3 with detailed analysis
5. Asks: "Which would you like to apply to?"
```

### Custom Filters

```
You: Show me remote design systems roles at companies with less than 500 employees

Claude:
1. Calls get_jobs(remote=true)
2. Filters for design systems keywords
3. Researches company sizes
4. Presents filtered list
```

### Weekly Planning

```
You: Create my job search plan for this week

Claude:
1. Calls get_jobs_needing_attention()
2. Analyzes time required for each
3. Generates prioritized plan:
   Monday: Apply to 2 high-priority roles
   Tuesday: Follow up on pending applications
   Wednesday: Network with design teams
   Thursday: Prepare for interviews
   Friday: Review new postings
```

## Sub-agent Invocation

Claude Code automatically invokes sub-agents when needed, but you can also request them explicitly:

### Job Analyzer

```
You: Use job-analyzer to evaluate this role

Claude:
- Loads job-analyzer.md instructions
- Performs deep analysis
- Provides strategic recommendations
```

### CV Optimizer

```
You: Use cv-optimizer to tailor my CV

Claude:
- Loads cv-optimizer.md instructions  
- Generates multiple versions
- Shows optimization strategies
```

## Tips for Best Results

### 1. **Be Specific About Goals**
```
❌ "Find me jobs"
✅ "Find design systems roles at AI companies with 70%+ match"
```

### 2. **Leverage Context**
```
You: [Upload CV]
You: "For all future analysis, use this CV"

Now Claude has full context for alignment calculations
```

### 3. **Iterate on CV Optimization**
```
You: "Optimize my CV for Anthropic role"
You: "Make the AI section more prominent"  
You: "Add more metrics to the Canon section"
```

### 4. **Use MCP for Data, Sub-agents for Strategy**
```
MCP: "Get job details" → Raw data
Sub-agent: "Should I apply?" → Strategic analysis
```

### 5. **Track Everything**
```
After each application:
"Mark as applied with notes about what I emphasized"

This builds a history you can reference later
```

## Troubleshooting in Claude Code

### MCP Server Not Responding

```
You: Test the job research MCP server

Claude:
- Attempts to call get_application_stats()
- If fails: Suggests checking config
- If succeeds: Confirms server is running
```

### Sub-agents Not Loading

```
You: List available sub-agents

Claude shows what's in ~/.config/claude-code/agents/
If missing, run setup.sh again
```

### Database Locked

```
If you see "database is locked" errors:
1. Close any other processes using the database
2. Restart Claude Code
3. Try operation again
```

## Integration with Other Tools

### Export to Notion

```
You: Export my job pipeline to a Notion-compatible format

Claude:
1. Gets all jobs from database
2. Formats as CSV or JSON
3. Saves to /outputs/
4. You import to Notion
```

### Sync with Trello/Linear

```
You: Create a Trello card for each high-priority job

Claude:
1. Gets high-priority jobs
2. Generates card format
3. You copy/paste to Trello
```

### Email Digests

```
You: Send me a weekly summary email of my job search

Claude:
1. Generates summary
2. Formats as email
3. You copy to your email client
(Or build MCP integration for direct sending)
```

## Keyboard Shortcuts (VS Code)

If using Claude Code VS Code extension:

- `Cmd/Ctrl + Shift + P` → "Claude Code: Start Chat"
- `Cmd/Ctrl + K` → Quick command
- Paste job URLs directly into chat

## Best Practices

1. **Daily Habit:** Check for new jobs every morning
2. **Track Immediately:** Mark jobs as applied right after submitting
3. **Iterate CVs:** Save each optimized version with clear naming
4. **Review Weekly:** Use `get_application_stats()` every Friday
5. **Update Database:** Archive old/irrelevant jobs monthly

## Real Example: Complete Application Flow

```
You: Good morning! Let's check my job search.

Claude: Good morning! Let me check for new opportunities.
[Calls search_ai_jobs()]
Found 2 new jobs:
1. Anthropic - Design Systems Engineer (87% match) 🔥
2. Perplexity - Senior Product Designer (62% match)

You: Tell me more about the Anthropic role

Claude: [Deep analysis with Job Analyzer]
This is an excellent match! The role focuses on:
- Building design system for Claude (their AI product)
- Cross-functional leadership with eng teams
- AI-augmented developer workflows

Your strong matches:
- Enterprise design systems (Canon 57 sites)
- Token Chain project shows AI integration skills
- Technical depth in React/TypeScript

Strategic recommendation: HIGH PRIORITY
Apply within 48 hours, emphasize Token Chain in cover letter.

You: Perfect. Optimize my CV for this.

Claude: [CV Optimizer generates versions]
Created 3 versions. Recommended: Optimized

Key changes in Optimized version:
- Professional summary leads with AI-augmented workflows
- Token Chain moved to top of projects
- Design system metrics emphasized
- Keywords: "AI product", "developer experience" added

Alignment improvement: 72% → 87%

You: Great, use the optimized version. Also create cover letter points.

Claude: 
✓ Saved: cv-anthropic-design-systems-2025-11-19.md
✓ Download: [computer://...]

Cover letter talking points:
1. Token Chain demonstrates AI-native tool building
2. Canon scale (57 sites) = ready for enterprise AI product
3. MCP integration experience = relevant to their infrastructure

Questions to ask:
1. How do you balance AI-generated components with design craft?
2. What's your vision for design systems in AI products?

You: Perfect. Mark as "applied" with these notes.

Claude: [Calls mark_job_applied()]
✓ Tracked: Anthropic - Design Systems Engineer
Status: Applied
Notes: Applied 2025-11-19, emphasized Token Chain and AI workflows

Good luck! Want to track interview prep?
```

---

**Remember:** This system is designed to save you time and improve your application quality. Use it daily, customize it to your needs, and let Claude Code do the heavy lifting!
