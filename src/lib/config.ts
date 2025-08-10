// Configuration management for API keys and validation
export interface ConfigValidation {
  isValid: boolean;
  error?: string;
}

export interface AllKeysValidation {
  openai: ConfigValidation;
  rapidapi: ConfigValidation;
  allValid: boolean;
}

// Server-side only validation (no frontend API keys)
export const configManager = {
  validateOpenAIKey(): ConfigValidation {
    // Frontend should not have access to API keys
    return {
      isValid: false,
      error: 'API keys are server-side only for security'
    };
  },

  validateRapidAPIKey(): ConfigValidation {
    // Frontend should not have access to API keys
    return {
      isValid: false,
      error: 'API keys are server-side only for security'
    };
  },

  validateAllKeys(): AllKeysValidation {
    return {
      openai: this.validateOpenAIKey(),
      rapidapi: this.validateRapidAPIKey(),
      allValid: false
    };
  }
};

// Environment variables for frontend (non-sensitive)
export const frontendConfig = {
  customDomain: import.meta.env.VITE_CUSTOM_DOMAIN || ''
}; 