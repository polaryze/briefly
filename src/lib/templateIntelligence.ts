// Template Intelligence System
// Analyzes newsletter templates and provides smart editing context

export interface EditableElement {
  selector: string;
  type: 'text' | 'image' | 'link' | 'date' | 'number';
  description: string;
  context: string;
  examples?: string[];
}

export interface TemplateSection {
  name: string;
  description: string;
  elements: EditableElement[];
  cssSelectors: string[];
}

export interface TemplateProfile {
  id: string;
  name: string;
  description: string;
  style: 'modern' | 'classic' | 'minimal' | 'creative';
  maxWidth: string;
  sections: TemplateSection[];
  editableElements: EditableElement[];
  commonEditRequests: {
    [key: string]: {
      description: string;
      targets: string[];
      instructions: string;
    };
  };
}

// Template Profiles - Pre-analyzed newsletter structures
export const TEMPLATE_PROFILES: Record<string, TemplateProfile> = {
  sample1: {
    id: 'sample1',
    name: 'Professional Business',
    description: 'Clean, professional design perfect for business newsletters with social media integration',
    style: 'classic',
    maxWidth: '640px',
    sections: [
      {
        name: 'header',
        description: 'Newsletter header with logo and main title',
        cssSelectors: ['.row-2', '.icons_block'],
        elements: [
          {
            selector: 'img[src*="brand-logo"]',
            type: 'image',
            description: 'Company/brand logo',
            context: 'Main branding element at the top of newsletter'
          },
          {
            selector: 'h1, h2, h3, .title, .heading',
            type: 'text',
            description: 'Newsletter main title and headings',
            context: 'Primary newsletter headings and titles',
            examples: ['Weekly Updates', 'Company News', 'Social Roundup', 'September Course Selection Now Open']
          }
        ]
      },
      {
        name: 'socialPosts',
        description: 'Social media post sections with content and engagement',
        cssSelectors: ['.row-5', '.row-6', '.row-7'],
        elements: [
          {
            selector: 'img[src*="facebook-round-icon"], img[src*="instagram-round-icon"], img[src*="tiktok-round-icon"]',
            type: 'image',
            description: 'Platform icons',
            context: 'Social media platform indicators'
          },
          {
            selector: 'h3 span:contains("Brand name")',
            type: 'text',
            description: 'Brand/company names in posts',
            context: 'Company or person name in social posts',
            examples: ['Apple Inc.', 'Tesla', 'John Smith', 'TechCorp']
          },
          {
            selector: 'p:contains("Aug"), p:contains("12:20")',
            type: 'date',
            description: 'Post timestamps',
            context: 'When the social media posts were made',
            examples: ['Dec 15, 09:30', 'Jan 3, 14:45', 'Nov 28, 16:20']
          },
          {
            selector: 'p:contains("Lorem ipsum")',
            type: 'text',
            description: 'Post content text',
            context: 'Social media post text content',
            examples: ['Just launched our new product! 🚀', 'Excited to announce our partnership with...', 'Behind the scenes of our latest project']
          },
          {
            selector: 'img[src*="pexels"], img[src*="social-media-main"]',
            type: 'image',
            description: 'Post images',
            context: 'Social media post visual content'
          },
          {
            selector: 'a:contains("89"), a:contains("32"), a:contains("15")',
            type: 'number',
            description: 'Engagement stats (likes, comments, shares)',
            context: 'Social media engagement metrics',
            examples: ['156', '42', '28', '1.2k', '234']
          }
        ]
      },
      {
        name: 'ctaSection',
        description: 'Call-to-action and connection section',
        cssSelectors: ['.row-8', '.row-9'],
        elements: [
          {
            selector: 'h1:contains("Let\'s connect")',
            type: 'text',
            description: 'CTA heading',
            context: 'Call-to-action section title',
            examples: ['Join Our Community', 'Get Connected', 'Stay Updated']
          },
          {
            selector: 'span:contains("Join us now!")',
            type: 'text',
            description: 'CTA button text',
            context: 'Call-to-action button label',
            examples: ['Subscribe Now', 'Get Started', 'Learn More']
          }
        ]
      },
      {
        name: 'footer',
        description: 'Newsletter footer with social links and branding',
        cssSelectors: ['.row-10', '.row-11'],
        elements: [
          {
            selector: 'img[src*="facebook@2x"], img[src*="twitter@2x"], img[src*="instagram@2x"]',
            type: 'image',
            description: 'Social media icons',
            context: 'Footer social media links'
          },
          {
            selector: 'h3:contains("Social media")',
            type: 'text',
            description: 'Footer section title',
            context: 'Footer heading text',
            examples: ['Follow Us', 'Connect With Us', 'Social Links']
          },
          {
            selector: 'p:contains("Lorem ipsum dolor sit amet")',
            type: 'text',
            description: 'Footer description',
            context: 'Footer descriptive text',
            examples: ['Stay connected for the latest updates', 'Follow us on social media for more content']
          }
        ]
      }
    ],
    editableElements: [],
          commonEditRequests: {
        'change company name': {
          description: 'Update the brand/company name throughout the newsletter',
          targets: ['h3 span:contains("Brand name")', 'span.tinyMce-placeholder'],
          instructions: 'Replace all instances of "Brand name" with the new company name while maintaining styling'
        },
        'update post content': {
          description: 'Modify social media post text',
          targets: ['p:contains("Lorem ipsum")', 'div[style*="color:#393d47"] p'],
          instructions: 'Replace placeholder text with actual social media post content, keeping character limits reasonable'
        },
        'change engagement numbers': {
          description: 'Update likes, comments, shares counts',
          targets: ['a:contains("89")', 'a:contains("32")', 'a:contains("15")'],
          instructions: 'Update engagement metrics with realistic numbers that match the post content'
        },
        'replace post images': {
          description: 'Update social media post images',
          targets: ['img[src*="pexels"]', 'img[src*="social-media-main"]'],
          instructions: 'Replace post images while maintaining aspect ratio and email client compatibility'
        },
        'update dates': {
          description: 'Change post dates and timestamps',
          targets: ['p:contains("Aug")', 'p:contains("12:20")'],
          instructions: 'Update timestamps to current or relevant dates while keeping format consistent'
        },
        'change newsletter title': {
          description: 'Update the main newsletter heading',
          targets: ['h1 span:contains("Social Media")', 'h1, h2, h3, .title, .heading'],
          instructions: 'Replace main title while maintaining typography and styling'
        },
        'change text': {
          description: 'Update specific text content anywhere in the newsletter',
          targets: ['h1, h2, h3, p, span, div', 'any text element'],
          instructions: 'Find and replace specific text strings with new content'
        },
        'update call to action': {
          description: 'Modify CTA text and buttons',
          targets: ['h1:contains("Let\'s connect")', 'span:contains("Join us now!")'],
          instructions: 'Update call-to-action text to match your goals while keeping button styling'
        },
        'remove button': {
          description: 'Remove call-to-action buttons or form buttons',
          targets: ['a[href*="example.com"]', 'span:contains("Learn more")', 'span:contains("Join us now!")', 'span:contains("Follow us")'],
          instructions: 'Remove button elements while maintaining layout structure'
        },
        'remove logo': {
          description: 'Remove the company/brand logo from the header',
          targets: ['img[src*="brand-logo"]', 'img[src*="logo"]', '.logo', 'img[alt*="logo"]'],
          instructions: 'Remove only the logo image while keeping the header structure intact'
        },
        'remove section': {
          description: 'Remove entire content sections or blocks',
          targets: ['.row', '.column', 'div[style*="padding"]'],
          instructions: 'Remove entire sections while keeping newsletter structure intact'
        }
      }
  },

  // Add basic profiles for other templates (can be expanded later)
  sample2: {
    id: 'sample2',
    name: 'Modern Tech',
    description: 'Contemporary design with clean typography ideal for tech and startup newsletters',
    style: 'modern',
    maxWidth: '640px',
    sections: [],
    editableElements: [],
    commonEditRequests: {
      'change company name': {
        description: 'Update the brand/company name',
        targets: ['h1', 'h2', 'h3', 'span'],
        instructions: 'Replace company name while maintaining styling'
      },
      'update content': {
        description: 'Modify newsletter content',
        targets: ['p', 'div'],
        instructions: 'Replace content while keeping layout intact'
      }
    }
  },

  sample3: {
    id: 'sample3',
    name: 'Creative Lifestyle',
    description: 'Vibrant, engaging design perfect for lifestyle and creative industry newsletters',
    style: 'creative',
    maxWidth: '640px',
    sections: [],
    editableElements: [],
    commonEditRequests: {
      'change company name': {
        description: 'Update the brand/company name',
        targets: ['h1', 'h2', 'h3', 'span'],
        instructions: 'Replace company name while maintaining styling'
      },
      'update content': {
        description: 'Modify newsletter content',
        targets: ['p', 'div'],
        instructions: 'Replace content while keeping layout intact'
      }
    }
  },

  sample4: {
    id: 'sample4',
    name: 'Minimal Elegant',
    description: 'Clean, minimal design with elegant typography for sophisticated content',
    style: 'minimal',
    maxWidth: '640px',
    sections: [],
    editableElements: [],
    commonEditRequests: {
      'change company name': {
        description: 'Update the brand/company name',
        targets: ['h1', 'h2', 'h3', 'span'],
        instructions: 'Replace company name while maintaining styling'
      },
      'update content': {
        description: 'Modify newsletter content',
        targets: ['p', 'div'],
        instructions: 'Replace content while keeping layout intact'
      }
    }
  }
};

// Flatten editable elements for easy access
Object.keys(TEMPLATE_PROFILES).forEach(templateId => {
  const profile = TEMPLATE_PROFILES[templateId];
  profile.editableElements = profile.sections.flatMap(section => section.elements);
});

// Debug: Log available template profiles
console.log('🎨 Template Intelligence loaded profiles:', Object.keys(TEMPLATE_PROFILES));

// Smart prompt generation based on template context
export function generateTemplatePrompt(
  templateId: string, 
  userRequest: string, 
  currentHtml?: string
): string {
  const profile = TEMPLATE_PROFILES[templateId];
  
  if (!profile) {
    return `Edit this newsletter: ${userRequest}`;
  }

  return `
You are an expert newsletter editor with deep understanding of HTML, CSS, and email templates. Your job is to intelligently interpret user requests and make precise, targeted changes to the newsletter HTML.

USER REQUEST: "${userRequest}"

TEMPLATE CONTEXT:
- Template: ${profile.name} (${templateId})
- Style: ${profile.style}
- Max Width: ${profile.maxWidth}

INTELLIGENT INTERPRETATION SYSTEM:
You must analyze the user's request and determine:
1. WHAT they want to change (text, images, layout, styling)
2. WHERE the changes should be made (specific elements, sections, or global)
3. HOW to make the changes (replace, remove, add, modify)

COMMON REQUEST PATTERNS:
• "remove [element]" → Find and remove specific elements (buttons, logos, sections)
• "change [text] to [new text]" → Replace exact text matches
• "update [element]" → Modify existing elements (titles, content, images)
• "add [element]" → Insert new elements or content
• "make [adjective]" → Apply styling changes (shorter, longer, bigger, smaller)
• "move [element]" → Reposition elements within the layout
• "replace [old] with [new]" → Find and replace specific content
• "delete [element]" → Remove specific elements or content
• "modify [element]" → Change existing elements while preserving structure

EDITABLE ELEMENTS IN THIS TEMPLATE:
${profile.editableElements.map(el => `
• ${el.description} (${el.type}): ${el.context}
  Selector: ${el.selector}
  ${el.examples ? `Examples: ${el.examples.join(', ')}` : ''}
`).join('')}

TEMPLATE-SPECIFIC INSTRUCTIONS:
Use the selectors above to find and modify elements. For example:
- To remove a logo: Look for elements matching the logo selector
- To change text: Find elements matching the text selectors
- To modify images: Use the image selectors provided
- To update buttons: Use the button selectors listed above

ELEMENT LOCATION GUIDE:
${profile.sections.map(section => `
${section.name.toUpperCase()} SECTION:
${section.elements.map(el => `  - ${el.description}: ${el.selector}`).join('\n')}
`).join('')}

ANALYSIS INSTRUCTIONS:
1. READ the user request carefully and identify the intent
2. SCAN the HTML using the provided selectors to find relevant elements
3. PLAN the specific changes needed (what to change, where, how)
4. EXECUTE only the requested changes while preserving everything else
5. VALIDATE that the changes make sense and don't break the layout

TEMPLATE-BASED ELEMENT FINDING:
- Use the exact selectors provided in the template profile
- Match elements by their CSS selectors, not by text content
- Focus on the specific sections and elements listed above
- Do not modify elements that are not in the editable elements list

CHANGE EXECUTION RULES:
- For REMOVALS: Only remove the specific element mentioned, not entire sections
  * "remove logo" → Find and remove only the logo image element
  * "remove button" → Find and remove only the button element
  * "remove section" → Find and remove only the specific section
- For REPLACEMENTS: Find exact text matches and replace them precisely
- For ADDITIONS: Insert new content in appropriate locations
- For MODIFICATIONS: Update existing elements while preserving structure
- For STYLING: Apply CSS changes to specific elements only

PRECISION REQUIREMENTS:
- When removing elements, ONLY remove the exact element requested
- Preserve ALL other content and structure
- Do NOT remove entire sections unless specifically requested
- Do NOT remove all content when removing a single element
- Keep the newsletter structure intact

CRITICAL REQUIREMENTS:
1. UNDERSTAND the user's intent, even if vague or ambiguous
2. IDENTIFY the exact elements to modify based on context
3. MAKE ONLY the requested changes - preserve everything else
4. MAINTAIN all HTML structure, classes, and email compatibility
5. RETURN the complete modified HTML with your changes applied

Current HTML to modify:
${currentHtml ? currentHtml.substring(0, 3000) + '...' : 'HTML not provided'}

INSTRUCTIONS:
Analyze the user request, find the relevant elements in the HTML, make the specific changes requested, and return ONLY the complete modified HTML. 

CRITICAL REQUIREMENTS:
- Return ONLY the complete HTML document from <!DOCTYPE> to </html>
- Do not include any explanatory text, comments, or markdown formatting
- Ensure the HTML has proper opening and closing tags
- Make sure the HTML is complete and valid
- Do not return partial HTML or HTML fragments
- ALWAYS include </body> and </html> closing tags
- The HTML must be a complete, valid document

HTML STRUCTURE REQUIREMENTS:
- Start with: <!DOCTYPE html>
- Include: <html> ... </html>
- Include: <head> ... </head>
- Include: <body> ... </body>
- End with: </html>
- NEVER cut off HTML mid-element
- ALWAYS complete all table structures
- ALWAYS close all tags properly

EXAMPLE OUTPUT FORMAT:
<!DOCTYPE html>
<html>
<head>
  <!-- head content -->
</head>
<body>
  <!-- body content with your changes -->
</body>
</html>

IMPORTANT: If you cannot complete the full HTML due to length limits, DO NOT return partial HTML. Instead, return a message explaining what changes need to be made.

SPECIFIC REMOVAL INSTRUCTIONS:
- For "remove logo": Find the logo image element (usually <img> with logo-related src or alt text) and remove ONLY that element
- For "remove button": Find the button element (usually <a> or <button> with button text) and remove ONLY that element
- For "remove section": Find the specific section mentioned and remove ONLY that section
- NEVER remove all content when removing a single element
- ALWAYS preserve the newsletter structure and all other content

TEMPLATE-SPECIFIC COMMON REQUESTS:
${Object.entries(profile.commonEditRequests).map(([key, request]) => `
"${key}": ${request.description}
  Targets: ${request.targets.join(', ')}
  Instructions: ${request.instructions}
`).join('')}

USE TEMPLATE INFORMATION:
- Match user requests to the common edit requests above
- Use the exact target selectors provided
- Follow the specific instructions for each request type
- Only modify elements that are listed as editable
`;
}

// Analyze user intent and suggest editable elements
export function analyzeEditIntent(userRequest: string, templateId: string): {
  suggestedElements: EditableElement[];
  confidence: number;
  editType: string;
} {
  console.log('🔍 Analyzing edit intent for templateId:', templateId);
  console.log('🔍 Available template profiles:', Object.keys(TEMPLATE_PROFILES));
  
  const profile = TEMPLATE_PROFILES[templateId];
  
  if (!profile) {
    console.error('❌ Template profile not found for ID:', templateId);
    console.log('Available profiles:', Object.keys(TEMPLATE_PROFILES));
    
    // Return a fallback response
    return {
      suggestedElements: [],
      confidence: 0.1,
      editType: 'unknown_template'
    };
  }
  
  console.log('✅ Found template profile:', profile.name);
  const request = userRequest.toLowerCase();
  
  // Check for common edit patterns
  for (const [pattern, config] of Object.entries(profile.commonEditRequests)) {
    if (request.includes(pattern.toLowerCase()) || 
        pattern.toLowerCase().includes(request.split(' ')[0])) {
      
      const suggestedElements = profile.editableElements.filter(el =>
        config.targets.some(target => 
          target.toLowerCase().includes(el.selector.split('[')[0].toLowerCase())
        )
      );
      
      console.log('🎯 Matched edit pattern:', pattern);
      return {
        suggestedElements,
        confidence: 0.9,
        editType: pattern
      };
    }
  }
  
  // Fallback: semantic matching
  const suggestedElements = profile.editableElements.filter(el =>
    el.description.toLowerCase().includes(request) ||
    el.context.toLowerCase().includes(request) ||
    request.includes(el.type)
  );
  
  console.log('📝 Using semantic matching, found elements:', suggestedElements.length);
  return {
    suggestedElements,
    confidence: suggestedElements.length > 0 ? 0.6 : 0.3,
    editType: 'general'
  };
}

// Extract template profile by ID
export function getTemplateProfile(templateId: string): TemplateProfile | null {
  return TEMPLATE_PROFILES[templateId] || null;
}

// Get all available templates
export function getAllTemplateProfiles(): TemplateProfile[] {
  return Object.values(TEMPLATE_PROFILES);
}

// Helper function to identify the selected template from the current newsletter
export function identifyTemplate(html: string): string | null {
  // Check for template-specific indicators
  if (html.includes('brand-logo.png') && html.includes('Social Media')) {
    return 'sample1';
  }
  // Add more template identification logic as needed
  return null;
} 