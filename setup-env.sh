#!/bin/bash

echo "🔧 Configuring Global Environment Variables"
echo "==========================================="

# Check if .env exists in current directory
if [ -f ".env" ]; then
    echo "✅ .env file found"

    # Read variables from .env
    SUPERMEMORY_API_KEY=$(grep "SUPERMEMORY_API_KEY" .env | cut -d'=' -f2)
    SUPERMEMORY_BASE_URL=$(grep "SUPERMEMORY_BASE_URL" .env | cut -d'=' -f2)
    DEFAULT_USER_ID=$(grep "DEFAULT_USER_ID" .env | cut -d'=' -f2)
    LANGUAGE=$(grep "^LANGUAGE" .env | cut -d'=' -f2)

    if [ -z "$SUPERMEMORY_API_KEY" ]; then
        echo "❌ SUPERMEMORY_API_KEY not found in .env"
        echo "Please configure your API key first"
        exit 1
    fi

    if [ -z "$DEFAULT_USER_ID" ]; then
        echo "⚠️  DEFAULT_USER_ID not found, using 'user' as default"
        DEFAULT_USER_ID="user"
    fi

    echo "🔑 API Key found: ${SUPERMEMORY_API_KEY:0:20}..."
    echo "🌐 Base URL: ${SUPERMEMORY_BASE_URL:-https://api.supermemory.ai/v4}"
    echo "👤 User ID: ${DEFAULT_USER_ID}"
    echo "🌍 Language: ${LANGUAGE:-en}"

    # Update global configuration
    cat > ~/.cursor/mcp.json << EOF
{
  "mcpServers": {
    "memory": {
      "command": "shared-memory-mcp",
      "args": [],
      "env": {
        "NODE_ENV": "production",
        "SUPERMEMORY_API_KEY": "$SUPERMEMORY_API_KEY",
        "SUPERMEMORY_BASE_URL": "${SUPERMEMORY_BASE_URL:-https://api.supermemory.ai/v4}",
        "DEFAULT_USER_ID": "$DEFAULT_USER_ID",
        "LANGUAGE": "${LANGUAGE:-en}"
      }
    }
  }
}
EOF

    echo "✅ Global configuration updated!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Completely restart Cursor"
    echo "2. MCP will work with permanent storage"

else
    echo "❌ .env file not found"
    echo "Run this script from the shared-memory-mcp project directory"
    exit 1
fi