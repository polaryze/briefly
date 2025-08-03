import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, ExternalLink, Edit } from 'lucide-react';
import { logger } from '@/lib/logger';
import { useNavigate } from 'react-router-dom';

interface NewsletterSection {
  title: string;
  icon: string;
  content: string;
}

interface AINewsletterData {
  sections: NewsletterSection[];
  rawContent?: string;
  editedContent?: string;
  css?: string;
  error?: string;
  youtubeSummaries?: {[key: string]: string};
}

interface AINewsletterRendererProps {
  newsletterData: AINewsletterData;
  posts?: any[];
  onBackToBuilder?: () => void;
}

// Safe HTML sanitization function
const sanitizeHTML = (html: string): string => {
  // Remove all script tags and event handlers
  const cleanHTML = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '');
  
  return cleanHTML;
};

// Safe component to render sanitized HTML
const SafeHTMLRenderer: React.FC<{ html: string }> = ({ html }) => {
  const sanitizedHTML = sanitizeHTML(html);
  
  return (
    <div 
      className="newsletter-content"
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
};

const AINewsletterRenderer: React.FC<AINewsletterRendererProps> = ({ newsletterData, posts, onBackToBuilder }) => {
  const navigate = useNavigate();
  const [sanitizedHTML, setSanitizedHTML] = useState<string | null>(null);
  
  const handleBackToGenerator = () => {
    logger.info('User clicked back to generator');
    if (onBackToBuilder) {
      onBackToBuilder();
    }
  };

  const handleEditNewsletter = () => {
    logger.info('User clicked edit newsletter');
    // Navigate to the newsletter editor with the current content
    navigate('/newsletter-editor', { 
      state: { 
        newsletterContent: newsletterData.rawContent || newsletterData.editedContent || '',
        newsletterData: newsletterData 
      } 
    });
  };

  const Section = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <section className="mb-4 sm:mb-6 bg-card rounded-lg p-3 sm:p-4 shadow-sm border border-border">
      <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold mb-2 sm:mb-3">
        <span className="text-lg sm:text-xl">{icon}</span> {title}
      </h2>
      {children}
    </section>
  );

  // Handle raw content display - TRUE BLANK CANVAS MODE
  if (newsletterData.rawContent || newsletterData.editedContent) {
    const contentToRender = newsletterData.editedContent || newsletterData.rawContent || '';
    const cssToApply = newsletterData.css || '';
    
    logger.info('Rendering newsletter with raw content', { 
      contentLength: contentToRender.length,
      hasCss: !!cssToApply
    });
    
    useEffect(() => {
      if (contentToRender && cssToApply) {
        let processedContent = contentToRender;
        
        // Check if the content contains complete HTML structure
        if (processedContent.includes('<!DOCTYPE html>') || processedContent.includes('<html')) {
          // Extract body content from complete HTML
          const bodyMatch = processedContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
          if (bodyMatch) {
            processedContent = bodyMatch[1];
          }
        }

        // Apply CSS to the content
        const finalHtmlContent = `
          <style>
            ${cssToApply}
          </style>
          ${processedContent}
        `;

        const cleanHtmlContent = sanitizeHTML(finalHtmlContent);
        setSanitizedHTML(cleanHtmlContent);
      }
    }, [contentToRender, cssToApply]);
    
    // Check if the content contains complete HTML structure
    const hasCompleteHtml = contentToRender.includes('<html') && contentToRender.includes('</html>');
    
    if (hasCompleteHtml) {
      // For complete HTML documents, render in a completely isolated iframe
      // Remove any existing HTML structure from OpenAI and let it be the complete document
      let cleanHtmlContent = contentToRender
        .replace(/^```html\s*/g, '')
        .replace(/\s*```$/g, '')
        .trim();
      
      // If we have CSS, inject it into the HTML
      if (cssToApply) {
        // Find the head tag and inject CSS, or create head if it doesn't exist
        if (cleanHtmlContent.includes('<head>')) {
          cleanHtmlContent = cleanHtmlContent.replace(
            '<head>',
            `<head><style>
              ${cssToApply}
              /* Ensure all content fills the full width */
              * {
                box-sizing: border-box !important;
              }
              /* Remove any max-width constraints */
              div, table, td, tr {
                max-width: none !important;
                width: 100% !important;
              }
              /* Ensure newsletter content fills the entire width */
              .newsletter-section {
                width: 100% !important;
                max-width: none !important;
              }
              /* Make sure images don't exceed container width */
              img {
                max-width: 100% !important;
                height: auto !important;
              }
              /* Ensure text content uses full width */
              p, h1, h2, h3, h4, h5, h6 {
                width: 100% !important;
                max-width: none !important;
              }
              /* Force table layout to use full width */
              table {
                width: 100% !important;
                max-width: none !important;
                table-layout: fixed !important;
              }
              td {
                width: 100% !important;
                max-width: none !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              /* Override any inline styles that might constrain width */
              [style*="max-width"] {
                max-width: none !important;
              }
              [style*="width"] {
                width: 100% !important;
              }
              /* Ensure all newsletter content uses full width */
              #section-1, #section-2, #section-3, #section-4, #section-5 {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              /* Force all divs to use full width */
              div {
                width: 100% !important;
                max-width: none !important;
                box-sizing: border-box !important;
              }
              /* EXTREMELY AGGRESSIVE RULES - Override everything */
              body * {
                max-width: none !important;
                width: 100% !important;
                box-sizing: border-box !important;
              }
              /* Target specific table structure */
              table[role="presentation"] {
                width: 100% !important;
                max-width: none !important;
                table-layout: fixed !important;
              }
              table[role="presentation"] td {
                width: 100% !important;
                max-width: none !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              /* Override any GrapesJS generated styles */
              [id^="i"] {
                width: 100% !important;
                max-width: none !important;
              }
              /* Force all elements to use full width */
              html, body {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              /* SPECIFIC OVERRIDE FOR INLINE STYLES */
              td[style*="width"] {
                width: 100% !important;
                max-width: none !important;
              }
              /* Target the specific td with id="i7uh" */
              td#i7uh {
                width: 100% !important;
                max-width: none !important;
              }
              /* Override any inline width styles on td elements */
              td[style] {
                width: 100% !important;
                max-width: none !important;
              }
              /* Force table layout to ignore inline widths */
              table {
                table-layout: fixed !important;
                width: 100% !important;
              }
              /* Ensure all td elements use full width regardless of inline styles */
              td {
                width: 100% !important;
                max-width: none !important;
                min-width: 100% !important;
              }
            </style>`
          );
        } else {
          // If no head tag, add one with CSS
          cleanHtmlContent = cleanHtmlContent.replace(
            '<html>',
            `<html><head><style>
              ${cssToApply}
              /* Ensure all content fills the full width */
              * {
                box-sizing: border-box !important;
              }
              /* Remove any max-width constraints */
              div, table, td, tr {
                max-width: none !important;
                width: 100% !important;
              }
              /* Ensure newsletter content fills the entire width */
              .newsletter-section {
                width: 100% !important;
                max-width: none !important;
              }
              /* Make sure images don't exceed container width */
              img {
                max-width: 100% !important;
                height: auto !important;
              }
              /* Ensure text content uses full width */
              p, h1, h2, h3, h4, h5, h6 {
                width: 100% !important;
                max-width: none !important;
              }
              /* Force table layout to use full width */
              table {
                width: 100% !important;
                max-width: none !important;
                table-layout: fixed !important;
              }
              td {
                width: 100% !important;
                max-width: none !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              /* Override any inline styles that might constrain width */
              [style*="max-width"] {
                max-width: none !important;
              }
              [style*="width"] {
                width: 100% !important;
              }
              /* Ensure all newsletter content uses full width */
              #section-1, #section-2, #section-3, #section-4, #section-5 {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              /* Force all divs to use full width */
              div {
                width: 100% !important;
                max-width: none !important;
                box-sizing: border-box !important;
              }
              /* EXTREMELY AGGRESSIVE RULES - Override everything */
              body * {
                max-width: none !important;
                width: 100% !important;
                box-sizing: border-box !important;
              }
              /* Target specific table structure */
              table[role="presentation"] {
                width: 100% !important;
                max-width: none !important;
                table-layout: fixed !important;
              }
              table[role="presentation"] td {
                width: 100% !important;
                max-width: none !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              /* Override any GrapesJS generated styles */
              [id^="i"] {
                width: 100% !important;
                max-width: none !important;
              }
              /* Force all elements to use full width */
              html, body {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              /* SPECIFIC OVERRIDE FOR INLINE STYLES */
              td[style*="width"] {
                width: 100% !important;
                max-width: none !important;
              }
              /* Target the specific td with id="i7uh" */
              td#i7uh {
                width: 100% !important;
                max-width: none !important;
              }
              /* Override any inline width styles on td elements */
              td[style] {
                width: 100% !important;
                max-width: none !important;
              }
              /* Force table layout to ignore inline widths */
              table {
                table-layout: fixed !important;
                width: 100% !important;
              }
              /* Ensure all td elements use full width regardless of inline styles */
              td {
                width: 100% !important;
                max-width: none !important;
                min-width: 100% !important;
              }
            </style></head>`
          );
        }
        
        // Debug logging
        console.log('Final HTML with CSS:', cleanHtmlContent.substring(0, 500) + '...');
      }
      
      return (
        <div className="w-full h-full bg-white flex flex-col min-h-0 max-w-[640px] mx-auto">
          {/* Header with Edit Button */}
          <header className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold mb-2">Your Newsletter</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Generated newsletter content</p>
              </div>
              <Button
                onClick={handleEditNewsletter}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200"
              >
                <Edit className="w-4 h-4" />
                Edit Newsletter
              </Button>
            </div>
          </header>
          
          {/* Completely Isolated HTML Renderer */}
          <div className="flex-1 flex justify-center min-h-0">
            <div className="w-full max-w-[640px] h-full min-h-0">
              <iframe
                srcDoc={cleanHtmlContent}
                className="w-full h-full border-0 min-h-0"
                title="Newsletter Preview"
                sandbox="allow-same-origin allow-scripts allow-forms"
                style={{ 
                  border: 'none',
                  outline: 'none',
                  background: 'white',
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  padding: '0',
                  margin: '0',
                  maxWidth: '640px',
                  minHeight: '0',
                  // Ensure no black bars
                  backgroundColor: 'white',
                  color: 'inherit',
                  // Additional isolation
                  isolation: 'isolate',
                  contain: 'layout style paint'
                }}
              />
            </div>
          </div>
        </div>
      );
    } else {
      // For partial HTML content, create a complete HTML document with CSS
      const completeHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            ${cssToApply}
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background: white;
              width: 100%;
              min-width: 100%;
            }
            /* Ensure all content fills the full width */
            * {
              box-sizing: border-box !important;
            }
            /* Remove any max-width constraints */
            div, table, td, tr {
              max-width: none !important;
              width: 100% !important;
            }
            /* Ensure newsletter content fills the entire width */
            .newsletter-section {
              width: 100% !important;
              max-width: none !important;
            }
            /* Make sure images don't exceed container width */
            img {
              max-width: 100% !important;
              height: auto !important;
            }
            /* Ensure text content uses full width */
            p, h1, h2, h3, h4, h5, h6 {
              width: 100% !important;
              max-width: none !important;
            }
            /* Force table layout to use full width */
            table {
              width: 100% !important;
              max-width: none !important;
              table-layout: fixed !important;
            }
            td {
              width: 100% !important;
              max-width: none !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            /* Override any inline styles that might constrain width */
            [style*="max-width"] {
              max-width: none !important;
            }
            [style*="width"] {
              width: 100% !important;
            }
            /* Ensure all newsletter content uses full width */
            #section-1, #section-2, #section-3, #section-4, #section-5 {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            /* Force all divs to use full width */
            div {
              width: 100% !important;
              max-width: none !important;
              box-sizing: border-box !important;
            }
            /* EXTREMELY AGGRESSIVE RULES - Override everything */
            body * {
              max-width: none !important;
              width: 100% !important;
              box-sizing: border-box !important;
            }
            /* Target specific table structure */
            table[role="presentation"] {
              width: 100% !important;
              max-width: none !important;
              table-layout: fixed !important;
            }
            table[role="presentation"] td {
              width: 100% !important;
              max-width: none !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            /* Override any GrapesJS generated styles */
            [id^="i"] {
              width: 100% !important;
              max-width: none !important;
            }
            /* Force all elements to use full width */
            html, body {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            /* SPECIFIC OVERRIDE FOR INLINE STYLES */
            td[style*="width"] {
              width: 100% !important;
              max-width: none !important;
            }
            /* Target the specific td with id="i7uh" */
            td#i7uh {
              width: 100% !important;
              max-width: none !important;
            }
            /* Override any inline width styles on td elements */
            td[style] {
              width: 100% !important;
              max-width: none !important;
            }
            /* Force table layout to ignore inline widths */
            table {
              table-layout: fixed !important;
              width: 100% !important;
            }
            /* Ensure all td elements use full width regardless of inline styles */
            td {
              width: 100% !important;
              max-width: none !important;
              min-width: 100% !important;
            }
          </style>
        </head>
        <body>
          ${contentToRender}
        </body>
        </html>
      `;
      
      return (
        <div className="w-full h-full bg-white flex flex-col min-h-0 max-w-[640px] mx-auto">
          {/* Header with Edit Button */}
          <header className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold mb-2">Your Newsletter</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Generated newsletter content</p>
              </div>
              <Button
                onClick={handleEditNewsletter}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200"
              >
                <Edit className="w-4 h-4" />
                Edit Newsletter
              </Button>
            </div>
          </header>
          
          {/* Complete HTML Renderer with CSS */}
          <div className="flex-1 flex justify-center min-h-0">
            <div className="w-full max-w-[640px] h-full min-h-0">
              <iframe
                srcDoc={completeHtml}
                className="w-full h-full border-0 min-h-0"
                title="Newsletter Preview"
                sandbox="allow-same-origin allow-scripts allow-forms"
                style={{ 
                  border: 'none',
                  outline: 'none',
                  background: 'white',
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  padding: '0',
                  margin: '0',
                  maxWidth: '640px',
                  minHeight: '0',
                  // Ensure no black bars
                  backgroundColor: 'white',
                  color: 'inherit',
                  // Additional isolation
                  isolation: 'isolate',
                  contain: 'layout style paint'
                }}
              />
            </div>
          </div>
        </div>
      );
    }
  }

  // Handle error display
  if (newsletterData.error) {
    logger.error('Newsletter renderer displaying error', new Error(newsletterData.error));
    
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white">
        <div className="w-full max-w-2xl p-8">
          <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-destructive">Newsletter Generation Failed</h2>
            <p className="text-muted-foreground">{newsletterData.error}</p>
          </div>
        </div>
      </div>
    );
  }

  logger.info('Rendering structured newsletter', { 
    sectionsCount: newsletterData.sections?.length || 0,
    postsCount: posts?.length || 0,
    youtubeSummariesCount: Object.keys(newsletterData.youtubeSummaries || {}).length
  });

  return (
    <div className="w-full h-full bg-white flex flex-col min-h-0">
      <div className="flex-1 flex justify-center min-h-0">
        <div className="bg-white h-full overflow-y-auto max-w-[640px] w-full min-h-0">
          <header className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold mb-2">Your Weekly Newsletter</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Generated from your social media content and YouTube videos</p>
              </div>
              <Button
                onClick={handleEditNewsletter}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200"
              >
                <Edit className="w-4 h-4" />
                Edit Newsletter
              </Button>
            </div>
          </header>
          
          <main className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* AI Generated Content */}
            {newsletterData.sections && newsletterData.sections.length > 0 && (
              <Section title="AI Generated Content" icon="🤖">
                {newsletterData.sections.map((section, index) => (
                  <div key={index} className="mb-4 sm:mb-6 last:mb-0">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                      <span>{section.icon}</span> {section.title}
                    </h3>
                    {section.content && (
                      <SafeHTMLRenderer html={section.content} />
                    )}
                  </div>
                ))}
              </Section>
            )}

            {/* YouTube Video Summaries */}
            {newsletterData.youtubeSummaries && Object.keys(newsletterData.youtubeSummaries).length > 0 && (
              <Section title="YouTube Video Summaries" icon="📺">
                <div className="space-y-3 sm:space-y-4">
                  {Object.entries(newsletterData.youtubeSummaries).map(([videoUrl, summary], index) => (
                    <div key={index} className="p-3 sm:p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <Play className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        <a 
                          href={videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          Watch Video
                          <ExternalLink className="w-2 h-2 sm:w-3 sm:h-3" />
                        </a>
                      </div>
                      <div className="text-xs sm:text-sm text-foreground leading-relaxed">
                        {summary}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Social Media Posts */}
            {posts && posts.length > 0 && (
              <Section title="Social Media Highlights" icon="📱">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {posts.slice(0, 8).map((post: any, index: number) => (
                    <div key={index} className="relative group">
                      {post.thumbnail ? (
                        <img 
                          src={post.thumbnail} 
                          alt={post.title || "Social media post"}
                          className="w-full h-16 sm:h-20 lg:h-24 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                          onError={(e) => {
                            logger.warn('Failed to load post thumbnail', { 
                              postIndex: index,
                              postTitle: post.title,
                              thumbnailUrl: post.thumbnail 
                            });
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-16 sm:h-20 lg:h-24 bg-muted rounded-lg flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">{post.platform}</span>
                        </div>
                      )}
                      <div className="mt-1 sm:mt-2">
                        <div className="text-xs font-medium text-muted-foreground">{post.platform}</div>
                        <div className="text-xs sm:text-sm line-clamp-2">{post.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Empty State */}
            {(!newsletterData.sections || newsletterData.sections.length === 0) && 
             (!newsletterData.youtubeSummaries || Object.keys(newsletterData.youtubeSummaries).length === 0) && 
             (!posts || posts.length === 0) && (
              <div className="text-center py-6 sm:py-8">
                <p className="text-sm sm:text-base text-muted-foreground">No content available to display in your newsletter.</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">Try adding more social media links or YouTube videos.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AINewsletterRenderer; 