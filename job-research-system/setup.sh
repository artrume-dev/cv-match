#!/bin/bash

# AI Job Research System - Setup Script
# This script sets up the MCP server and Claude Code sub-agents

set -e

echo "🚀 Setting up AI Job Research System..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the absolute path of the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 1. Install MCP Server
echo -e "${BLUE}📦 Installing MCP Server dependencies...${NC}"
cd "$SCRIPT_DIR/job-research-mcp"
npm install
echo ""

# 2. Build MCP Server
echo -e "${BLUE}🔨 Building MCP Server...${NC}"
npm run build
echo ""

# 3. Create data directory
echo -e "${BLUE}📁 Creating data directory...${NC}"
mkdir -p "$SCRIPT_DIR/job-research-mcp/data"
echo ""

# 4. Test MCP Server
echo -e "${BLUE}🧪 Testing MCP Server...${NC}"
if node dist/index.js &> /dev/null; then
    echo -e "${GREEN}✓ MCP Server built successfully${NC}"
else
    echo -e "${YELLOW}⚠ MCP Server test failed (this might be expected if not connected to stdio)${NC}"
fi
echo ""

# 5. Get Claude Code config path
if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CLAUDE_CONFIG_DIR="$HOME/.config/claude-code"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    CLAUDE_CONFIG_DIR="$APPDATA/claude-code"
else
    CLAUDE_CONFIG_DIR="$HOME/.config/claude-code"
fi

# 6. Install sub-agents
echo -e "${BLUE}🤖 Installing Claude Code sub-agents...${NC}"
mkdir -p "$CLAUDE_CONFIG_DIR/agents"
cp "$SCRIPT_DIR/claude-code-agents/"*.md "$CLAUDE_CONFIG_DIR/agents/"
echo -e "${GREEN}✓ Sub-agents installed to $CLAUDE_CONFIG_DIR/agents/${NC}"
echo ""

# 7. Generate MCP config
echo -e "${BLUE}⚙️  Generating MCP configuration...${NC}"
MCP_SERVER_PATH="$SCRIPT_DIR/job-research-mcp/dist/index.js"

cat > "$SCRIPT_DIR/mcp-config.json" << EOF
{
  "mcpServers": {
    "job-research": {
      "command": "node",
      "args": ["$MCP_SERVER_PATH"]
    }
  }
}
EOF

echo -e "${GREEN}✓ MCP config generated at $SCRIPT_DIR/mcp-config.json${NC}"
echo ""

# 8. Instructions for Claude Code
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo ""
echo "1. Add MCP server to your Claude Code config:"
echo "   Config location: $CLAUDE_CONFIG_DIR/mcp.json"
echo ""
echo "   Add this content (or merge with existing config):"
echo -e "${YELLOW}"
cat "$SCRIPT_DIR/mcp-config.json"
echo -e "${NC}"
echo ""
echo "2. Restart Claude Code to load the MCP server"
echo ""
echo "3. Test the system:"
echo "   > Check for new AI jobs"
echo "   > Show me application statistics"
echo ""
echo "4. Upload your CV to Claude Code for better analysis:"
echo "   Upload: $SCRIPT_DIR/../Samar_M_Ascari_-_V2_docx.md"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   README: $SCRIPT_DIR/README.md"
echo "   Claude Code Guide: $SCRIPT_DIR/CLAUDE_CODE_GUIDE.md"
echo ""
echo -e "${GREEN}Happy job hunting! 🎯${NC}"
