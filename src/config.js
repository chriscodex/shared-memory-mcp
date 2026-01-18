// Load environment variables first
import { config } from 'dotenv';
config();

// Export configuration
export const env = {
  supermemoryApiKey: process.env.SUPERMEMORY_API_KEY,
  baseUrl: process.env.SUPERMEMORY_BASE_URL || 'https://api.supermemory.ai/v4',
  language: process.env.LANGUAGE || 'en',
  defaultUserId: process.env.DEFAULT_USER_ID || 'user'
};