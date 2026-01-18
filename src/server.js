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
                  `• Content will be automatically personalized with your name for team memory!`
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
                `💡 **Note:** Content was automatically personalized with your name (${supermemory.defaultUserId}) for better team memory. This information will be searchable by team members in 1-2 minutes after processing.\n` +
                `🔍 **Search suggestions:** ${tags.length > 0 ? tags.slice(0, 3).join(", ") : title.split(" ").slice(0, 3).join(", ")}`
        }
      ]
    };
  } catch (error) {
    console.error('Storage error:', error);
    throw new Error(`Error al almacenar memoria: ${error.message}`);
  }
});

// Connect using STDIO transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Supermemory MCP server running on stdio");