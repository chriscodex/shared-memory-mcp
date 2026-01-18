import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class I18n {
  constructor() {
    this.language = env.language; // Use centralized config
    this.translations = {};
    this.loadTranslations();
  }

  loadTranslations() {
    const localesPath = path.join(__dirname, '..', 'locales');

    try {
      // Check if locales directory exists
      if (!fs.existsSync(localesPath)) {
        console.warn('Locales directory not found, using default Spanish translations');
        this.translations = this.getDefaultSpanishTranslations();
        return;
      }

      const files = fs.readdirSync(localesPath);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const lang = file.replace('.json', '');
          const filePath = path.join(localesPath, file);

          try {
            this.translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          } catch (error) {
            console.warn(`Error loading translation file ${file}:`, error.message);
          }
        }
      });

      // Fallback to Spanish if current language not found
      if (!this.translations[this.language]) {
        console.warn(`Language '${this.language}' not found, falling back to Spanish`);
        this.language = 'es';
      }

    } catch (error) {
      console.warn('Error loading translations, using defaults:', error.message);
      this.translations = this.getDefaultSpanishTranslations();
    }
  }

  getDefaultSpanishTranslations() {
    return {
      es: {
        "user_saved": "El usuario {user} ha guardado:",
        "search_results": "Resultados de búsqueda",
        "no_results": "No se encontraron resultados",
        "api_key_not_configured": "Clave API de Supermemory no configurada."
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