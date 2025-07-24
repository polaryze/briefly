import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, ExternalLink } from 'lucide-react';
import { logger } from '@/lib/logger';

interface NewsletterSection {
  title: string;
  icon: string;
  content: string;
}

interface AINewsletterData {
  sections: NewsletterSection[];
  rawContent?: string;
  error?: string;
  youtubeSummaries?: {[key: string]: string};
}

interface AINewsletterRendererProps {
  newsletterData: AINewsletterData;
  posts?: any[];
  onBackToBuilder?: () => void;
}

const AINewsletterRenderer: React.FC<AINewsletterRendererProps> = ({ newsletterData, posts, onBackToBuilder }) => {
  const handleBackToGenerator = () => {
    logger.info('User clicked back to generator');
    if (onBackToBuilder) {
      onBackToBuilder();
    }
  };

  const Section = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <section className="mb-6 bg-card rounded-lg p-4 shadow-sm border border-border">
      <h2 className="flex items-center gap-2 text-lg font-bold mb-3">
        <span className="text-xl">{icon}</span> {title}
      </h2>
      {children}
    </section>
  );

  // Handle raw content display - TRUE BLANK CANVAS MODE
  if (newsletterData.rawContent) {
    logger.info('Rendering newsletter with raw content', { 
      contentLength: newsletterData.rawContent.length 
    });
    
    // Debug logging
    console.log('AINewsletterRenderer received rawContent:', newsletterData.rawContent);
    console.log('RawContent length:', newsletterData.rawContent.length);
    console.log('RawContent type:', typeof newsletterData.rawContent);
    
    // Check if the content contains complete HTML structure
    const hasCompleteHtml = newsletterData.rawContent.includes('<html') && newsletterData.rawContent.includes('</html>');
    
    if (hasCompleteHtml) {
      // For complete HTML documents, render in a completely isolated iframe
      // Remove any existing HTML structure from OpenAI and let it be the complete document
      const cleanHtmlContent = newsletterData.rawContent
        .replace(/^```html\s*/g, '')
        .replace(/\s*```$/g, '')
        .trim();
      
      return (
        <div className="w-full h-full bg-white max-w-[640px] flex flex-col min-h-0">
          {/* Completely Isolated HTML Renderer */}
          <div className="flex-1 flex justify-center min-h-0" style={{ padding: '0', margin: '0' }}>
            <div className="w-full max-w-[640px] h-full min-h-0" style={{ padding: '0', margin: '0' }}>
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
      // For partial HTML content, render in a minimal container with no styling conflicts
      return (
        <div className="w-full h-full bg-white max-w-[640px] flex flex-col min-h-0">
          {/* Minimal Content Renderer - No styling conflicts */}
          <div className="flex-1 flex justify-center min-h-0" style={{ padding: '0', margin: '0' }}>
            <div 
              className="w-full max-w-[640px] h-full overflow-y-auto min-h-0"
              style={{
                // Reset all styles to avoid conflicts
                all: 'unset',
                display: 'block',
                width: '100%',
                height: '100%',
                maxWidth: '640px',
                backgroundColor: 'white',
                overflowY: 'auto',
                padding: '0',
                margin: '0',
                minHeight: '0',
                // Additional isolation
                isolation: 'isolate',
                contain: 'layout style paint'
              }}
            >
              <div 
                dangerouslySetInnerHTML={{ __html: newsletterData.rawContent }}
                style={{
                  // Ensure no inherited styles interfere
                  all: 'unset',
                  display: 'block',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  lineHeight: 'inherit',
                  color: 'inherit',
                  padding: '0',
                  margin: '0',
                  maxWidth: '640px',
                  backgroundColor: 'white',
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
    <div className="w-full h-full bg-white max-w-[640px] flex flex-col min-h-0">
      <div className="flex-1 flex justify-center min-h-0">
        <div className="bg-white h-full overflow-y-auto max-w-[640px] w-full min-h-0">
          <header className="mb-6 pb-4 border-b border-border p-6">
            <h1 className="text-2xl font-bold mb-2">Your Weekly Newsletter</h1>
            <p className="text-muted-foreground">Generated from your social media content and YouTube videos</p>
          </header>
          
          <main className="space-y-6 p-6">
            {/* AI Generated Content */}
            {newsletterData.sections && newsletterData.sections.length > 0 && (
              <Section title="AI Generated Content" icon="🤖">
                {newsletterData.sections.map((section, index) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <span>{section.icon}</span> {section.title}
                    </h3>
                    <div 
                      className="text-foreground prose prose-neutral max-w-none"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                ))}
              </Section>
            )}

            {/* YouTube Video Summaries */}
            {newsletterData.youtubeSummaries && Object.keys(newsletterData.youtubeSummaries).length > 0 && (
              <Section title="YouTube Video Summaries" icon="📺">
                <div className="space-y-4">
                  {Object.entries(newsletterData.youtubeSummaries).map(([videoUrl, summary], index) => (
                    <div key={index} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Play className="w-4 h-4 text-muted-foreground" />
                        <a 
                          href={videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          Watch Video
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="text-sm text-foreground leading-relaxed">
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {posts.slice(0, 8).map((post: any, index: number) => (
                    <div key={index} className="relative group">
                      {post.thumbnail ? (
                        <img 
                          src={post.thumbnail} 
                          alt={post.title || "Social media post"}
                          className="w-full h-24 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
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
                        <div className="w-full h-24 bg-muted rounded-lg flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">{post.platform}</span>
                        </div>
                      )}
                      <div className="mt-2">
                        <div className="text-xs font-medium text-muted-foreground">{post.platform}</div>
                        <div className="text-sm line-clamp-2">{post.title}</div>
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
              <div className="text-center py-8">
                <p className="text-muted-foreground">No content available to display in your newsletter.</p>
                <p className="text-sm text-muted-foreground mt-2">Try adding more social media links or YouTube videos.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AINewsletterRenderer; 