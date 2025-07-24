export interface NewsletterTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  htmlPath: string;
  style: 'modern' | 'classic' | 'minimal' | 'creative';
}

export const NEWSLETTER_TEMPLATES: NewsletterTemplate[] = [
  {
    id: 'sample1',
    name: 'Professional Business',
    description: 'Clean, professional design perfect for business newsletters with social media integration',
    style: 'classic',
    preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
    htmlPath: '/example_newsletters/newslettersample1/1.html'
  },
  
  {
    id: 'sample2', 
    name: 'Modern Tech',
    description: 'Contemporary design with clean typography ideal for tech and startup newsletters',
    style: 'modern',
    preview: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop',
    htmlPath: '/example_newsletters/newslettersample2/2.html'
  },
  
  {
    id: 'sample3',
    name: 'Creative Lifestyle', 
    description: 'Vibrant, engaging design perfect for lifestyle and creative industry newsletters',
    style: 'creative',
    preview: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=200&fit=crop',
    htmlPath: '/example_newsletters/newslettersample3/3.html'
  },
  
  {
    id: 'sample4',
    name: 'Minimal Elegant',
    description: 'Clean, minimal design with elegant typography for sophisticated content',
    style: 'minimal', 
    preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=200&fit=crop',
    htmlPath: '/example_newsletters/newslettersample4/4.html'
  },
  
  {
    id: 'sample5',
    name: 'Sectioned Newsletter',
    description: 'Advanced template with 5 distinct sections for targeted content generation',
    style: 'modern',
    preview: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=200&fit=crop',
    htmlPath: '/example_newsletters/newslettersample5/5.html'
  }
];

// Helper function to get template by ID
export function getTemplateById(id: string): NewsletterTemplate | undefined {
  console.log('🔍 Looking for template with ID:', id);
  const template = NEWSLETTER_TEMPLATES.find(template => template.id === id);
  console.log('📋 Template found:', template ? template.name : 'Not found');
  return template;
}

// Helper function to get templates by style
export function getTemplatesByStyle(style: string): NewsletterTemplate[] {
  return NEWSLETTER_TEMPLATES.filter(template => template.style === style);
}

// Function to load template HTML content
export async function loadTemplateHTML(template: NewsletterTemplate): Promise<string> {
  try {
    const response = await fetch(template.htmlPath);
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading template HTML:', error);
    throw new Error(`Failed to load template ${template.name}`);
  }
} 