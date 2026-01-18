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
   * Transforma el contenido para usar el nombre del usuario en lugar de términos genéricos
   * @param {string} text - Texto a transformar
   * @param {string} userName - Nombre del usuario
   * @returns {string} Texto transformado
   */
  personalizeContent(text, userName) {
    if (!userName) return text;

    let result = text;

    // Proteger el nombre del usuario si ya está mencionado
    const userNameRegex = new RegExp(`\\b${userName}\\b`, 'gi');
    result = result.replace(userNameRegex, `@@PROTECTED_NAME@@`);

    // Reemplazos usando placeholders temporales para evitar conflictos

    // 1. Frases específicas primero
    result = result
      .replace(/\bme gusta\b/gi, `@@PERSONAL_GUSTA@@`)
      .replace(/\bme gustan\b/gi, `@@PERSONAL_GUSTAN@@`)
      .replace(/\bme encanta\b/gi, `@@PERSONAL_ENCANTA@@`)
      .replace(/\bme encantan\b/gi, `@@PERSONAL_ENCHANTAN@@`)
      .replace(/\bI love\b/gi, `@@ENGLISH_LOVE@@`)
      .replace(/\bI like\b/gi, `@@ENGLISH_LIKE@@`)
      .replace(/\bI prefer\b/gi, `@@ENGLISH_PREFER@@`);

    // 2. Procesar pronombres primero (estos agregan el nombre del usuario)
    result = result
      .replace(/\byo\b/gi, `@@YO@@`)
      .replace(/\bmi\b/gi, `@@MI@@`)
      .replace(/\bme\b/gi, `@@ME@@`);

    // 3. Procesar verbos que necesitan conjugación (solo si no están precedidos por frases ya procesadas)
    result = result
      .replace(/\bprefiero\b/gi, `@@PREFIERO@@`)
      .replace(/\bsoy\b/gi, `@@SOY@@`)
      .replace(/\bvivo\b/gi, `@@VIVO@@`)
      .replace(/\btrabajo\b/gi, `@@TRABAJO@@`)
      .replace(/\bcomo\b/gi, `@@COMO@@`)
      .replace(/\bamo\b/gi, `@@AMO@@`);

    // 4. Primera persona en inglés
    result = result
      .replace(/\bI'm\b/gi, `@@ENGLISH_IM@@`)
      .replace(/\bI\b/gi, `@@ENGLISH_I@@`)
      .replace(/\bmy\b/gi, `@@ENGLISH_MY@@`)
      .replace(/\bmine\b/gi, `@@ENGLISH_MINE@@`);

    // 5. Términos genéricos
    result = result
      .replace(/\bal usuario\b/gi, `@@AL_USUARIO@@`)
      .replace(/\bel usuario\b/gi, `@@EL_USUARIO@@`)
      .replace(/\bla usuario\b/gi, `@@LA_USUARIO@@`)
      .replace(/\blos usuarios\b/gi, `@@LOS_USUARIOS@@`)
      .replace(/\blas usuarios\b/gi, `@@LAS_USUARIOS@@`);

    // Ahora reemplazar todos los placeholders
    // Los pronombres agregan el nombre del usuario
    result = result
      .replace(/@@YO@@/g, `${userName}`)
      .replace(/@@MI@@/g, `de ${userName}`)
      .replace(/@@ME@@/g, `a ${userName}`);

    // Los verbos se conjugan en tercera persona (sin nombre, porque ya viene del pronombre)
    result = result
      .replace(/@@PREFIERO@@/g, `prefiere`)
      .replace(/@@SOY@@/g, `es`)
      .replace(/@@VIVO@@/g, `vive`)
      .replace(/@@TRABAJO@@/g, `trabaja`)
      .replace(/@@COMO@@/g, `come`)
      .replace(/@@AMO@@/g, `ama`);

    // Frases completas ya incluyen el nombre
    result = result
      .replace(/@@PERSONAL_GUSTA@@/g, `a ${userName} le gusta`)
      .replace(/@@PERSONAL_GUSTAN@@/g, `a ${userName} le gustan`)
      .replace(/@@PERSONAL_ENCANTA@@/g, `a ${userName} encanta`)
      .replace(/@@PERSONAL_ENCHANTAN@@/g, `a ${userName} encantan`)
      .replace(/@@ENGLISH_LOVE@@/g, `${userName} loves`)
      .replace(/@@ENGLISH_LIKE@@/g, `${userName} likes`)
      .replace(/@@ENGLISH_PREFER@@/g, `${userName} prefers`)
      .replace(/@@ENGLISH_IM@@/g, `${userName} is`)
      .replace(/@@ENGLISH_I@@/g, `${userName}`)
      .replace(/@@ENGLISH_MY@@/g, `${userName}'s`)
      .replace(/@@ENGLISH_MINE@@/g, `${userName}'s`)
      .replace(/@@AL_USUARIO@@/g, `a ${userName}`)
      .replace(/@@EL_USUARIO@@/g, `${userName}`)
      .replace(/@@LA_USUARIO@@/g, `a ${userName}`)
      .replace(/@@LOS_USUARIOS@@/g, `${userName}`)
      .replace(/@@LAS_USUARIOS@@/g, `a ${userName}`);

    // Restaurar el nombre protegido
    result = result.replace(/@@PROTECTED_NAME@@/g, userName);

    return result;
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
      // Personalizar automáticamente el contenido y título con el nombre del usuario
      const personalizedContent = this.personalizeContent(content, this.defaultUserId);
      const personalizedTitle = this.personalizeContent(title, this.defaultUserId);

      const conversationData = {
        conversationId: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        messages: [
          {
            role: 'user',
            content: `${personalizedTitle}: ${personalizedContent}`,
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