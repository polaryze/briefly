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
  },
  
  {
    id: 'sample1',
    name: 'Professional Business',
    description: 'Clean, professional design perfect for business newsletters with social media integration',
    style: 'classic',
    preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
    htmlPath: '/example_newsletters/newslettersample1/1.html',
    enabled: false
  },
  
  {
    id: 'sample2', 
    name: 'Modern Tech',
    description: 'Contemporary design with clean typography ideal for tech and startup newsletters',
    style: 'modern',
    preview: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop',
    htmlPath: '/example_newsletters/newslettersample2/2.html',
    enabled: false
  },
  
  {
    id: 'sample3',
    name: 'Creative Lifestyle', 
    description: 'Vibrant, engaging design perfect for lifestyle and creative industry newsletters',
    style: 'creative',
    preview: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=200&fit=crop',
    htmlPath: '/example_newsletters/newslettersample3/3.html',
    enabled: false
  },
  
  {
    id: 'sample4',
    name: 'Minimal Elegant',
    description: 'Clean, minimal design with elegant typography for sophisticated content',
    style: 'minimal', 
    preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=200&fit=crop',
    htmlPath: '/example_newsletters/newslettersample4/4.html',
    enabled: false
  },
  
  {
    id: 'sample5',
    name: 'Sectioned Newsletter',
    description: 'Advanced template with 5 distinct sections for targeted content generation',
    style: 'modern',
    preview: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=200&fit=crop',
    htmlPath: '/example_newsletters/newslettersample5/5.html',
    enabled: false
  }
];

// Helper function to get template by ID
export function getTemplateById(id: string): NewsletterTemplate | undefined {
  console.log('🔍 Looking for template with ID:', id);
  const template = NEWSLETTER_TEMPLATES.find(template => template.id === id);
  console.log('📋 Template found:', template ? template.name : 'Not found');
  return template;
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
export async function loadTemplateHTML(template: NewsletterTemplate): Promise<string> {
  console.log('📄 Loading template HTML:', template.htmlPath);
  console.log('📄 Template name:', template.name);
  console.log('📄 Current URL:', window.location.href);
  console.log('📄 Base URL:', window.location.origin);
  
  try {
    // Try to load the template
    const fullUrl = `${window.location.origin}${template.htmlPath}`;
    console.log('📄 Full URL:', fullUrl);
    
    const response = await fetch(template.htmlPath);
    console.log('📄 Response status:', response.status);
    console.log('📄 Response ok:', response.ok);
    
    if (!response.ok) {
      console.error('❌ Template loading failed:', response.status, response.statusText);
      throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
    }
    
    const htmlContent = await response.text();
    console.log('✅ Template loaded successfully, length:', htmlContent.length);
    console.log('✅ First 200 characters:', htmlContent.substring(0, 200));
    
    return htmlContent;
  } catch (error) {
    console.error('❌ Error loading template HTML:', error);
    console.error('❌ Template path:', template.htmlPath);
    console.error('❌ Template name:', template.name);
    
    // Provide more specific error messages
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error loading template ${template.name}. Check if the file exists at ${template.htmlPath}`);
    }
    
    throw new Error(`Failed to load template ${template.name}: ${error.message}`);
  }
}

// Test function to verify template loading
export async function testTemplateLoading(): Promise<void> {
  console.log('🧪 Testing template loading...');
  
  const enabledTemplates = getEnabledTemplates();
  console.log('🧪 Enabled templates:', enabledTemplates.map(t => t.name));
  
  for (const template of enabledTemplates) {
    console.log(`🧪 Testing template: ${template.name}`);
    try {
      const html = await loadTemplateHTML(template);
      console.log(`✅ Template ${template.name} loaded successfully (${html.length} chars)`);
    } catch (error) {
      console.error(`❌ Template ${template.name} failed to load:`, error);
    }
  }
} 