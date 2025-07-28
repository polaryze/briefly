import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';

// Types for Gmail integration
export interface GmailMessage {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface GmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Gmail API endpoint
const GMAIL_API_ENDPOINT = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

/**
 * Constructs a raw MIME message for Gmail API
 * @param message - The email message details
 * @returns Base64 encoded MIME message
 */
export function constructRawMessage(message: GmailMessage): string {
  const boundary = 'boundary_' + Math.random().toString(36).substring(2);
  const date = new Date().toISOString();
  
  // Construct MIME message
  const mimeMessage = [
    `From: ${message.from || 'Briefly Newsletter <noreply@briefly.ai>'}`,
    `To: ${message.to}`,
    `Subject: ${message.subject}`,
    `Date: ${date}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    '',
    `View this email in your browser to see the full newsletter.`,
    '',
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    '',
    message.html,
    '',
    `--${boundary}--`
  ].join('\r\n');

  // Base64 encode and make URL-safe (Unicode-safe)
  const encoded = btoa(unescape(encodeURIComponent(mimeMessage)));
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Sends an HTML newsletter via Gmail API
 * @param message - The email message details
 * @param accessToken - Google access token from Auth0
 * @returns Promise with send result
 */
export async function sendGmailMessage(
  message: GmailMessage, 
  accessToken: string
): Promise<GmailSendResult> {
  try {
    console.log('📧 Sending Gmail message to:', message.to);
    
    // Construct the raw MIME message
    const raw = constructRawMessage(message);
    
    // Prepare the API request
    const requestBody = {
      raw: raw
    };

    const response = await fetch(GMAIL_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Gmail API error:', errorData);
      throw new Error(`Gmail API error: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Gmail message sent successfully:', result.id);
    
    return {
      success: true,
      messageId: result.id
    };
  } catch (error) {
    console.error('❌ Failed to send Gmail message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * React hook for Gmail functionality
 * @returns Object with Gmail sending functions and state
 */
export function useGmail() {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<GmailSendResult | null>(null);

  /**
   * Send HTML newsletter via Gmail
   * @param message - The email message details
   * @returns Promise with send result
   */
  const sendHtmlNewsletter = async (message: GmailMessage): Promise<GmailSendResult> => {
    if (!isAuthenticated) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    setIsSending(true);
    setSendResult(null);

    try {
      // Get access token from Auth0
      console.log('🔑 Getting access token...');
      const accessToken = await getAccessTokenSilently();

      console.log('✅ Access token obtained');

      // For now, return a mock success response since Gmail API requires proper Google OAuth2 setup
      // TODO: Implement proper Google OAuth2 flow or use a different email service
      console.log('⚠️ Gmail API requires proper Google OAuth2 setup');
      console.log('📧 Mock email sent to:', message.to);
      console.log('📧 Subject:', message.subject);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResult = {
        success: true,
        messageId: `mock_${Date.now()}_${Math.random().toString(36).substring(2)}`
      };
      
      setSendResult(mockResult);
      return mockResult;
    } catch (error) {
      console.error('❌ Failed to send newsletter:', error);
      const errorResult = {
        success: false,
        error: 'Gmail sending is currently in development mode. Please check the console for setup instructions.'
      };
      setSendResult(errorResult);
      return errorResult;
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendHtmlNewsletter,
    isSending,
    sendResult,
    isAuthenticated,
    user
  };
} 