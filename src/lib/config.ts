interface ApiConfig {
  openai: string;
  rapidapi: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

class ConfigManager {
  private config: ApiConfig;

  constructor() {
    this.config = {
      openai: import.meta.env.VITE_OPENAI_API_KEY || '',
      rapidapi: import.meta.env.VITE_RAPIDAPI_KEY || ''
    };
  }

  getOpenAIKey(): string {
    return this.config.openai;
  }

  getRapidAPIKey(): string {
    return this.config.rapidapi;
  }

  validateOpenAIKey(): ValidationResult {
    const key = this.config.openai;
    
    if (!key || key.trim() === '') {
      return {
        isValid: false,
        error: 'OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your environment variables.'
      };
    }

    if (!key.startsWith('sk-')) {
      return {
        isValid: false,
        error: 'Invalid OpenAI API key format. Key should start with "sk-".'
      };
    }

    return { isValid: true };
  }

  validateRapidAPIKey(): ValidationResult {
    const key = this.config.rapidapi;
    
    if (!key || key.trim() === '' || key === 'your_rapidapi_key') {
      return {
        isValid: false,
        error: 'RapidAPI key not configured. Please set VITE_RAPIDAPI_KEY in your environment variables.'
      };
    }

    // Basic validation - RapidAPI keys are typically 50+ characters
    if (key.length < 20) {
      return {
        isValid: false,
        error: 'Invalid RapidAPI key format. Key appears to be too short.'
      };
    }

    return { isValid: true };
  }

  validateAllKeys(): ValidationResult {
    const openaiValidation = this.validateOpenAIKey();
    const rapidapiValidation = this.validateRapidAPIKey();

    if (!openaiValidation.isValid) {
      return openaiValidation;
    }

    if (!rapidapiValidation.isValid) {
      return rapidapiValidation;
    }

    return { isValid: true };
  }

  // Security check - ensure no API keys are accidentally logged
  getSafeConfig(): object {
    return {
      openai: this.config.openai ? `${this.config.openai.substring(0, 7)}...` : 'not configured',
      rapidapi: this.config.rapidapi ? `${this.config.rapidapi.substring(0, 7)}...` : 'not configured'
    };
  }
}

// Singleton instance
export const configManager = new ConfigManager();

// Helper functions for backward compatibility
export const getOpenAIKey = () => configManager.getOpenAIKey();
export const getRapidAPIKey = () => configManager.getRapidAPIKey();
export const validateApiKeys = () => configManager.validateAllKeys(); 