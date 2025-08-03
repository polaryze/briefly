import React, { useState, useEffect } from 'react';
import AdvancedNewsletterBuilder from '@/components/AdvancedNewsletterBuilder';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Send } from 'lucide-react';

interface NewsletterData {
  content: string;
  subject: string;
  platform: string;
  date: string;
}

const NewsletterEditor: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [editorContent, setEditorContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Get newsletter data from location state
  const newsletterData: NewsletterData | null = location.state?.newsletterData || null;

  useEffect(() => {
    if (newsletterData) {
      setEditorContent(newsletterData.content);
    }
  }, [newsletterData]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');

    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save the newsletter content to localStorage
      const savedNewsletters = JSON.parse(localStorage.getItem('savedNewsletters') || '[]');
      const newNewsletter = {
        id: Date.now(),
        content: editorContent,
        subject: newsletterData?.subject || 'Untitled Newsletter',
        date: new Date().toISOString(),
        platform: newsletterData?.platform || 'Unknown'
      };
      
      savedNewsletters.push(newNewsletter);
      localStorage.setItem('savedNewsletters', JSON.stringify(savedNewsletters));
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = () => {
    // Implement newsletter sending logic
    navigate('/newsletter-builder');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Newsletter Editor
              </h1>
              <p className="text-gray-600 mt-2">
                Edit and customize your newsletter content
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="outline"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              
              <Button onClick={handleSend}>
                <Send className="w-4 h-4 mr-2" />
                Send Newsletter
              </Button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Content</CardTitle>
              <CardDescription>
                Edit your newsletter content below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedNewsletterBuilder
                initialHtml={editorContent}
                onUpdate={setEditorContent}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                See how your newsletter will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: editorContent }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewsletterEditor; 