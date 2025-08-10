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

// Input sanitization helpers
// These are intentionally conservative to avoid altering semantics used by the backend

// Remove zero-width and control characters, trim whitespace
export const sanitizeBasic = (value: string): string => {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001F\u007F\u200B-\u200D\uFEFF]/g, '')
    .trim();
};

// Strip trailing slashes from URLs (without touching query/hash)
export const stripTrailingSlash = (value: string): string => {
  if (!value) return value;
  try {
    const url = new URL(value);
    url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString();
  } catch {
    // Not a URL, return as-is
    return value.replace(/\s+$/, '');
  }
};

// Normalize handles or URLs per platform without changing backend expectations
export const sanitizePlatformInput = (value: string, platform: string): string => {
  const v = sanitizeBasic(value);
  if (!v) return v;

  // If it looks like a URL, only strip trailing slashes
  if (/^https?:\/\//i.test(v)) {
    return stripTrailingSlash(v);
  }

  switch (platform.toLowerCase()) {
    case 'twitter':
    case 'instagram':
      // Collapse inner spaces, keep leading @ if provided
      return v.replace(/\s+/g, '');
    case 'youtube':
      // Accept @handle or channel name; collapse spaces
      return v.replace(/\s+/g, '');
    default:
      return v;
  }
};

export type PlatformInputs = {
  twitter?: string;
  instagram?: string;
  youtube?: string;
};

export const sanitizeAllInputs = (inputs: PlatformInputs): PlatformInputs => {
  return {
    twitter: inputs.twitter ? sanitizePlatformInput(inputs.twitter, 'twitter') : '',
    instagram: inputs.instagram ? sanitizePlatformInput(inputs.instagram, 'instagram') : '',
    youtube: inputs.youtube ? sanitizePlatformInput(inputs.youtube, 'youtube') : '',
  };
};