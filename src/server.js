#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

class SupermemoryMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "supermemory-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupRequestHandlers();
  }

  setupToolHandlers() {
    // Tool 1: Search team memory
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "search_team_memory",
            description: "Search for relevant information in the team's shared memory",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query to find relevant memories"
                },
                user_id: {
                  type: "string",
                  description: "Optional: Filter by specific user (default: 'team')"
                },
                limit: {
                  type: "number",
                  description: "Optional: Maximum number of results (default: 5)"
                }
              },
              required: ["query"]
            }
          },
          {
            name: "store_team_memory",
            description: "Store a conversation or information in the team's shared memory",
            inputSchema: {
              type: "object",
              properties: {
                content: {
                  type: "string",
                  description: "The content to store in memory"
                },
                title: {
                  type: "string",
                  description: "A descriptive title for the memory"
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Optional: Tags for categorization"
                },
                user_id: {
                  type: "string",
                  description: "Optional: User who created this memory (default: current user)"
                }
              },
              required: ["content", "title"]
            }
          }
        ]
      };
    });

    // Tool 2: Store team memory
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "search_team_memory":
          return await this.searchTeamMemory(args);
        case "store_team_memory":
          return await this.storeTeamMemory(args);
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
      }
    });
  }

  async searchTeamMemory(args) {
    try {
      const { query, user_id = "team", limit = 5 } = args;

      // TODO: Implement actual Supermemory API call
      // For now, return mock data
      const mockResults = [
        {
          id: "1",
          content: `Found relevant memory about: ${query}`,
          title: "Mock Memory Result",
          score: 0.95,
          tags: ["mock", "test"],
          created_at: new Date().toISOString()
        }
      ];

      return {
        content: [
          {
            type: "text",
            text: `Search results for "${query}":\n\n${mockResults.map(result =>
              `📝 **${result.title}**\n${result.content}\n🏷️ Tags: ${result.tags.join(", ")}\n\n`
            ).join("")}\n\n⚠️ *This is mock data. Supermemory integration pending.*`
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Search failed: ${error.message}`
      );
    }
  }

  async storeTeamMemory(args) {
    try {
      const { content, title, tags = [], user_id } = args;

      // TODO: Implement actual Supermemory API call
      // For now, simulate storage
      const memoryId = `mem_${Date.now()}`;

      return {
        content: [
          {
            type: "text",
            text: `✅ Memory stored successfully!\n\n📝 **${title}**\n${content}\n🏷️ Tags: ${tags.join(", ") || "none"}\n🆔 ID: ${memoryId}\n\n⚠️ *This is simulated. Actual Supermemory storage pending.*`
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Storage failed: ${error.message}`
      );
    }
  }

  setupRequestHandlers() {
    // Add any additional request handlers here if needed
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Supermemory MCP server running on stdio");
  }
}

// Run the server
const server = new SupermemoryMCPServer();
server.run().catch(console.error);