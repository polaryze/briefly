// Smart Chat System for Newsletter Editing
// Simplified approach for reliable HTML generation

import { getTemplateProfile } from './templateIntelligence';
import { configManager } from './config';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  editRequest?: {
    templateId: string;
    originalHtml: string;
    modifiedHtml?: string;
    confidence: number;
    editType: string;
  };
}

export interface ChatSession {
  id: string;
  templateId: string;
  messages: ChatMessage[];
  currentHtml: string;
  changes: ChangeHistory[];
  created: Date;
  lastActivity: Date;
}

interface ChangeHistory {
  id: string;
  userRequest: string;
  changeType: 'text' | 'remove' | 'add' | 'modify';
  targetElement: string;
  oldValue?: string;
  newValue?: string;
  timestamp: Date;
}

// AI Chat Response Interface
interface AIResponse {
  content: string;
  htmlChanges?: string;
  confidence: number;
  editType: string;
}

// Smart Chat Manager
export class SmartChatManager {
  private sessions: Map<string, ChatSession> = new Map();

  // Create a new chat session for a template
  createSession(templateId: string, initialHtml: string): ChatSession {
    console.log('🔗 Creating chat session for template:', templateId);
    
    const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const templateProfile = getTemplateProfile(templateId);
    
    console.log('📋 Template profile found:', templateProfile?.name || 'Not found');
    
    const session: ChatSession = {
      id: sessionId,
      templateId,
      messages: [
        {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: `Hi! I'm here to help you edit your ${templateProfile?.name || 'newsletter'} template. I understand all the editable elements in this template and can help you make changes like:

• Updating company/brand names
• Changing social media post content
• Modifying engagement numbers
• Replacing images
• Updating dates and timestamps
• Changing call-to-action text

Just tell me what you'd like to change and I'll help you edit it!`,
          timestamp: new Date()
        }
      ],
      currentHtml: initialHtml,
      changes: [],
      created: new Date(),
      lastActivity: new Date()
    };

    this.sessions.set(sessionId, session);
    console.log('✅ Chat session created with ID:', sessionId);
    return session;
  }

  // Get existing session
  getSession(sessionId: string): ChatSession | null {
    return this.sessions.get(sessionId) || null;
  }

  // Process user message and generate AI response
  async processMessage(
    sessionId: string, 
    userMessage: string
  ): Promise<{ message: ChatMessage; response: ChatMessage }> {
    console.log('📨 Processing message for session:', sessionId);
    
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    // Add user message to session
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    session.messages.push(userMsg);
    session.lastActivity = new Date();

    // Analyze edit intent
    const editIntent = this.analyzeEditIntent(userMessage);
    console.log('🎯 Edit intent:', editIntent);

    // Generate AI response
    const aiResponse = await this.generateAIResponse(
      session.templateId,
      userMessage,
      session.currentHtml,
      editIntent
    );

    // Create AI response message
    const aiMsg: ChatMessage = {
      id: `msg_${Date.now()}_ai`,
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date(),
      editRequest: {
        templateId: session.templateId,
        originalHtml: session.currentHtml,
        modifiedHtml: aiResponse.htmlChanges,
        confidence: aiResponse.confidence,
        editType: aiResponse.editType
      }
    };

    session.messages.push(aiMsg);
    session.lastActivity = new Date();

    // Track the change
    const change: ChangeHistory = {
      id: `change_${Date.now()}`,
      userRequest: userMessage,
      changeType: this.determineChangeType(userMessage),
      targetElement: editIntent.editType,
      oldValue: session.currentHtml,
      newValue: aiResponse.htmlChanges,
      timestamp: new Date()
    };

    session.changes.push(change);

    // Update session HTML if changes were made
    if (aiResponse.htmlChanges) {
      session.currentHtml = aiResponse.htmlChanges;
      console.log('📝 Updated session HTML with changes');
    }

    console.log('📨 Chat result received:', { message: userMsg, response: aiMsg });
    return { message: userMsg, response: aiMsg };
  }

  // Generate AI response using OpenAI with simplified approach
  private async generateAIResponse(
    templateId: string,
    userRequest: string,
    currentHtml: string,
    editIntent: any
  ): Promise<AIResponse> {
    try {
      console.log('🤖 Starting AI response generation...');
      console.log('Template ID:', templateId);
      console.log('User request:', userRequest);

      // Validate OpenAI API key
      const openaiValidation = configManager.validateOpenAIKey();
      if (!openaiValidation.isValid) {
        console.error('❌ OpenAI validation failed:', openaiValidation.error);
        throw new Error(openaiValidation.error);
      }

      const OPENAI_API_KEY = configManager.getOpenAIKey();
      console.log('✅ OpenAI API key validated');

      // Create a simplified, focused prompt
      const prompt = this.createSimplifiedPrompt(templateId, userRequest, currentHtml);
      console.log('📝 Generated simplified prompt, length:', prompt.length);

      // Call OpenAI API with higher token limit
      console.log('🌐 Calling OpenAI API...');
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a newsletter HTML editor. Return ONLY complete, valid HTML documents. Never return partial HTML or explanatory text."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 4000, // Increased token limit
          temperature: 0.1 // Lower temperature for more precise editing
        })
      });

      console.log('📡 OpenAI API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI API error response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const aiResponse = await response.json();
      console.log('🎯 OpenAI API response received:', aiResponse);
      
      const aiContent = aiResponse.choices?.[0]?.message?.content?.trim() || '';
      console.log('💬 AI content length:', aiContent.length);
      console.log('💬 AI content preview:', aiContent.substring(0, 300));
      console.log('💬 AI content contains HTML:', aiContent.includes('<'));

      // Extract and validate HTML changes
      const htmlChanges = this.extractAndValidateHtml(aiContent, currentHtml);
      console.log('🔧 Extracted HTML changes:', htmlChanges ? 'Yes' : 'No');
      console.log('🔧 HTML changes length:', htmlChanges?.length || 0);

      const result = {
        content: this.formatUserFriendlyResponse(aiContent, editIntent),
        htmlChanges,
        confidence: editIntent.confidence,
        editType: editIntent.editType
      };

      console.log('✅ AI response generation complete:', result);
      return result;

    } catch (error) {
      console.error('❌ AI response generation error:', error);
      return {
        content: `I apologize, but I encountered an error while processing your request. The error was: ${error.message}. Please try rephrasing your request or contact support if the issue persists.`,
        confidence: 0,
        editType: 'error'
      };
    }
  }

  // Create a simplified, focused prompt
  private createSimplifiedPrompt(templateId: string, userRequest: string, currentHtml: string): string {
    const profile = getTemplateProfile(templateId);
    
    return `EDIT REQUEST: "${userRequest}"

TEMPLATE: ${profile?.name || 'Newsletter'} (${templateId})

INSTRUCTIONS:
1. Analyze the user's request
2. Find the relevant elements in the HTML
3. Make ONLY the requested changes
4. Return the COMPLETE modified HTML document

CRITICAL REQUIREMENTS:
- Return ONLY the complete HTML from <!DOCTYPE> to </html>
- Include ALL original content not being changed
- Ensure proper opening and closing tags
- Maintain email client compatibility
- Do not include any explanatory text or comments

CURRENT HTML:
${currentHtml.substring(0, 2000)}${currentHtml.length > 2000 ? '...' : ''}

EDITABLE ELEMENTS:
${profile?.editableElements?.map(el => `- ${el.description}: ${el.selector}`).join('\n') || 'All text and image elements'}

RESPONSE FORMAT:
Return ONLY the complete modified HTML document. Start with <!DOCTYPE html> and end with </html>.`;
  }

  // Extract and validate HTML with improved logic
  private extractAndValidateHtml(aiContent: string, currentHtml: string): string | undefined {
    console.log('🔍 Extracting and validating HTML...');
    
    // Clean up markdown-wrapped HTML if present
    let cleanContent = aiContent;
    if (aiContent.includes('```html')) {
      console.log('🧹 Found markdown-wrapped HTML, cleaning...');
      const htmlMatch = aiContent.match(/```html\s*([\s\S]*?)\s*```/);
      if (htmlMatch) {
        cleanContent = htmlMatch[1].trim();
        console.log('✅ Extracted HTML from markdown, new length:', cleanContent.length);
      }
    } else if (aiContent.includes('```')) {
      console.log('🧹 Found markdown-wrapped content, cleaning...');
      const codeMatch = aiContent.match(/```\s*([\s\S]*?)\s*```/);
      if (codeMatch) {
        cleanContent = codeMatch[1].trim();
        console.log('✅ Extracted content from markdown, new length:', cleanContent.length);
      }
    }

    // Check if content contains HTML
    if (!cleanContent.includes('<!DOCTYPE') && !cleanContent.includes('<html')) {
      console.log('❌ No HTML found in AI response');
      return undefined;
    }

    // Extract HTML from explanatory text if needed
    if (cleanContent.includes('<!DOCTYPE') || cleanContent.includes('<html')) {
      const htmlStartMatch = cleanContent.match(/(<!DOCTYPE[\s\S]*?<\/html>)/i);
      if (htmlStartMatch) {
        cleanContent = htmlStartMatch[1];
        console.log('✅ Extracted complete HTML, length:', cleanContent.length);
      } else {
        // Try to find partial HTML and complete it
        const partialHtmlMatch = cleanContent.match(/(<!DOCTYPE[\s\S]*)/i);
        if (partialHtmlMatch) {
          cleanContent = this.completeIncompleteHtml(partialHtmlMatch[1]);
          console.log('🔧 Completed incomplete HTML, new length:', cleanContent.length);
        }
      }
    }

    // Validate HTML structure
    const isValid = this.validateHtmlStructure(cleanContent);
    if (!isValid) {
      console.log('❌ HTML structure validation failed');
      return undefined;
    }

    console.log('✅ HTML extraction and validation successful');
    return cleanContent;
  }

  // Complete incomplete HTML
  private completeIncompleteHtml(partialHtml: string): string {
    console.log('🔧 Completing incomplete HTML...');
    
    let completedHtml = partialHtml;
    
    // Add missing closing tags
    if (!completedHtml.includes('</html>')) {
      if (!completedHtml.includes('</body>')) {
        // Find the last complete element
        const lastCompleteMatch = completedHtml.match(/(.*<\/table>|.*<\/div>|.*<\/section>|.*<\/article>|.*<\/p>|.*<\/h[1-6]>)/s);
        if (lastCompleteMatch) {
          completedHtml = lastCompleteMatch[1] + '\n</body>\n</html>';
        } else {
          // If no complete elements found, just add closing tags
          completedHtml = completedHtml + '\n</body>\n</html>';
        }
      } else {
        completedHtml = completedHtml + '\n</html>';
      }
    }
    
    // Ensure all table structures are complete
    if (completedHtml.includes('<table') && !completedHtml.includes('</table>')) {
      const tableMatch = completedHtml.match(/(.*<table[^>]*>.*<\/table>)/s);
      if (tableMatch) {
        completedHtml = tableMatch[1] + '\n</body>\n</html>';
      }
    }
    
    console.log('✅ HTML completion finished');
    return completedHtml;
  }

  // Validate HTML structure
  private validateHtmlStructure(html: string): boolean {
    const hasDoctype = html.includes('<!DOCTYPE');
    const hasHtml = html.includes('<html') && html.includes('</html>');
    const hasBody = html.includes('<body') && html.includes('</body>');
    const hasContent = html.length > 1000; // Reasonable minimum length
    
    const isValid = hasDoctype && hasHtml && hasBody && hasContent;
    
    console.log('📊 HTML Structure Validation:', {
      hasDoctype,
      hasHtml,
      hasBody,
      hasContent,
      length: html.length,
      isValid
    });
    
    return isValid;
  }

  // Simple edit intent analysis
  private analyzeEditIntent(userRequest: string): any {
    const request = userRequest.toLowerCase();
    
    if (request.includes('remove')) {
      return { editType: 'remove', confidence: 0.8 };
    } else if (request.includes('change') || request.includes('update')) {
      return { editType: 'modify', confidence: 0.7 };
    } else if (request.includes('add')) {
      return { editType: 'add', confidence: 0.6 };
    } else {
      return { editType: 'general', confidence: 0.5 };
    }
  }

  // Format user-friendly response
  private formatUserFriendlyResponse(aiContent: string, editIntent: any): string {
    if (aiContent.includes('<!DOCTYPE') || aiContent.includes('<html')) {
      return `I've successfully made the requested changes to your newsletter. The HTML has been updated with your modifications.`;
    } else {
      return `I understand your request: "${editIntent.editType}". However, I wasn't able to generate valid HTML changes. Please try rephrasing your request or be more specific about what you'd like to change.`;
    }
  }

  // Get chat history
  getChatHistory(sessionId: string): ChatMessage[] {
    const session = this.getSession(sessionId);
    return session?.messages || [];
  }

  // Apply edit to session
  async applyEdit(sessionId: string, messageId: string): Promise<string | null> {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const message = session.messages.find(m => m.id === messageId);
    if (!message?.editRequest?.modifiedHtml) return null;

    session.currentHtml = message.editRequest.modifiedHtml;
    return message.editRequest.modifiedHtml;
  }

  // Get current HTML
  getCurrentHtml(sessionId: string): string | null {
    const session = this.getSession(sessionId);
    return session?.currentHtml || null;
  }

  // Determine change type
  private determineChangeType(userRequest: string): 'text' | 'remove' | 'add' | 'modify' {
    const request = userRequest.toLowerCase();
    if (request.includes('remove')) return 'remove';
    if (request.includes('add')) return 'add';
    if (request.includes('change') || request.includes('update')) return 'modify';
    return 'text';
  }
}

// Export singleton instance
export const chatManager = new SmartChatManager(); 