# Quick Start - Get Running in 5 Minutes

## Step 1: Download & Extract
Download the `job-research-system` folder and extract to your computer.

## Step 2: Install & Build
```bash
cd job-research-system
./setup.sh
```

This will:
- Install MCP server dependencies
- Build the TypeScript code
- Install Claude Code sub-agents
- Generate configuration file

## Step 3: Configure Claude Code

**Mac/Linux:**
Edit `~/.config/claude-code/mcp.json`

**Windows:**
Edit `%APPDATA%\claude-code\mcp.json`

Add this (the setup script shows you the exact path):
```json
{
  "mcpServers": {
    "job-research": {
      "command": "node",
      "args": ["/your/absolute/path/job-research-mcp/dist/index.js"]
    }
  }
}
```

## Step 4: Restart Claude Code

Close and reopen Claude Code (CLI or VS Code extension).

## Step 5: Test It!

Open Claude Code and try:

```
> Check for new AI jobs
```

Claude should:
1. Use the MCP server to search job boards
2. Find relevant roles at AI companies
3. Present them with alignment scores

## Your First Real Task

```
> Find design systems roles at Anthropic, Vercel, and Cursor with 70%+ alignment
```

```
> Analyze the top match in detail
```

```
> Optimize my CV for this role
```

That's it! You're running.

## Next Steps

- Read `CLAUDE_CODE_GUIDE.md` for detailed usage examples
- Read `README.md` for customization options
- Upload your CV to Claude Code for better alignment analysis

## Quick Reference

**Daily commands:**
- `Check for new jobs`
- `Show application statistics`  
- `What needs my attention?`

**When you find a good role:**
- `Analyze [job]`
- `Optimize my CV for [job]`
- `Mark [job] as applied`

## Troubleshooting

**MCP server not found:**
- Check the path in your mcp.json is absolute
- Verify `npm run build` completed successfully
- Restart Claude Code

**No jobs found:**
- Companies may have changed their ATS
- Check console for scraper errors
- Verify network isn't blocking job board APIs

**Need help:**
- Ask Claude Code: "Troubleshoot the job research MCP server"
- Check the logs in `job-research-mcp/data/`

---

**You're all set!** The system is monitoring AI company jobs and ready to help you optimize applications. Happy job hunting! 🎯
