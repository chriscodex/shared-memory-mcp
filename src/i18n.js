import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class I18n {
  constructor() {
    this.language = env.language || 'en'; // Use centralized config, default to English
    this.translations = {};
    this.loadTranslations();
  }

  loadTranslations() {
    const localesPath = path.join(__dirname, '..', 'locales');

    try {
      // Check if locales directory exists
      if (!fs.existsSync(localesPath)) {
        console.warn('Locales directory not found, using default English translations');
        this.translations = this.getDefaultEnglishTranslations();
        return;
      }

      // Load English translations (only supported language)
      const enFilePath = path.join(localesPath, 'en.json');
      if (fs.existsSync(enFilePath)) {
        this.translations.en = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
      } else {
        console.warn('English translation file not found, using defaults');
        this.translations = this.getDefaultEnglishTranslations();
      }

      // Force language to English
      this.language = 'en';

    } catch (error) {
      console.warn('Error loading translations, using defaults:', error.message);
      this.translations = this.getDefaultEnglishTranslations();
    }
  }

  getDefaultEnglishTranslations() {
    return {
      en: {
        "user_saved": "User {user} saved:",
        "search_results": "Search Results",
        "no_results": "No results found",
        "api_key_not_configured": "Supermemory API key not configured."
      }
    };
  }

  t(key, variables = {}) {
    // Get translation or fallback to key
    const translation = this.translations[this.language]?.[key] || key;

    // Replace variables {user}, {title}, etc.
    return Object.keys(variables).reduce((text, varName) => {
      return text.replace(new RegExp(`{${varName}}`, 'g'), variables[varName]);
    }, translation);
  }

  // Get current language
  getCurrentLanguage() {
    return this.language;
  }

  // Check if language is supported
  isLanguageSupported(lang) {
    return this.translations[lang] !== undefined;
  }

  // Get available languages
  getAvailableLanguages() {
    return Object.keys(this.translations);
  }
}

// Export singleton instance
export default new I18n();