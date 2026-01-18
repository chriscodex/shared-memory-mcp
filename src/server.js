#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Import the client
import SupermemoryClient from './supermemory-client.js';
const supermemory = new SupermemoryClient();

// Create MCP server
const server = new McpServer({
  name: "memory",
  version: "1.0.0",
  description: "Team Memory - Store and retrieve team knowledge, project information, and contextual data"
});

// Register tools
server.tool("team_memory_search",
  "🔍 Search team memory for information, code, decisions, and knowledge. Returns relevant results with context and relevance scores.",
  {
    query: z.string().describe("Search query to find relevant information in team memory. Examples: 'authentication errors', 'API endpoints', 'project requirements'"),
    limit: z.number().optional().describe("Optional: Maximum number of results to return (default: 5, max: 20)")
  }, async ({ query, limit = 5 }) => {
  try {
    if (!supermemory.isReady()) {
      return {
        content: [
          {
            type: "text",
            text: `🔍 **Team Memory Search (Demo Mode)**\n\n` +
                  `⚠️ **Supermemory API not configured**\n\n` +
                  `📝 **Demo Result for "${query}"**\n` +
                  `This is a simulated response. To enable real team memory search:\n` +
                  `1. Get API key from https://supermemory.ai\n` +
                  `2. Set SUPERMEMORY_API_KEY environment variable\n` +
                  `3. Restart the MCP server\n\n` +
                  `💡 **Demo shows:** Team memory would return relevant project information, code snippets, decisions, and knowledge.`
          }
        ]
      };
    }

    const results = await supermemory.searchMemory(query, limit);

    if (results.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `🔍 **Team Memory Search Results**\n\nNo information found for query: "${query}"\n\n💡 **Suggestions:**\n• Try more specific terms (e.g., "JWT authentication" instead of "login")\n• Use broader search terms\n• Check if the information was recently added (may take 1-2 minutes to index)\n\n📚 **Available memory topics:** Try searching for terms like "authentication", "database", "API", "project", "team", "configuration"`
          }
        ]
      };
    }

    const formattedResults = results.map((result, index) =>
      `📄 **Result ${index + 1}: ${result.title || 'Untitled'}**\n` +
      `📝 ${result.content}\n` +
      `🏷️ Tags: ${result.tags.join(", ") || "none"}\n` +
      `🎯 Relevance: ${(result.score * 100).toFixed(1)}%`
    ).join("\n\n" + "─".repeat(50) + "\n\n");

    return {
      content: [
        {
          type: "text",
          text: `🔍 **Team Memory Search Results for "${query}"**\n\n` +
                `Found ${results.length} relevant memory entr${results.length === 1 ? 'y' : 'ies'}:\n\n` +
                `${formattedResults}\n\n` +
                `💡 **Pro tip:** Use specific keywords from these results to find related information!`
        }
      ]
    };
  } catch (error) {
    console.error('Search error:', error);
    throw new Error(`Error al buscar memoria: ${error.message}`);
  }
});

server.tool("team_memory_store",
  "💾 Store information, decisions, code snippets, or knowledge in team-shared memory for future reference by all team members.",
  {
    content: z.string().describe("The information content to store in team memory. Be specific and detailed. Examples: 'User authentication uses JWT tokens with 24h expiry', 'Database connection string: postgresql://...'"),
    title: z.string().describe("A clear, descriptive title for this memory entry. Examples: 'JWT Authentication Setup', 'Database Configuration', 'API Error Handling'"),
    tags: z.array(z.string()).optional().describe("Optional: Tags for better organization and searchability. Examples: ['authentication', 'security'], ['database', 'config'], ['api', 'errors']")
  }, async ({ content, title, tags = [] }) => {
  try {
    if (!supermemory.isReady()) {
      // Modo simulado cuando no hay API key
      const memoryId = `demo_${Date.now()}`;

      return {
        content: [
          {
            type: "text",
            text: `✅ **Team Memory Storage (Demo Mode)**\n\n` +
                  `📝 **${title}**\n` +
                  `📄 ${content}\n` +
                  `🏷️ Tags: ${tags.length > 0 ? tags.join(", ") : "none"}\n` +
                  `🆔 Demo ID: ${memoryId}\n\n` +
                  `⚠️ **Demo Mode:** This information was NOT permanently stored.\n\n` +
                  `🔧 **To enable real storage:**\n` +
                  `• Get API key from https://supermemory.ai\n` +
                  `• Set SUPERMEMORY_API_KEY in environment\n` +
                  `• This memory will then be searchable by all team members!`
          }
        ]
      };
    }

    // Almacenamiento real con Supermemory API
    const result = await supermemory.storeMemory(content, title, tags);

    return {
      content: [
        {
          type: "text",
          text: `✅ **Team Memory Stored Successfully!**\n\n` +
                `📝 **${title}**\n` +
                `📄 ${content}\n` +
                `🏷️ Tags: ${tags.length > 0 ? tags.join(", ") : "none"}\n` +
                `👤 Stored in team memory\n` +
                `🆔 Memory ID: ${result.id}\n\n` +
                `💡 **Note:** This information will be searchable by team members in 1-2 minutes after processing.\n` +
                `🔍 **Search suggestions:** ${tags.length > 0 ? tags.slice(0, 3).join(", ") : title.split(" ").slice(0, 3).join(", ")}`
        }
      ]
    };
  } catch (error) {
    console.error('Storage error:', error);
    throw new Error(`Error al almacenar memoria: ${error.message}`);
  }
});

server.tool("user_profile_get",
  "👤 Get user profile information including preferences, facts, and context automatically extracted from their stored memories.",
  {
    user_id: z.string().optional().describe("Optional: User ID to get profile for (default: current user). Use specific user names to get individual profiles.")
  }, async ({ user_id }) => {
  try {
    const profile = await supermemory.getUserProfile(user_id);

    if (!profile.hasPreferences) {
      return {
        content: [
          {
            type: "text",
            text: `👤 **User Profile for ${user_id || 'team member'}**\n\n` +
                `❌ No profile information found.\n\n` +
                `💡 **Suggestion:** Add some memories with the user's name/tag to build their profile automatically.`
          }
        ]
      };
    }

    const staticInfo = profile.static.length > 0 ?
      profile.static.map(fact => `• ${fact}`).join('\n') :
      'No static profile information available.';

    const dynamicInfo = profile.dynamic.length > 0 ?
      profile.dynamic.map(fact => `• ${fact}`).join('\n') :
      'No recent dynamic information available.';

    return {
      content: [
        {
          type: "text",
          text: `👤 **User Profile for ${user_id || 'team member'}**\n\n` +
            `📋 **Static Facts (long-term preferences):**\n${staticInfo}\n\n` +
            `🔄 **Dynamic Context (recent activity):**\n${dynamicInfo}\n\n` +
            `💡 **Note:** Profile information is automatically extracted from stored memories.`
        }
      ]
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new Error(`Error al consultar perfil de usuario: ${error.message}`);
  }
});

server.tool("user_memory_store",
  "👤💾 Store personal information and preferences about the current user in team memory. This will be automatically personalized with the user's name for better profile building.",
  {
    content: z.string().describe("Personal information about the current user. Examples: 'I love traveling', 'My favorite food is Peruvian cuisine', 'I work as a developer'"),
    title: z.string().optional().describe("Optional title for this personal memory. If not provided, will default to 'Personal Information'")
  }, async ({ content, title = "Personal Information" }) => {
  try {
    if (!supermemory.isReady()) {
      // Modo simulado cuando no hay API key
      const memoryId = `demo_personal_${Date.now()}`;

      return {
        content: [
          {
            type: "text",
            text: `✅ **Personal Memory Storage (Demo Mode)**\n\n` +
                  `📝 **${title}**\n` +
                  `📄 ${content}\n` +
                  `👤 Will be personalized with user name when stored\n` +
                  `🆔 Demo ID: ${memoryId}\n\n` +
                  `⚠️ **Demo Mode:** This information was NOT permanently stored.\n\n` +
                  `🔧 **To enable real storage:**\n` +
                  `• Get API key from https://supermemory.ai\n` +
                  `• Set SUPERMEMORY_API_KEY in environment\n` +
                  `• This will help build your personal profile!`
          }
        ]
      };
    }

    // Almacenamiento real con personalización automática
    const result = await supermemory.storeMemory(content, title, ['personal', 'preferences']);

    return {
      content: [
        {
          type: "text",
          text: `✅ **Personal Memory Stored Successfully!**\n\n` +
                `📝 **${title}**\n` +
                `📄 ${content}\n` +
                `👤 Personalized and stored in your profile\n` +
                `🆔 Memory ID: ${result.id}\n\n` +
                `💡 **Note:** This will help build your user profile. You can ask agents to check your preferences later!\n` +
                `🔍 **Search suggestions:** "my preferences", "what I like", "my profile"`
        }
      ]
    };
  } catch (error) {
    console.error('Personal storage error:', error);
    throw new Error(`Error al almacenar información personal: ${error.message}`);
  }
});

// Connect using STDIO transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Supermemory MCP server running on stdio");