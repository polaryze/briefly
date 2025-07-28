import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdvancedNewsletterBuilder from '@/components/AdvancedNewsletterBuilder';

const NewsletterEditor: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get newsletter content from navigation state or use default
  const newsletterContent = location.state?.newsletterContent || '';
  const newsletterData = location.state?.newsletterData;
  
  // Debug logging
  console.log('NewsletterEditor received content:', newsletterContent);
  console.log('NewsletterEditor received data:', newsletterData);
  
  const [editorContent, setEditorContent] = useState<{ html: string; css: string }>({
    html: newsletterContent || `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: #000; color: white; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0 0 10px 0; font-size: 2.5em;">Your Newsletter</h1>
          <p style="margin: 0; opacity: 0.9; font-size: 1.1em;">Welcome to our newsletter</p>
        </div>
        
        <div style="padding: 20px; background: white;">
          <h2 style="color: #000; margin-bottom: 15px;">Latest Updates</h2>
          <p style="color: #333; line-height: 1.6; margin-bottom: 15px;">
            This is your newsletter content. You can edit this text and customize the styling using the editor tools on the right.
          </p>
          <a href="#" style="color: #000; text-decoration: none;">Read more →</a>
        </div>
        
        <div style="background: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
          <p style="margin: 0 0 10px 0; color: #333;">© 2024 Your Company. All rights reserved.</p>
          <div style="margin-top: 15px;">
            <a href="#" style="color: #000; text-decoration: none; margin: 0 10px;">Unsubscribe</a>
            <a href="#" style="color: #000; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
          </div>
        </div>
      </div>
    `,
    css: `
      body { 
        margin: 0; 
        font-family: Arial, sans-serif; 
        background: #f5f5f5;
      }
      .gjs-block-section { 
        background: #f0f0f0; 
        padding: 10px; 
      }
    `
  });

  const handleEditorUpdate = (data: { html: string; css: string }) => {
    setEditorContent(data);
    console.log('Newsletter updated:', data);
  };

  const handleSaveChanges = () => {
    // Save the newsletter content to localStorage
    console.log('Saving newsletter:', editorContent);
    
    // Save the edited content
    localStorage.setItem('savedNewsletter', JSON.stringify(editorContent));
    
    // Create updated newsletter data
    const updatedNewsletterData = {
      ...newsletterData,
      rawContent: editorContent.html,
      editedContent: editorContent.html,
      css: editorContent.css
    };
    
    // Navigate back to newsletter builder with updated content
    navigate('/newsletter-builder', {
      state: {
        editedNewsletter: updatedNewsletterData,
        hasEditedContent: true
      }
    });
  };

  const handleCancel = () => {
    navigate('/newsletter-builder');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-black">Edit Newsletter</h1>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-gray-600 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-4 py-1.5 bg-black text-white rounded text-sm hover:bg-gray-800 font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="h-[calc(100vh-60px)]">
        <AdvancedNewsletterBuilder 
          initialHtml={editorContent.html}
          initialCss={editorContent.css}
          onUpdate={handleEditorUpdate}
        />
      </div>
    </div>
  );
};

export default NewsletterEditor; 