# AI Job Research System - Web UI

A modern, browser-based interface for the AI Job Research System, built with React, Tailwind CSS, and shadcn/ui.

## Features

- 🎯 **Natural Language Commands** - Use simple prompts to search and manage jobs
- 📊 **Real-time Stats** - Track applications, priorities, and alignment scores
- 🔍 **Smart Job Cards** - Visual job listings with inline actions
- 🤖 **MCP Integration** - Direct connection to the Model Context Protocol server
- 🎨 **Modern UI** - Clean, responsive design with Tailwind and shadcn/ui
- ⚡ **Fast & Lightweight** - Built with Vite for instant dev server startup

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start the HTTP API server
```bash
cd ../job-research-mcp
npm run build
npm run start:http
```

### 3. Start the UI
```bash
cd ../job-research-ui
npm run dev
```

### 4. Open browser
Navigate to `http://localhost:5173`

## Usage

- Type commands like "Find new jobs at Anthropic"
- Click job cards to view details
- Use filters to sort by status
- Mark jobs as applied or archived

See full documentation for more details.
