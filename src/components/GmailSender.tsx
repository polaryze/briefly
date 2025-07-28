import React, { useState } from 'react';
import { useGmail, GmailMessage } from '../lib/gmail';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Mail, CheckCircle, XCircle } from 'lucide-react';

interface GmailSenderProps {
  newsletterHtml: string;
  onSendComplete?: (success: boolean) => void;
}

export function GmailSender({ newsletterHtml, onSendComplete }: GmailSenderProps) {
  const { sendHtmlNewsletter, isSending, sendResult, isAuthenticated } = useGmail();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('Your Newsletter from Briefly');
  const [showForm, setShowForm] = useState(false);

  const handleSend = async () => {
    if (!recipientEmail.trim()) {
      alert('Please enter a recipient email address');
      return;
    }

    const message: GmailMessage = {
      to: recipientEmail.trim(),
      subject: subject.trim(),
      html: newsletterHtml,
      from: 'Briefly Newsletter <noreply@briefly.ai>'
    };

    const result = await sendHtmlNewsletter(message);
    
    if (onSendComplete) {
      onSendComplete(result.success);
    }
  };

  const handleOpenForm = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setRecipientEmail('');
    setSubject('Your Newsletter from Briefly');
  };

  if (!isAuthenticated) {
    return (
      <Alert>
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Please log in with Google to send newsletters via Gmail.
        </AlertDescription>
      </Alert>
    );
  }

  if (!showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Newsletter
          </CardTitle>
          <CardDescription>
            Send your newsletter directly via Gmail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleOpenForm} className="w-full">
            <Mail className="h-4 w-4 mr-2" />
            Send via Gmail
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Send Newsletter via Gmail
        </CardTitle>
        <CardDescription>
          Enter recipient details to send your newsletter
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient-email">Recipient Email</Label>
          <Input
            id="recipient-email"
            type="email"
            placeholder="subscriber@example.com"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            disabled={isSending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject Line</Label>
          <Input
            id="subject"
            type="text"
            placeholder="Your Newsletter from Briefly"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSending}
          />
        </div>

        {sendResult && (
          <Alert className={sendResult.success ? 'border-green-500' : 'border-red-500'}>
            {sendResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription>
              {sendResult.success 
                ? `Newsletter sent successfully! Message ID: ${sendResult.messageId}`
                : `Failed to send newsletter: ${sendResult.error}`
              }
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleSend} 
            disabled={isSending || !recipientEmail.trim()}
            className="flex-1"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Newsletter
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCloseForm}
            disabled={isSending}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 