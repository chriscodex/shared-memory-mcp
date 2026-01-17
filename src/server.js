#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import SupermemoryClient from './supermemory-client.js';

class SupermemoryMCPServer {
  constructor() {
    this.supermemory = new SupermemoryClient();

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

      if (!this.supermemory.isReady()) {
        return {
          content: [
            {
              type: "text",
              text: `🔍 Búsqueda simulada para "${query}":\n\n📝 **Resultado de Prueba**\nInformación relacionada con: ${query}\n🏷️ Tags: búsqueda, simulado\n\n⚠️ *API de Supermemory no configurada. Configure SUPERMEMORY_API_KEY para funcionalidad completa.*`
            }
          ]
        };
      }

      const results = await this.supermemory.searchMemory(query, user_id, limit);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `🔍 No se encontraron resultados para "${query}" en la memoria del equipo.`
            }
          ]
        };
      }

      const formattedResults = results.map(result =>
        `📝 **${result.title}**\n${result.content}\n🏷️ Tags: ${result.tags.join(", ") || "sin tags"}\n📊 Relevancia: ${(result.score * 100).toFixed(1)}%`
      ).join("\n\n");

      return {
        content: [
          {
            type: "text",
            text: `🔍 Resultados de búsqueda para "${query}":\n\n${formattedResults}`
          }
        ]
      };
    } catch (error) {
      console.error('Search error:', error);
      throw new McpError(
        ErrorCode.InternalError,
        `Error al buscar memoria: ${error.message}`
      );
    }
  }

  async storeTeamMemory(args) {
    try {
      const { content, title, tags = [], user_id } = args;

      if (!this.supermemory.isReady()) {
        // Modo simulado cuando no hay API key
        const memoryId = `mem_${Date.now()}`;

        return {
          content: [
            {
              type: "text",
              text: `✅ Memoria almacenada exitosamente (simulado)!\n\n📝 **${title}**\n${content}\n🏷️ Tags: ${tags.join(", ") || "sin tags"}\n🆔 ID: ${memoryId}\n\n⚠️ *API de Supermemory no configurada. Configure SUPERMEMORY_API_KEY para persistencia real.*`
            }
          ]
        };
      }

      // Almacenamiento real con Supermemory API
      const result = await this.supermemory.storeMemory(content, title, tags, user_id);

      return {
        content: [
          {
            type: "text",
            text: `✅ Memoria almacenada exitosamente!\n\n📝 **${title}**\n${content}\n🏷️ Tags: ${tags.join(", ") || "sin tags"}\n🆔 ID: ${result.id}\n\n💾 Memoria persistente guardada en Supermemory.`
          }
        ]
      };
    } catch (error) {
      console.error('Storage error:', error);
      throw new McpError(
        ErrorCode.InternalError,
        `Error al almacenar memoria: ${error.message}`
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