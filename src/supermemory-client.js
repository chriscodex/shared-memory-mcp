import fetch from 'node-fetch';
import i18n from './i18n.js';
import { env } from './config.js';

class SupermemoryClient {
  constructor() {
    this.apiKey = env.supermemoryApiKey;
    this.baseUrl = env.baseUrl;
    this.defaultUserId = env.defaultUserId;
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
      throw new Error(i18n.t('api_key_not_configured'));
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
      console.error(i18n.t('search_error', { error: error.message }));
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
    return `${i18n.t('user_saved', { user: userName })} ${content}`;
  }

  /**
   * Almacena información en la memoria del equipo
   * @param {string} content - El contenido a almacenar
   * @param {string} title - Título descriptivo
   * @param {string[]} tags - Tags para categorización
   */
  async storeMemory(content, title, tags = []) {
    if (!this.isReady()) {
      throw new Error(i18n.t('api_key_not_configured'));
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
      console.error(i18n.t('storage_error', { error: error.message }));
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