#!/bin/bash

echo "🚀 Installing Team Memory MCP Server Globally"
echo "============================================="

# Verify we're in the correct directory
if [ ! -f "src/server.js" ]; then
    echo "❌ Error: Run this script from the shared-memory-mcp project root"
    exit 1
fi

# Verify Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Creating global symlink..."
npm link

echo "⚙️  Configuring global MCP..."

# Create global directory if it doesn't exist
mkdir -p ~/.cursor

# Global configuration
cat > ~/.cursor/mcp.json << 'EOF'
{
  "mcpServers": {
    "memory": {
      "command": "shared-memory-mcp",
      "args": [],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
EOF

echo "🔑 Verifying API key configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Copying example..."
    cp .env.example .env
    echo "✏️  Edit the .env file with your Supermemory.ai API key"
fi

echo ""
echo "✅ Installation completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit ~/.cursor/mcp.json if you need custom environment variables"
echo "2. Configure SUPERMEMORY_API_KEY in your .env"
echo "3. Completely restart Cursor"
echo ""
echo "🎯 MCP will be available globally across all your Cursor projects"