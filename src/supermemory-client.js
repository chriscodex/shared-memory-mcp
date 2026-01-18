import fetch from 'node-fetch';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

class SupermemoryClient {
  constructor() {
    this.apiKey = process.env.SUPERMEMORY_API_KEY;
    this.baseUrl = process.env.SUPERMEMORY_BASE_URL || 'https://api.supermemory.ai/v4';
    this.defaultUserId = process.env.DEFAULT_USER_ID || 'user';
    this.isConfigured = Boolean(this.apiKey);
  }

  /**
   * Verifica si el cliente está configurado correctamente
   */
  isReady() {
    return this.isConfigured;
  }

  /**
   * Busca en la memoria del equipo
   * @param {string} query - La consulta de búsqueda
   * @param {number} limit - Número máximo de resultados (default: 5)
   */
  async searchMemory(query, limit = 5) {
    if (!this.isReady()) {
      throw new Error('Supermemory API key not configured. Please set SUPERMEMORY_API_KEY environment variable.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          q: query,
          containerTag: this.defaultUserId,
          limit,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.formatSearchResults(data);
    } catch (error) {
      console.error('Error searching memory:', error);
      throw error;
    }
  }

  /**
   * Formatea el contenido agregando información del usuario que lo guarda
   * @param {string} content - Contenido original
   * @param {string} userName - Nombre del usuario
   * @returns {string} Contenido formateado
   */
  formatUserContent(content, userName) {
    if (!userName) return content;
    return `El usuario ${userName} ha guardado: ${content}`;
  }

  /**
   * Almacena información en la memoria del equipo
   * @param {string} content - El contenido a almacenar
   * @param {string} title - Título descriptivo
   * @param {string[]} tags - Tags para categorización
   */
  async storeMemory(content, title, tags = []) {
    if (!this.isReady()) {
      throw new Error('Supermemory API key not configured. Please set SUPERMEMORY_API_KEY environment variable.');
    }

    try {
      // Formatear el contenido con información del usuario
      const formattedContent = this.formatUserContent(content, this.defaultUserId);

      const conversationData = {
        conversationId: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        messages: [
          {
            role: 'user',
            content: `${title} - ${formattedContent}`,
          }
        ],
        containerTags: [this.defaultUserId]
      };

      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(conversationData),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.formatStoreResult(data);
    } catch (error) {
      console.error('Error storing memory:', error);
      throw error;
    }
  }

  /**
   * Formatea los resultados de búsqueda para el formato MCP
   */
  formatSearchResults(apiResponse) {
    const results = apiResponse.results || [];

    return results.map(result => ({
      id: result.id || `mem_${Date.now()}`,
      content: result.memory || result.chunk || '',
      title: result.metadata?.title || 'Sin título',
      score: result.similarity || result.score || 0,
      tags: result.metadata?.tags || [],
      created_at: result.updatedAt || new Date().toISOString()
    }));
  }

  /**
   * Formatea el resultado de almacenamiento para el formato MCP
   */
  formatStoreResult(apiResponse) {
    return {
      id: apiResponse.id || apiResponse.conversationId || `mem_${Date.now()}`,
      success: true,
      message: 'Memory stored successfully'
    };
  }

  /**
   * Obtiene estadísticas de uso de la API
   */
  async getUsageStats() {
    if (!this.isReady()) {
      return { configured: false };
    }

    try {
      // Implementar cuando la API lo soporte
      return {
        configured: true,
        // Agregar estadísticas reales cuando estén disponibles
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return { configured: true, error: error.message };
    }
  }
}

export default SupermemoryClient;