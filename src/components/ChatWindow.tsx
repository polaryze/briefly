import React, { useState, useEffect, useRef } from 'react';

// Simple browser-compatible HTML minifier
const minifyHTML = (html: string): string => {
  if (!html.trim()) return html;
  
  return html
    // Remove comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove extra whitespace between tags
    .replace(/>\s+</g, '><')
    // Remove leading/trailing whitespace
    .replace(/^\s+|\s+$/gm, '')
    // Collapse multiple spaces into single space
    .replace(/\s+/g, ' ')
    // Remove whitespace around = in attributes
    .replace(/\s*=\s*/g, '=')
    // Remove empty attributes
    .replace(/\s+[a-zA-Z-]+=""\s*/g, ' ')
    // Clean up any remaining extra spaces
    .trim();
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  newsletterContent: string;
  isVisible: boolean;
  onNewsletterUpdate: (content: string) => void;
}

// Section-based HTML parser and minifier
class NewsletterSectionEditor {
  private fullHTML: string;

  constructor(html: string) {
    this.fullHTML = html;
  }

  // Extract specific section from newsletter HTML
  extractSection(sectionType: 'header' | 'main' | 'footer'): string {
    console.log(`=== EXTRACTING ${sectionType.toUpperCase()} SECTION ===`);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.fullHTML, 'text/html');
    
    let sectionElement: Element | null = null;
    
    switch (sectionType) {
      case 'header':
        // Look for header elements, then email-specific patterns
        sectionElement = doc.querySelector('header') || 
                        doc.querySelector('[class*="header"]') ||
                        doc.querySelector('[id*="header"]') ||
                        doc.querySelector('nav') ||
                        // Email newsletter patterns - look for logo/menu areas (typically first few rows)
                        doc.querySelector('.row-2') || // Based on placeholder structure
                        doc.querySelector('table.menu_block') ||
                        this.findElementByContent(doc, ['logo', 'navigation', 'menu', 'brand']);
        break;
        
      case 'main':
        // Look for main content area
        sectionElement = doc.querySelector('main') ||
                        doc.querySelector('[class*="content"]') ||
                        doc.querySelector('[class*="main"]') ||
                        doc.querySelector('article') ||
                        doc.querySelector('.newsletter-content') ||
                        // Email newsletter patterns - look for main content rows
                        doc.querySelector('.row-3') || // Based on placeholder structure  
                        doc.querySelector('.row-4') ||
                        doc.querySelector('.row-5') ||
                        this.findElementByContent(doc, ['social media', 'content', 'article']) ||
                        this.findLargestTextContainer(doc);
        break;
        
      case 'footer':
        // Look for footer elements, then email-specific patterns
        sectionElement = doc.querySelector('footer') ||
                        doc.querySelector('[class*="footer"]') ||
                        doc.querySelector('[id*="footer"]') ||
                        // Email newsletter patterns - typically last rows
                        this.findElementByContent(doc, ['unsubscribe', 'contact', 'copyright', 'follow us']) ||
                        this.findLastContentRow(doc);
        break;
    }

    if (sectionElement) {
      const extractedHTML = sectionElement.outerHTML;
      console.log(`✅ Extracted ${sectionType} section (${extractedHTML.length} chars):`, extractedHTML.substring(0, 200) + '...');
      console.log(`${sectionType} section element tag:`, sectionElement.tagName);
      console.log(`${sectionType} section element class:`, sectionElement.className);
      return extractedHTML;
    }

    console.log(`❌ No ${sectionType} section found in newsletter HTML`);
    console.log('Available elements:', doc.querySelectorAll('*').length);
    console.log('Available table rows:', doc.querySelectorAll('table.row, .row').length);
    console.log('Newsletter HTML length:', this.fullHTML.length);
    return '';
  }

  // Minify extracted HTML section
  minifySection(html: string): string {
    if (!html.trim()) return html;
    
    console.log(`=== MINIFYING SECTION ===`);
    console.log('Original size:', html.length, 'characters');
    
    try {
      const minified = minifyHTML(html);
      
      console.log('Minified size:', minified.length, 'characters');
      console.log('Compression ratio:', ((html.length - minified.length) / html.length * 100).toFixed(2) + '%');
      
      return minified;
    } catch (error) {
      console.error('Minification failed:', error);
      return html; // Return original if minification fails
    }
  }

  // Replace section in full HTML with updated content
  replaceSection(sectionType: 'header' | 'main' | 'footer', updatedHTML: string): string {
    console.log(`=== REPLACING ${sectionType.toUpperCase()} SECTION ===`);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.fullHTML, 'text/html');
    
    let sectionElement: Element | null = null;
    
    switch (sectionType) {
      case 'header':
        sectionElement = doc.querySelector('header') || 
                        doc.querySelector('[class*="header"]') ||
                        doc.querySelector('[id*="header"]') ||
                        doc.querySelector('nav') ||
                        this.findElementByContent(doc, ['logo', 'navigation', 'menu']);
        break;
        
      case 'main':
        sectionElement = doc.querySelector('main') ||
                        doc.querySelector('[class*="content"]') ||
                        doc.querySelector('[class*="main"]') ||
                        doc.querySelector('article') ||
                        doc.querySelector('.newsletter-content') ||
                        this.findLargestTextContainer(doc);
        break;
        
      case 'footer':
        sectionElement = doc.querySelector('footer') ||
                        doc.querySelector('[class*="footer"]') ||
                        doc.querySelector('[id*="footer"]') ||
                        this.findElementByContent(doc, ['unsubscribe', 'contact', 'copyright']);
        break;
    }

    if (sectionElement && updatedHTML.trim()) {
      // Parse the updated HTML
      const updateParser = new DOMParser();
      const updateDoc = updateParser.parseFromString(updatedHTML, 'text/html');
      const newElement = updateDoc.body.firstElementChild;
      
      if (newElement) {
        // Import and replace the element
        const importedElement = doc.importNode(newElement, true);
        sectionElement.parentNode?.replaceChild(importedElement, sectionElement);
        
        // Return the updated full HTML
        const serializer = new XMLSerializer();
        const updatedFullHTML = serializer.serializeToString(doc);
        
        console.log(`Successfully replaced ${sectionType} section`);
        return updatedFullHTML;
      }
    }

    console.log(`Failed to replace ${sectionType} section`);
    return this.fullHTML; // Return original if replacement fails
  }

  // Helper: Find element by text content
  private findElementByContent(doc: Document, keywords: string[]): Element | null {
    const allElements = doc.querySelectorAll('*');
    
    for (const element of allElements) {
      const text = element.textContent?.toLowerCase() || '';
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          return element;
        }
      }
    }
    
    return null;
  }

  // Helper: Find the largest text container (likely main content)
  private findLargestTextContainer(doc: Document): Element | null {
    // Include table elements for email newsletters
    const elements = doc.querySelectorAll('div, section, article, p, td, table.row');
    let largestElement: Element | null = null;
    let maxTextLength = 0;
    
    for (const element of elements) {
      const textLength = element.textContent?.length || 0;
      if (textLength > maxTextLength && textLength > 50) { // Minimum threshold
        maxTextLength = textLength;
        largestElement = element;
      }
    }
    
    return largestElement;
  }

  // Helper: Find the last content row (likely footer area)
  private findLastContentRow(doc: Document): Element | null {
    const rows = doc.querySelectorAll('table.row, .row');
    // Return the last row that has meaningful content
    for (let i = rows.length - 1; i >= 0; i--) {
      const row = rows[i];
      const textContent = row.textContent?.trim() || '';
      if (textContent.length > 20) { // Has meaningful content
        return row;
      }
    }
    return rows[rows.length - 1] || null; // Fallback to last row
  }
}

const ChatWindow: React.FC<ChatWindowProps> = ({ newsletterContent, isVisible, onNewsletterUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<'header' | 'main' | 'footer'>('main');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Main function to handle section-based editing
  const handleSectionEdit = async () => {
    if (!currentInput.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `[${selectedSection.toUpperCase()}] ${currentInput}`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log(`=== SECTION-BASED NEWSLETTER EDITING ===`);
      console.log('Selected section:', selectedSection);
      console.log('User instruction:', currentInput);
      
      // Get OpenAI API key early
      const openAIKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!openAIKey) {
        throw new Error('OpenAI API key not found');
      }
      
      // Step 1: Extract the specific section
      const editor = new NewsletterSectionEditor(newsletterContent);
      const extractedSection = editor.extractSection(selectedSection);
      
      if (!extractedSection.trim()) {
        console.log(`⚠️ Could not find specific ${selectedSection} section, falling back to full document edit`);
        
        // Fallback: Edit the entire newsletter with section-specific instructions
        const fullDocumentPrompt = `You are editing an email newsletter. The user wants to modify the ${selectedSection.toUpperCase()} section.

IMPORTANT:
- Modify ONLY the ${selectedSection} area of this newsletter
- Return the COMPLETE newsletter HTML with the ${selectedSection} changes applied
- Preserve all existing structure and styling unless specifically asked to change it
- Do not add extra wrapper elements or change the overall structure

User instruction for ${selectedSection} section: "${currentInput}"

Newsletter HTML:
${newsletterContent}

Return the complete modified newsletter HTML:`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAIKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: fullDocumentPrompt },
              { role: 'user', content: currentInput },
            ],
            max_tokens: 3000,
            temperature: 0.1,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const updatedNewsletterHTML = data.choices?.[0]?.message?.content?.trim();

        if (!updatedNewsletterHTML) {
          throw new Error('Received empty response from OpenAI');
        }

        // Step 5: Update the newsletter directly (full document mode)
        onNewsletterUpdate(updatedNewsletterHTML);

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `✅ Successfully updated the ${selectedSection} section (full document mode): ${currentInput}`,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        console.log(`✅ Full document edit completed successfully`);
        console.log('Updated newsletter length:', updatedNewsletterHTML.length);
        console.log('Newsletter update sent to parent component');
        
        setCurrentInput('');
        setIsLoading(false);
        return;
      }

      // Step 2: Minify the extracted section
      const minifiedSection = editor.minifySection(extractedSection);

      const systemPrompt = `You are a newsletter section editor. You will receive a minified HTML section and an instruction.

IMPORTANT:
- Only modify the provided HTML section according to the instruction
- Return ONLY the updated HTML section, no explanations or comments
- Maintain all existing structure and styling unless specifically asked to change it
- Preserve all CSS classes, IDs, and attributes unless modification is required
- Do not add extra wrapper elements or change the overall structure

Current section type: ${selectedSection.toUpperCase()}
Section HTML: ${minifiedSection}

User instruction: "${currentInput}"

Return ONLY the modified HTML section:`;

      console.log('Sending to OpenAI - Section length:', minifiedSection.length);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: currentInput },
          ],
          max_tokens: 2000,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const updatedSectionHTML = data.choices?.[0]?.message?.content?.trim();

      if (!updatedSectionHTML) {
        throw new Error('Received empty response from OpenAI');
      }

      console.log('Received updated section from OpenAI:', updatedSectionHTML.substring(0, 200) + '...');

      // Step 4: Replace the section in the full newsletter HTML
      const updatedNewsletterHTML = editor.replaceSection(selectedSection, updatedSectionHTML);
      
      // Step 5: Update the newsletter in the parent component
      onNewsletterUpdate(updatedNewsletterHTML);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `✅ Successfully updated the ${selectedSection} section: ${currentInput}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      console.log(`✅ Section edit completed successfully`);
      console.log('Updated newsletter length:', updatedNewsletterHTML.length);
      console.log('Newsletter update sent to parent component');

    } catch (error: any) {
      console.error('Section edit failed:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Failed to update ${selectedSection} section: ${error.message}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    }

    setCurrentInput('');
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSectionEdit();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="h-full w-full bg-white border-2 border-gray-400 rounded-lg shadow-xl flex flex-col">
              {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Newsletter Editor</h2>
        
        {/* Section Selector */}
        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Section to Edit:
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value as 'header' | 'main' | 'footer')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="header">Header</option>
            <option value="main">Main Content</option>
            <option value="footer">Footer</option>
          </select>
        </div>
        
        <p className="text-xs text-gray-600">
          Editing: <span className="font-bold text-gray-800">{selectedSection.toUpperCase()}</span> section
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">
            <p className="font-semibold mb-2">Section-Based Newsletter Editor</p>
            <p>Select a section above and describe your changes.</p>
            <p className="mt-3 text-xs">
              Examples:<br/>
              • "Change the title to 'Weekly Update'"<br/>
              • "Make the text blue"<br/>
              • "Add a subscribe button"
            </p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg max-w-full ${
              message.role === 'user'
                ? 'bg-blue-100 text-blue-900 ml-2'
                : 'bg-gray-100 text-gray-900 mr-2'
            }`}
          >
            <div className="text-sm font-semibold whitespace-pre-wrap break-words">
              {message.content}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="bg-gray-100 text-gray-900 p-3 rounded-lg mr-2">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              <span className="text-sm font-semibold">Processing {selectedSection} section...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex space-x-2">
          <textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Describe changes for ${selectedSection} section...`}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSectionEdit}
            disabled={isLoading || !currentInput.trim()}
            className="px-4 py-2 text-sm bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isLoading ? '...' : 'Edit'}
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Press Enter to send or click Edit
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;