export interface NewsletterTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  htmlPath: string;
  style: 'modern' | 'classic' | 'minimal' | 'creative';
  enabled: boolean;
}

export const NEWSLETTER_TEMPLATES: NewsletterTemplate[] = [
  {
    id: 'cleaned_newsletter',
    name: 'Cleaned Newsletter',
    description: 'Modern newsletter template with dedicated sections for YouTube, X, Instagram, and image collage',
    style: 'modern',
    preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
    htmlPath: '/example_newsletters/newslettersample6/cleaned_newsletter.html',
    enabled: true
  }
];

// Helper function to get template by ID
export function getTemplateById(id: string) {
  const template = NEWSLETTER_TEMPLATES.find(t => t.id === id);
  return template || null;
}

// Helper function to get enabled templates only
export function getEnabledTemplates(): NewsletterTemplate[] {
  return NEWSLETTER_TEMPLATES.filter(template => template.enabled);
}

// Helper function to get templates by style
export function getTemplatesByStyle(style: string): NewsletterTemplate[] {
  return NEWSLETTER_TEMPLATES.filter(template => template.style === style && template.enabled);
}

// Function to load template HTML content
export async function loadTemplateHTML(template: any): Promise<string> {
  if (!template || !template.htmlPath) {
    throw new Error('Invalid template or missing HTML path');
  }

    const fullUrl = `${window.location.origin}${template.htmlPath}`;
  
  try {
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
    }
    
    const htmlContent = await response.text();
    return htmlContent;
  } catch (error) {
    throw new Error(`Error loading template HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Test function to verify template loading
export async function testTemplateLoading(): Promise<void> {
  const enabledTemplates = NEWSLETTER_TEMPLATES.filter(t => t.enabled);
  
  for (const template of enabledTemplates) {
    try {
      const html = await loadTemplateHTML(template);
      // Silent success - no logging
    } catch (error) {
      // Silent error - no logging
    }
  }
} 