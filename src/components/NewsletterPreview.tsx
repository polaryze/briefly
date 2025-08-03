import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Download, Mail, Share2, Eye, EyeOff } from "lucide-react";
import { useNavigate } from 'react-router-dom';

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

interface NewsletterPreviewProps {
  newsletter: {
    html: string;
    css?: string;
    title?: string;
    description?: string;
  };
  onBack?: () => void;
  onEdit?: () => void;
  onSend?: () => void;
  onDownload?: () => void;
}

export default function NewsletterPreview({ 
  newsletter, 
  onBack, 
  onEdit, 
  onSend, 
  onDownload 
}: NewsletterPreviewProps) {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSending, setIsSending] = useState(false);

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
      navigate('/newsletter-editor', { 
        state: { 
          newsletterContent: newsletter.html,
          newsletterData: newsletter 
        } 
      });
    }
  };

  const handleSendNewsletter = async () => {
    setIsSending(true);
    try {
      // Newsletter sending logic here
      setIsSending(false);
    } catch (error) {
      setIsSending(false);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const blob = new Blob([newsletter.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'newsletter.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Newsletter Preview
                </h1>
                <p className="text-sm text-gray-600">
                  Review and customize your newsletter
                </p>
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

              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex items-center space-x-2"
              >
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
              >
                <Mail className="w-4 h-4" />
                <span>Send Newsletter</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Newsletter Preview */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
              <div>
                    <CardTitle className="text-lg">Newsletter Preview</CardTitle>
                    <CardDescription>
                      {newsletter.title || 'Your newsletter'}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Preview Mode</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {showPreview ? (
                  <div className={`bg-white rounded-lg border ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
                    <SafeHTMLRenderer html={newsletter.html} />
              </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <EyeOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Preview hidden</p>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Newsletter Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Newsletter Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {newsletter.title || 'Untitled Newsletter'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {newsletter.description || 'No description provided'}
                  </p>
              </div>

              <div>
                  <label className="text-sm font-medium text-gray-700">Content Length</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {newsletter.html.length} characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <span>Edit Newsletter</span>
                </Button>

                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span>Download HTML</span>
                </Button>

                <Button
                  onClick={handleSendNewsletter}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  <span>Send Newsletter</span>
                </Button>
              </CardContent>
          </Card>
              </div>
        </div>
      </div>
    </div>
  );
}
