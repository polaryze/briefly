export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateUrl = (url: string): ValidationResult => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    const urlObj = new URL(url);
    const validProtocols = ['http:', 'https:'];
    
    if (!validProtocols.includes(urlObj.protocol)) {
      return { isValid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

export const validateYouTubeUrl = (url: string): ValidationResult => {
  const urlValidation = validateUrl(url);
  if (!urlValidation.isValid) {
    return urlValidation;
  }

  const youtubePatterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/
  ];

  const isValidYouTubeUrl = youtubePatterns.some(pattern => pattern.test(url));
  
  if (!isValidYouTubeUrl) {
    return { isValid: false, error: 'Invalid YouTube URL format' };
  }

  return { isValid: true };
};

export const validateSocialMediaUrl = (url: string, platform: string): ValidationResult => {
  const urlValidation = validateUrl(url);
  if (!urlValidation.isValid) {
    return urlValidation;
  }

  const patterns: Record<string, RegExp> = {
    linkedin: /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+/,
    twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[\w-]+/,
    instagram: /^https?:\/\/(www\.)?instagram\.com\/[\w-]+/
  };

  const pattern = patterns[platform.toLowerCase()];
  if (!pattern) {
    return { isValid: false, error: `Unsupported platform: ${platform}` };
  }

  if (!pattern.test(url)) {
    return { isValid: false, error: `Invalid ${platform} URL format` };
  }

  return { isValid: true };
};

export const validateUsername = (username: string, platform: string): ValidationResult => {
  if (!username || typeof username !== 'string') {
    return { isValid: false, error: 'Username is required' };
  }

  const trimmedUsername = username.trim();
  if (trimmedUsername.length === 0) {
    return { isValid: false, error: 'Username cannot be empty' };
  }

  if (trimmedUsername.length > 50) {
    return { isValid: false, error: 'Username is too long (max 50 characters)' };
  }

  // Platform-specific validation
  const patterns: Record<string, RegExp> = {
    twitter: /^@?[\w-]{1,15}$/,
    instagram: /^@?[\w-]{1,30}$/,
    linkedin: /^[\w-]+$/,
    youtube: /^[\w-]+$/
  };

  const pattern = patterns[platform.toLowerCase()];
  if (pattern && !pattern.test(trimmedUsername)) {
    return { isValid: false, error: `Invalid ${platform} username format` };
  }

  return { isValid: true };
};

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} cannot be empty` };
  }

  return { isValid: true };
};

export const validateEmail = (email: string): ValidationResult => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
}; 