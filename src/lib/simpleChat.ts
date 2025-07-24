// Simple, Reliable Chat System for Newsletter Editing
// No complex AI processing - just direct HTML manipulation

export interface SimpleChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface SimpleChatSession {
  id: string;
  messages: SimpleChatMessage[];
  currentHtml: string;
}

// Simple Chat Manager
export class SimpleChatManager {
  private sessions: Map<string, SimpleChatSession> = new Map();

  // Create a new chat session
  createSession(initialHtml: string): SimpleChatSession {
    const sessionId = `chat_${Date.now()}`;
    
    const session: SimpleChatSession = {
      id: sessionId,
      messages: [
        {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: `Hi! I can help you edit your newsletter. Try commands like:
• "Remove the button"
• "Change company name to Apple"
• "Update the title"
• "Make text shorter"`,
          timestamp: new Date()
        }
      ],
      currentHtml: initialHtml
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  // Get existing session
  getSession(sessionId: string): SimpleChatSession | null {
    return this.sessions.get(sessionId) || null;
  }

  // Process user message with simple text-based editing
  async processMessage(sessionId: string, userMessage: string): Promise<{ userMessage: SimpleChatMessage; assistantMessage: SimpleChatMessage }> {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    // Create user message
    const userChatMessage: SimpleChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    // Simple text-based editing
    const result = this.performSimpleEdit(userMessage, session.currentHtml);
    
    // Create assistant response
    const assistantMessage: SimpleChatMessage = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: result.message,
      timestamp: new Date()
    };

    // Update session HTML if changes were made
    if (result.modifiedHtml) {
      session.currentHtml = result.modifiedHtml;
    }

    return { userMessage: userChatMessage, assistantMessage };
  }

  // Simple text-based editing (no AI complexity)
  private performSimpleEdit(userRequest: string, currentHtml: string): {
    message: string;
    modifiedHtml?: string;
  } {
    const request = userRequest.toLowerCase();
    let modifiedHtml = currentHtml;
    let changesMade = false;

    // Remove button patterns
    if (request.includes('remove') && request.includes('button')) {
      // Find and remove button elements
      const buttonPatterns = [
        /<span[^>]*>.*?Confirm.*?Spot.*?<\/span>/gi,
        /<span[^>]*>.*?Learn.*?more.*?<\/span>/gi,
        /<span[^>]*>.*?Join.*?now.*?<\/span>/gi,
        /<a[^>]*>.*?button.*?<\/a>/gi,
        /<div[^>]*class="[^"]*button[^"]*"[^>]*>.*?<\/div>/gi
      ];

      buttonPatterns.forEach(pattern => {
        if (pattern.test(modifiedHtml)) {
          modifiedHtml = modifiedHtml.replace(pattern, '');
          changesMade = true;
        }
      });

      if (changesMade) {
        return {
          message: '✅ I\'ve removed the button from your newsletter.',
          modifiedHtml
        };
      }
    }

    // Change company name patterns
    if (request.includes('company') || request.includes('brand')) {
      const newName = this.extractNewName(userRequest);
      if (newName) {
        // Replace "Brand name" with new name
        const brandPattern = /<span[^>]*>Brand name<\/span>/gi;
        if (brandPattern.test(modifiedHtml)) {
          modifiedHtml = modifiedHtml.replace(brandPattern, `<span>${newName}</span>`);
          changesMade = true;
        }
      }

      if (changesMade) {
        return {
          message: `✅ I've updated the company name to "${newName}".`,
          modifiedHtml
        };
      }
    }

    // Update title patterns
    if (request.includes('title') || request.includes('heading')) {
      const newTitle = this.extractNewTitle(userRequest);
      if (newTitle) {
        // Replace main headings - look for any h1 with Social Media content
        const titlePattern = /<h1[^>]*>.*?Social Media.*?<\/h1>/gi;
        if (titlePattern.test(modifiedHtml)) {
          modifiedHtml = modifiedHtml.replace(titlePattern, `<h1 style="margin: 0; color: #393d47; direction: ltr; font-family: Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif; font-size: 42px; font-weight: 700; letter-spacing: normal; line-height: 1.2; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 50px;"><span class="tinyMce-placeholder" style="word-break: break-word;">${newTitle}</span></h1>`);
          changesMade = true;
        }
      }

      if (changesMade) {
        return {
          message: `✅ I've updated the heading to "${newTitle}".`,
          modifiedHtml
        };
      }
    }

    // Make text shorter
    if (request.includes('shorter') || request.includes('condense')) {
      // Shorten Lorem ipsum text
      const loremPattern = /<p[^>]*>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua\. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat\.<\/p>/gi;
      if (loremPattern.test(modifiedHtml)) {
        modifiedHtml = modifiedHtml.replace(loremPattern, '<p style="margin: 0;">Shortened content for better readability.</p>');
        changesMade = true;
      }

      if (changesMade) {
        return {
          message: '✅ I\'ve made the text shorter and more concise.',
          modifiedHtml
        };
      }
    }

    // Default response if no changes made
    return {
      message: 'I understand you want to make changes, but I couldn\'t find the specific elements to modify. Try being more specific about what you want to change.'
    };
  }

  // Extract new name from user request
  private extractNewName(request: string): string | null {
    const patterns = [
      /to\s+([A-Za-z\s]+?)(?:\s|$)/,
      /change\s+.*?\s+to\s+([A-Za-z\s]+?)(?:\s|$)/,
      /update\s+.*?\s+to\s+([A-Za-z\s]+?)(?:\s|$)/
    ];

    for (const pattern of patterns) {
      const match = request.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  // Extract new title from user request
  private extractNewTitle(request: string): string | null {
    const patterns = [
      /to\s+"([^"]+)"/,
      /change\s+.*?\s+to\s+"([^"]+)"/,
      /update\s+.*?\s+to\s+"([^"]+)"/,
      /to\s+([A-Za-z\s]+?)(?:\s|$)/,
      /change\s+.*?\s+to\s+([A-Za-z\s]+?)(?:\s|$)/,
      /update\s+.*?\s+to\s+([A-Za-z\s]+?)(?:\s|$)/
    ];

    for (const pattern of patterns) {
      const match = request.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  // Get chat history
  getChatHistory(sessionId: string): SimpleChatMessage[] {
    const session = this.getSession(sessionId);
    return session ? session.messages : [];
  }

  // Get current HTML
  getCurrentHtml(sessionId: string): string | null {
    const session = this.getSession(sessionId);
    return session ? session.currentHtml : null;
  }
}

// Global chat manager instance
export const simpleChatManager = new SimpleChatManager(); 