# Shared Memory MCP Server

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

**Persistent and shared memory for teams and individuals using Cursor + Supermemory.ai**

Allows Cursor agents to store and retrieve knowledge, decisions, and context persistently from any project or conversation.

## 🎯 Use Cases

### 👥 **For Teams**
- **Shared team memory** across all projects
- **Persistent knowledge** that survives Cursor restarts
- **Enhanced collaboration** between team members
- **Consistent context** across all projects

### 👤 **For Individuals**
- **Cross-agent memory**: One agent saves, another agent can search
- **Persistent context**: Naturally Cursor doesn't share memory between chats/agents
- **Continuity**: Maintain context between different work sessions
- **Personal productivity**: Access information from any Cursor chat

## 🚀 Global Installation

```bash
# From the project root
./install-global.sh
```

This script installs the MCP globally and configures everything automatically.

### Configuration
```bash
# Copy example file
cp .env.example .env

# Configure your variables:
# - SUPERMEMORY_API_KEY: Your Supermemory API key
# - LANGUAGE: en (English) or es (Spanish)
# - DEFAULT_USER_ID: Your name

# Apply global configuration
./setup-env.sh
```

### Get API Key
1. Go to [Supermemory.ai](https://supermemory.ai/)
2. Sign up and get your free API key
3. Paste it in `SUPERMEMORY_API_KEY`

### Ready! ✅
Restart Cursor and you'll have team memory in all your projects:
- `memory/team_memory_search` 🔍 - Search team information
- `memory/team_memory_store` 💾 - Save information automatically

**Why global?** Team memory should be consistent across all projects where you work.

> **Note:** Local per-project installation is not recommended as it would fragment team memory and require duplicate configuration in each repository.

## 📋 Requirements

- **Node.js** >= 18.0.0
- **Cursor IDE**
- **API Key** from Supermemory.ai (free)


## 💡 Usage with Agents

### 🔍 Search information
Use phrases: **"search in memory"** or **"search in team memory"**

```
Search in memory about "JWT authentication"
Search in team memory about database configuration
Is there information saved about Docker in memory?
```

### 💾 Save information
Use phrases: **"save in memory"** or **"save in team memory"**

```
Save in memory that we use PostgreSQL as main database
Save in team memory this decision: microservices with API Gateway
Save in memory that the login endpoint is /api/auth/login
```

**Note:** All memories are automatically saved with your name (`DEFAULT_USER_ID`) and formatted according to the configured language (`LANGUAGE`) for better identification in team searches.


## ✨ Automatic User Formatting

**All memories are automatically formatted** with clear user attribution:

```
"Save that I like to travel"
→ Saved as: "Preferences - User Chris saved: I like to travel"
```

This ensures that:
- ✅ All information has clear author attribution
- ✅ Searches include context about who saved each memory
- ✅ Team traceability is perfect

## 🌍 Internationalization (i18n)

The server supports multiple languages. To change the language:

1. **Configure the environment variable:**
   ```bash
   LANGUAGE=en  # For English (default)
   ```

2. **Translation files:**
   - `locales/en.json` - English translations

3. **Adding new languages:**
   - Create `locales/[code].json`
   - Add necessary translations
   - Configure `LANGUAGE=[code]`

**Supported languages:** 🇺🇸 English (default)

## 🏗️ Architecture

```
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cursor    │────│   MCP Server     │────│  Supermemory.ai │
│   Agent     │    │  (Node.js)       │    │     API         │
└─────────────┘    └─────────────────┘    └─────────────────┘
```

- **Cursor Agent**: User interface
- **MCP Server**: Communication protocol
- **Supermemory.ai**: Persistent storage

## 🔧 Development

### Run in development
```bash
npm run dev  # With hot reload
```

### Build for production
```bash
npm run start
```

## 🐛 Troubleshooting

### "No MCP servers found"
- Completely restart Cursor
- Verify that `~/.cursor/mcp.json` exists

### "API key not configured"
- Verify that `SUPERMEMORY_API_KEY` has a real value in `.env`

### Simulation mode active
- Configure the API key correctly and run `./setup-env.sh`

## 📄 License

MIT - See [LICENSE](LICENSE) for more details.

---

**Questions?** Open an issue on GitHub.