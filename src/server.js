#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Import the client
import SupermemoryClient from './supermemory-client.js';
import i18n from './i18n.js';
import { env } from './config.js';
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
            text: `🔍 **${i18n.t('search_results')}**\n\n${i18n.t('no_results_details', { query })}`
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
    console.error(i18n.t('search_error', { error: error.message }));
    throw new Error(i18n.t('search_error', { error: error.message }));
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
            text: i18n.t('memory_stored_demo', {
              title,
              content,
              id: memoryId
            })
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
          text: i18n.t('memory_stored_success', {
            title,
            content,
            id: result.id,
            suggestions: tags.length > 0 ? tags.slice(0, 3).join(", ") : title.split(" ").slice(0, 3).join(", ")
          })
        }
      ]
    };
  } catch (error) {
    console.error(i18n.t('storage_error', { error: error.message }));
    throw new Error(i18n.t('storage_error', { error: error.message }));
  }
});

// Connect using STDIO transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Supermemory MCP server running on stdio");