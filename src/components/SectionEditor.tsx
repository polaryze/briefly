import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Wand2, Edit3, X, Check, Loader2 } from 'lucide-react';
import { useToast } from './ui/use-toast';

interface NewsletterSection {
  id: string;
  title: string;
  html: string;
}

interface NewsletterData {
  id: string;
  title: string;
  sections: NewsletterSection[];
}

interface SectionEditorProps {
  newsletterData: NewsletterData;
  onSectionUpdate: (sectionId: string, updatedHtml: string) => void;
}

export default function SectionEditor({ newsletterData, onSectionUpdate }: SectionEditorProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleEditSection = (sectionId: string) => {
    setEditingSection(sectionId);
    setUserPrompt('');
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setUserPrompt('');
  };

  const handleUpdateSection = async (sectionId: string) => {
    if (!userPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description of what you'd like to change.",
        variant: "destructive"
      });
      return;
    }

    const section = newsletterData.sections.find(s => s.id === sectionId);
    if (!section) return;

    setIsUpdating(true);

    try {
      const response = await fetch('/api/openai/updateSection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId: section.id,
          sectionHtml: section.html,
          sectionTitle: section.title,
          newsletterContext: `Newsletter: ${newsletterData.title}`,
          userPrompt: userPrompt.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update section');
      }

      const result = await response.json();
      
      // Update the section in the parent component
      onSectionUpdate(sectionId, result.updatedHtml);
      
      // Close the editor
      setEditingSection(null);
      setUserPrompt('');
      
      toast({
        title: "Section Updated",
        description: `Successfully updated "${section.title}" section.`,
      });
      
    } catch (error) {
      console.error('Error updating section:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : 'Failed to update section. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Newsletter Sections</h2>
        <p className="text-gray-600">
          Click "Edit with AI" on any section to modify it using natural language prompts.
        </p>
      </div>

      <div className="grid gap-4">
        {newsletterData.sections.map((section) => (
          <Card key={section.id} className="border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {section.title}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditSection(section.id)}
                  disabled={editingSection === section.id}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit with AI
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {editingSection === section.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What would you like to change about this section?
                    </label>
                    <Textarea
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      placeholder="e.g., Make it more engaging, add bullet points, change the tone to be more professional..."
                      className="min-h-[100px]"
                      disabled={isUpdating}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdateSection(section.id)}
                      disabled={isUpdating || !userPrompt.trim()}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      {isUpdating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4" />
                      )}
                      {isUpdating ? 'Updating...' : 'Update Section'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <div 
                    className="newsletter-section-preview"
                    dangerouslySetInnerHTML={{ __html: section.html }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
