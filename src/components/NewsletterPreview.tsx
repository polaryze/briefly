import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Download, 
  Mail, 
  Edit3,
  ChevronLeft,
  Wand2
} from 'lucide-react';
import SectionEditor from './SectionEditor';

// HTML sanitization function
const sanitizeHTML = (html: string): string => {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  const cleanHTML = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
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

// Interface for section-based newsletters
interface NewsletterSection {
  id: string;
  title: string;
  html: string;
}

// Interface for section-based newsletter data
interface SectionBasedNewsletter {
  id: string;
  title: string;
  sections: NewsletterSection[];
  css?: string;
}

// Interface for legacy newsletter format
interface LegacyNewsletter {
  html: string;
  css?: string;
  title?: string;
  description?: string;
}

// Union type for both formats
type NewsletterData = SectionBasedNewsletter | LegacyNewsletter;

// Type guard to check if newsletter is section-based
const isSectionBased = (newsletter: NewsletterData): newsletter is SectionBasedNewsletter => {
  return 'sections' in newsletter && Array.isArray(newsletter.sections);
};

interface NewsletterPreviewProps {
  newsletter: NewsletterData;
  onBack?: () => void;
  onEdit?: () => void;
  onSend?: () => void;
  onDownload?: () => void;
  onSectionUpdate?: (sectionId: string, updatedHtml: string) => void;
}

export default function NewsletterPreview({ 
  newsletter, 
  onBack, 
  onEdit, 
  onSend, 
  onDownload,
  onSectionUpdate
}: NewsletterPreviewProps) {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSectionEditor, setShowSectionEditor] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigate('/newsletter-builder');
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const element = document.createElement('a');
      let content = '';
      
      if (isSectionBased(newsletter)) {
        // For section-based newsletters, combine all sections
        content = newsletter.sections.map(section => section.html).join('\n');
      } else {
        content = newsletter.html;
      }
      
      const file = new Blob([content], { type: 'text/html' });
      element.href = URL.createObjectURL(file);
      element.download = 'newsletter.html';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleSendNewsletter = async () => {
    setIsSending(true);
    try {
      if (onSend) {
        await onSend();
      } else {
        // Default send behavior
        console.log('Sending newsletter...');
        // Add your send logic here
      }
    } catch (error) {
      console.error('Failed to send newsletter:', error);
    } finally {
      setIsSending(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle section updates for section-based newsletters
  const handleSectionUpdate = (sectionId: string, updatedHtml: string) => {
    if (onSectionUpdate && isSectionBased(newsletter)) {
      onSectionUpdate(sectionId, updatedHtml);
    }
  };

  // Render section-based newsletter
  const renderSectionBasedNewsletter = (newsletter: SectionBasedNewsletter) => (
    <div className="space-y-6">
      {newsletter.sections.map((section) => (
        <div key={section.id} className="newsletter-section">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h3>
          <SafeHTMLRenderer html={section.html} />
        </div>
      ))}
    </div>
  );

  // Render legacy newsletter
  const renderLegacyNewsletter = (newsletter: LegacyNewsletter) => (
    <SafeHTMLRenderer html={newsletter.html} />
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {newsletter.title || 'Newsletter Preview'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
            </Button>

            {isSectionBased(newsletter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSectionEditor(!showSectionEditor)}
                className="flex items-center space-x-2"
              >
                <Wand2 className="w-4 h-4" />
                <span>{showSectionEditor ? 'Hide' : 'Show'} Section Editor</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex items-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </Button>

            <Button
              onClick={handleSendNewsletter}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              disabled={isSending}
            >
              <Mail className="w-4 h-4" />
              <span>{isSending ? 'Sending...' : 'Send Newsletter'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Newsletter Preview */}
          {showPreview && (
            <div className="lg:col-span-2">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Newsletter Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="newsletter-container">
                    {isSectionBased(newsletter) 
                      ? renderSectionBasedNewsletter(newsletter)
                      : renderLegacyNewsletter(newsletter)
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Section Editor */}
          {showSectionEditor && isSectionBased(newsletter) && (
            <div className="lg:col-span-1">
              <Card className="bg-white sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Section Editor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SectionEditor 
                    newsletterData={newsletter}
                    onSectionUpdate={handleSectionUpdate}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
