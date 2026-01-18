import fetch from 'node-fetch';
import { env } from './config.js';
import i18n from './i18n.js';

class SupermemoryClient {
  constructor() {
    this.apiKey = env.supermemoryApiKey;
    this.baseUrl = env.baseUrl;
    this.defaultUserId = env.defaultUserId;
    this.isConfigured = Boolean(this.apiKey);
  }

  /**
   * Checks if the client is configured correctly
   */
  isReady() {
    return this.isConfigured;
  }

  /**
   * Searches team memory
   * @param {string} query - The search query
   * @param {number} limit - Maximum number of results (default: 5)
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
   * Formats content by adding information about the user saving it
   * @param {string} content - Original content
   * @param {string} userName - User name
   * @returns {string} Formatted content
   */
  formatUserContent(content, userName) {
    if (!userName) return content;
    return `${i18n.t('user_saved', { user: userName })} ${content}`;
  }

  /**
   * Stores information in team memory
   * @param {string} content - The content to store
   * @param {string} title - Descriptive title
   * @param {string[]} tags - Tags for categorization
   */
  async storeMemory(content, title, tags = []) {
    if (!this.isReady()) {
      throw new Error(i18n.t('api_key_not_configured'));
    }

    try {
      // Format content with user information
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
   * Formats search results for MCP format
   */
  formatSearchResults(apiResponse) {
    const results = apiResponse.results || [];

    return results.map(result => ({
      id: result.id || `mem_${Date.now()}`,
      content: result.memory || result.chunk || '',
      title: result.metadata?.title || 'Untitled',
      score: result.similarity || result.score || 0,
      tags: result.metadata?.tags || [],
      created_at: result.updatedAt || new Date().toISOString()
    }));
  }

  /**
   * Formats storage result for MCP format
   */
  formatStoreResult(apiResponse) {
    return {
      id: apiResponse.id || apiResponse.conversationId || `mem_${Date.now()}`,
      success: true,
      message: 'Memory stored successfully'
    };
  }

  /**
   * Gets API usage statistics
   */
  async getUsageStats() {
    if (!this.isReady()) {
      return { configured: false };
    }

    try {
      // Implement when API supports it
      return {
        configured: true,
        // Add real statistics when available
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return { configured: true, error: error.message };
    }
  }
}

export default SupermemoryClient;