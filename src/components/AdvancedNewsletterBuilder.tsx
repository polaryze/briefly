import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import './AdvancedNewsletterBuilder.css';

interface AdvancedNewsletterBuilderProps {
  initialHtml?: string;
  initialCss?: string;
  onUpdate?: (data: { html: string; css: string }) => void;
}

const AdvancedNewsletterBuilder: React.FC<AdvancedNewsletterBuilderProps> = ({
  initialHtml = '',
  initialCss = '',
  onUpdate,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Function to clean and convert newsletter content to editable HTML
  const processNewsletterContent = (content: string): string => {
    if (!content) return '';
    
    console.log('Processing newsletter content:', content.substring(0, 200) + '...');
    
    // Remove markdown code blocks if present
    let cleanedContent = content
      .replace(/^```html\s*/g, '')
      .replace(/\s*```$/g, '')
      .trim();
    
    // If it's a complete HTML document, extract the body content
    if (cleanedContent.includes('<html') && cleanedContent.includes('</html>')) {
      console.log('Detected complete HTML document');
      // Extract content from body tags
      const bodyMatch = cleanedContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        cleanedContent = bodyMatch[1];
        console.log('Extracted body content:', cleanedContent.substring(0, 200) + '...');
      }
    }
    
    // If it's just HTML content without body tags, wrap it properly
    if (!cleanedContent.includes('<body') && !cleanedContent.includes('<html')) {
      console.log('Wrapping content in newsletter container');
      // Wrap in a newsletter container
      cleanedContent = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          ${cleanedContent}
        </div>
      `;
    }
    
    console.log('Final processed content:', cleanedContent.substring(0, 200) + '...');
    return cleanedContent;
  };

  useEffect(() => {
    if (!editorRef.current) return;

    // Process the incoming newsletter content
    const processedHtml = processNewsletterContent(initialHtml);
    
    console.log('Original HTML:', initialHtml);
    console.log('Processed HTML:', processedHtml);

    const editor = grapesjs.init({
      container: editorRef.current,
      fromElement: true, // Changed back to true for direct editing
      height: '100%',
      width: '100%',
      storageManager: false,
      components: processedHtml || '<div style="padding: 20px; text-align: center; color: #666; background: white;">Start building your newsletter by dragging components from the right panel</div>',
      style: initialCss || `
        body { 
          margin: 0; 
          font-family: Arial, sans-serif; 
          background: white;
          padding: 20px;
        }
        .newsletter-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        }
      `,
      
      // Enhanced panel configuration
      panels: {
        defaults: [
          {
            id: 'basic-actions',
            el: '.panel__basic-actions',
            buttons: [
              {
                id: 'visibility',
                active: true,
                className: 'btn-toggle-borders',
                label: '<i class="fas fa-eye"></i>',
                command: 'sw-visibility',
              },
            ],
          },
        ],
      },

      // Enhanced block manager with robust components
      blockManager: {
        appendTo: '.blocks-container',
        blocks: [
          {
            id: 'newsletter-header',
            label: 'Header',
            category: 'Basic',
            content: `
              <div class="newsletter-header" style="background: #000; color: white; padding: 30px 20px; text-align: center;">
                <h1 style="margin: 0 0 10px 0; font-size: 2.5em;">Newsletter Title</h1>
                <p style="margin: 0; opacity: 0.9; font-size: 1.1em;">Your newsletter subtitle</p>
              </div>
            `,
          },
          {
            id: 'section',
            label: 'Section',
            category: 'Basic',
            content: `
              <div class="newsletter-section" style="padding: 20px; margin: 10px 0; background: #f8f8f8; border-radius: 8px;">
                <h2 style="color: #000; margin-bottom: 15px;">Section Title</h2>
                <p style="color: #333; line-height: 1.6;">This is a section with some content. You can edit this text and customize the styling.</p>
              </div>
            `,
          },
          {
            id: 'text',
            label: 'Text',
            category: 'Basic',
            content: '<div data-gjs-type="text" style="padding: 15px; color: #000; line-height: 1.6;">Insert your text here</div>',
          },
          {
            id: 'heading',
            label: 'Heading',
            category: 'Basic',
            content: '<h2 data-gjs-type="text" style="color: #000; margin: 20px 0; font-size: 1.5em;">Heading</h2>',
          },
          {
            id: 'subheading',
            label: 'Subheading',
            category: 'Basic',
            content: '<h3 data-gjs-type="text" style="color: #333; margin: 15px 0; font-size: 1.2em;">Subheading</h3>',
          },
          {
            id: 'image',
            label: 'Image',
            category: 'Basic',
            content: { type: 'image' },
            activate: true,
          },
          {
            id: 'button',
            label: 'Button',
            category: 'Basic',
            content: '<button data-gjs-type="button" style="padding: 12px 24px; background: #000; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Click Here</button>',
          },
          {
            id: 'divider',
            label: 'Divider',
            category: 'Basic',
            content: '<hr style="border: none; height: 1px; background: #ddd; margin: 20px 0;">',
          },
          {
            id: 'newsletter-footer',
            label: 'Footer',
            category: 'Basic',
            content: `
              <div class="newsletter-footer" style="background: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
                <p style="margin: 0 0 10px 0; color: #333;">© 2024 Your Company. All rights reserved.</p>
                <div style="margin-top: 15px;">
                  <a href="#" style="color: #000; text-decoration: none; margin: 0 10px;">Unsubscribe</a>
                </div>
              </div>
            `,
          },
          {
            id: 'spacer',
            label: 'Spacer',
            category: 'Basic',
            content: '<div style="height: 20px; background: transparent;"></div>',
          },
          {
            id: 'social-links',
            label: 'Social Links',
            category: 'Advanced',
            content: `
              <div style="text-align: center; padding: 20px;">
                <div style="display: flex; justify-content: center; gap: 15px;">
                  <a href="#" style="color: #000; text-decoration: none; font-size: 14px;">Facebook</a>
                  <a href="#" style="color: #000; text-decoration: none; font-size: 14px;">Twitter</a>
                  <a href="#" style="color: #000; text-decoration: none; font-size: 14px;">LinkedIn</a>
                </div>
              </div>
            `,
          },
          {
            id: 'quote',
            label: 'Quote',
            category: 'Advanced',
            content: `
              <div style="padding: 20px; background: #f8f8f8; border-left: 4px solid #000; margin: 20px 0;">
                <blockquote style="margin: 0; font-style: italic; color: #333;">
                  "This is a quote that stands out in your newsletter."
                </blockquote>
              </div>
            `,
          },
          {
            id: 'stats',
            label: 'Stats',
            category: 'Advanced',
            content: `
              <div style="display: flex; justify-content: space-around; padding: 20px; background: #f8f8f8; margin: 20px 0;">
                <div style="text-align: center;">
                  <div style="font-size: 2em; font-weight: bold; color: #000;">100</div>
                  <div style="font-size: 12px; color: #666;">Subscribers</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 2em; font-weight: bold; color: #000;">50</div>
                  <div style="font-size: 12px; color: #666;">Posts</div>
                </div>
              </div>
            `,
          },
        ],
      },

      // Enhanced style manager with body styling
      styleManager: {
        appendTo: '.styles-container',
        sectors: [
          {
            name: 'Body',
            open: true,
            buildProps: ['background-color', 'background-image', 'background-repeat', 'background-position', 'background-size', 'padding', 'margin'],
            properties: [
              {
                id: 'background-color',
                type: 'color',
                name: 'Background Color',
              },
              {
                id: 'background-image',
                type: 'file',
                functionName: 'url',
                name: 'Background Image',
              },
              {
                id: 'background-repeat',
                type: 'select',
                options: [
                  { value: 'no-repeat', name: 'No Repeat' },
                  { value: 'repeat', name: 'Repeat' },
                  { value: 'repeat-x', name: 'Repeat X' },
                  { value: 'repeat-y', name: 'Repeat Y' },
                ],
                name: 'Background Repeat',
              },
              {
                id: 'background-position',
                type: 'select',
                options: [
                  { value: 'center', name: 'Center' },
                  { value: 'top', name: 'Top' },
                  { value: 'bottom', name: 'Bottom' },
                  { value: 'left', name: 'Left' },
                  { value: 'right', name: 'Right' },
                ],
                name: 'Background Position',
              },
              {
                id: 'background-size',
                type: 'select',
                options: [
                  { value: 'cover', name: 'Cover' },
                  { value: 'contain', name: 'Contain' },
                  { value: 'auto', name: 'Auto' },
                ],
                name: 'Background Size',
              },
              {
                id: 'padding',
                type: 'integer',
                units: ['px', '%', 'em', 'rem'],
                defaults: '0',
                min: 0,
                name: 'Padding',
              },
              {
                id: 'margin',
                type: 'integer',
                units: ['px', '%', 'em', 'rem'],
                defaults: '0',
                min: 0,
                name: 'Margin',
              },
            ],
          },
          {
            name: 'Typography',
            open: false,
            buildProps: ['font-family', 'font-size', 'font-weight', 'color', 'line-height', 'text-align'],
            properties: [
              {
                id: 'font-family',
                type: 'select',
                options: [
                  { value: 'Arial, Helvetica, sans-serif', name: 'Arial' },
                  { value: 'Georgia, serif', name: 'Georgia' },
                  { value: 'Verdana, Geneva, sans-serif', name: 'Verdana' },
                  { value: 'Times New Roman, Times, serif', name: 'Times New Roman' },
                ],
                name: 'Font Family',
              },
              {
                id: 'font-size',
                type: 'integer',
                units: ['px', 'em', 'rem', '%'],
                defaults: '16px',
                min: 0,
                name: 'Font Size',
              },
              {
                id: 'font-weight',
                type: 'select',
                options: [
                  { value: 'normal', name: 'Normal' },
                  { value: 'bold', name: 'Bold' },
                  { value: 'bolder', name: 'Bolder' },
                  { value: 'lighter', name: 'Lighter' },
                ],
                name: 'Font Weight',
              },
              {
                id: 'color',
                type: 'color',
                name: 'Text Color',
              },
              {
                id: 'line-height',
                type: 'integer',
                units: ['px', 'em', 'rem'],
                defaults: '1.6',
                min: 0,
                name: 'Line Height',
              },
              {
                id: 'text-align',
                type: 'select',
                options: [
                  { value: 'left', name: 'Left' },
                  { value: 'center', name: 'Center' },
                  { value: 'right', name: 'Right' },
                  { value: 'justify', name: 'Justify' },
                ],
                name: 'Text Align',
              },
            ],
          },
        ],
      },

      // Canvas configuration
      canvas: {
        styles: [
          'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css',
        ],
      },

      // Enhanced asset manager
      assetManager: {
        embedAsBase64: true,
        assets: [
          { src: 'https://via.placeholder.com/350x250/000000/ffffff?text=Image+1', name: 'Image 1' },
          { src: 'https://via.placeholder.com/350x250/333333/ffffff?text=Image+2', name: 'Image 2' },
          { src: 'https://via.placeholder.com/350x250/666666/ffffff?text=Image+3', name: 'Image 3' },
          { src: 'https://via.placeholder.com/600x200/000000/ffffff?text=Newsletter+Header', name: 'Header Image' },
          { src: 'https://via.placeholder.com/600x300/333333/ffffff?text=Content+Image', name: 'Content Image' },
        ],
      },
    });

    // If we have processed HTML, set it as the initial content
    if (processedHtml && processedHtml.trim()) {
      // Clear existing components and add the newsletter content
      editor.DomComponents.clear();
      editor.addComponents(processedHtml, {});
      console.log('Set initial newsletter content:', processedHtml);
    } else {
      // If no content, add a default newsletter structure
      const defaultContent = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: #000; color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0 0 10px 0; font-size: 2.5em;">Your Newsletter</h1>
            <p style="margin: 0; opacity: 0.9; font-size: 1.1em;">Welcome to our newsletter</p>
          </div>
          <div style="padding: 20px; background: white;">
            <h2 style="color: #000; margin-bottom: 15px;">Latest Updates</h2>
            <p style="color: #333; line-height: 1.6; margin-bottom: 15px;">
              Start building your newsletter by dragging components from the right panel.
            </p>
          </div>
        </div>
      `;
      editor.DomComponents.clear();
      editor.addComponents(defaultContent, {});
      console.log('Set default newsletter content');
    }

    // Event listeners
    editor.on('update' as any, () => {
      const html = editor.getHtml();
      const css = editor.getCss();
      
      console.log('Editor update - HTML:', html.substring(0, 200) + '...');
      console.log('Editor update - CSS:', typeof css === 'string' ? css.substring(0, 200) + '...' : 'CSS array');
      
      onUpdate?.({ html, css: typeof css === 'string' ? css : '' });
    });

    // Add custom commands
    editor.Commands.add('preview-newsletter', (editor) => {
      const html = editor.getHtml();
      const css = editor.getCss();
      console.log('Preview Newsletter:', { html, css });
    });

    setIsEditorReady(true);

    return () => editor.destroy();
  }, [initialHtml, initialCss, onUpdate]);

  return (
    <div className="advanced-newsletter-builder" style={{ height: '100%', display: 'flex' }}>
      {/* Left side - Newsletter preview (directly editable) */}
      <div className="newsletter-preview" style={{ 
        flex: 1, 
        background: '#fafafa',
        borderRight: '1px solid #e5e5e5',
        position: 'relative'
      }}>
        <div className="preview-header" style={{
          padding: '16px 24px',
          background: 'white',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#000' }}>
            Newsletter Editor
          </h3>
          <div className="preview-controls" style={{ display: 'flex', gap: '8px' }}>
            <button className="preview-btn" style={{
              padding: '6px 12px',
              fontSize: '12px',
              background: '#f8f8f8',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#666',
              fontWeight: '500'
            }}>
              Preview
            </button>
          </div>
        </div>
        
        {/* Direct GrapesJS canvas - no iframe */}
        <div className="canvas-container" style={{ 
          height: 'calc(100% - 60px)',
          padding: '24px',
          overflow: 'auto',
          background: '#fafafa'
        }}>
          {/* This is where GrapesJS will render the editable content */}
          <div ref={editorRef} style={{
            width: '100%',
            minHeight: '100%',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            margin: '0 auto',
            maxWidth: '600px',
            border: '1px solid #f0f0f0'
          }} />
        </div>
      </div>

      {/* Right side - Component panels */}
      <div className="component-panels" style={{ 
        width: '380px', 
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderLeft: '1px solid #e5e5e5'
      }}>
        {/* Basic Components Panel */}
        <div className="panel-section" style={{
          flex: 1,
          background: 'white',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '280px'
        }}>
          <div className="panel-header" style={{
            padding: '20px 24px 16px',
            background: 'white',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#000', marginBottom: '4px' }}>
              Components
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#888', lineHeight: '1.4' }}>
              Drag components to add to your newsletter
            </p>
          </div>
          <div className="blocks-container" style={{ 
            flex: 1,
            padding: '16px 20px',
            overflow: 'auto',
            minHeight: '180px'
          }} />
        </div>

        {/* Body Styling Panel */}
        <div className="panel-section" style={{
          flex: 1,
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '280px'
        }}>
          <div className="panel-header" style={{
            padding: '20px 24px 16px',
            background: 'white',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#000', marginBottom: '4px' }}>
              Styling
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#888', lineHeight: '1.4' }}>
              Customize colors, spacing, and typography
            </p>
          </div>
          <div className="styles-container" style={{ 
            flex: 1,
            padding: '16px 20px',
            overflow: 'auto',
            minHeight: '180px'
          }} />
        </div>
      </div>
    </div>
  );
};

export default AdvancedNewsletterBuilder; 