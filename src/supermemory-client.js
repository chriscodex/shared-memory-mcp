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
   * Consulta el perfil de usuario para obtener preferencias y hechos
   * @param {string} userId - ID del usuario (opcional, usa default si no se especifica)
   */
  async getUserProfile(userId = null) {
    if (!this.isReady()) {
      throw new Error('Supermemory API key not configured. Please set SUPERMEMORY_API_KEY environment variable.');
    }

    try {
      const profileData = {
        containerTag: userId || this.defaultUserId
      };

      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.formatProfileResults(data);
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Formatea los resultados del perfil de usuario
   */
  formatProfileResults(profileData) {
    const profile = profileData.profile || {};
    const staticFacts = profile.static || [];
    const dynamicFacts = profile.dynamic || [];

    return {
      static: staticFacts,
      dynamic: dynamicFacts,
      hasPreferences: staticFacts.length > 0 || dynamicFacts.length > 0
    };
  }

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
   * Transforma el contenido para usar el nombre del usuario en lugar de términos genéricos
   * @param {string} text - Texto a transformar
   * @param {string} userName - Nombre del usuario
   * @returns {string} Texto transformado
   */
  personalizeContent(text, userName) {
    if (!userName) return text;

    let personalized = text;

    // Reemplazos para términos genéricos en español
    personalized = personalized
      .replace(/\bal usuario\b/gi, `a ${userName}`)
      .replace(/\bel usuario\b/gi, `${userName}`)
      .replace(/\bla usuario\b/gi, `a ${userName}`)
      .replace(/\blos usuarios\b/gi, `${userName}`)
      .replace(/\blas usuarios\b/gi, `a ${userName}`)
      // Reemplazos para primera persona en español
      .replace(/\bme\b/gi, `a ${userName}`)
      .replace(/\bmi\b/gi, `de ${userName}`)
      .replace(/\bsoy\b/gi, `${userName} es`)
      .replace(/\bme gusta\b/gi, `a ${userName} le gusta`)
      .replace(/\bme gustan\b/gi, `a ${userName} le gustan`)
      .replace(/\bprefiero\b/gi, `${userName} prefiere`)
      .replace(/\bme llamo\b/gi, `se llama ${userName}`)
      // Evitar reemplazos problemáticos - si ya menciona el nombre del usuario, no cambiar
      .replace(new RegExp(`\\b${userName}\\b`, 'gi'), userName); // Mantener el nombre como está

    // Reemplazos para primera persona en inglés
    personalized = personalized
      .replace(/\bI\b/gi, `${userName}`)
      .replace(/\bmy\b/gi, `${userName}'s`)
      .replace(/\bmine\b/gi, `${userName}'s`)
      .replace(/\bI'm\b/gi, `${userName} is`);

    // Reemplazo final para "yo" en español (después de los otros para evitar conflictos)
    personalized = personalized.replace(/\byo\b/gi, `${userName}`);

    return personalized;
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
      // Personalizar el contenido antes de guardar
      const personalizedContent = this.personalizeContent(content, this.defaultUserId);
      const personalizedTitle = this.personalizeContent(title, this.defaultUserId);

      const documentData = {
        content: `${personalizedTitle}: ${personalizedContent}`,
        containerTags: [this.defaultUserId],
        customId: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          author: this.defaultUserId,
          author_name: this.defaultUserId,
          created_by: this.defaultUserId,
          source: 'mcp-team-memory'
        }
      };

      // Usar endpoint de memorias directamente para búsqueda inmediata
      const memoryData = {
        content: `${title}: ${content}`,
        containerTags: [this.defaultUserId],
        metadata: {
          author: this.defaultUserId,
          author_name: this.defaultUserId,
          created_by: this.defaultUserId,
          source: 'mcp-team-memory',
          title: title
        }
      };

      const response = await fetch(`${this.baseUrl.replace('v4', 'v3')}/memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(memoryData),
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