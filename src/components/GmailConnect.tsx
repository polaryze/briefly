import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { GmailService } from '@/lib/gmail-service'
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'

interface GmailConnectProps {
  newsletterContent?: string
  newsletterTitle?: string
}

export function GmailConnect({ newsletterContent, newsletterTitle }: GmailConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [recipients, setRecipients] = useState('')
  const [subject, setSubject] = useState(newsletterTitle || 'My Newsletter')
  const [isConnected, setIsConnected] = useState(false)
  const { toast } = useToast()

  const handleConnectGmail = async () => {
    setIsConnecting(true)
    try {
      const authUrl = await GmailService.connectGmail()
      window.location.href = authUrl
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect Gmail. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSendNewsletter = async () => {
    if (!recipients.trim()) {
      toast({
        title: 'Missing Recipients',
        description: 'Please enter at least one email address.',
        variant: 'destructive',
      })
      return
    }

    if (!newsletterContent) {
      toast({
        title: 'No Newsletter Content',
        description: 'Please generate a newsletter first.',
        variant: 'destructive',
      })
      return
    }

    setIsSending(true)
    try {
      const emailList = recipients.split(',').map(email => email.trim())
      
      await GmailService.sendNewsletter({
        to: emailList,
        subject: subject,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>${subject}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
              .content { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${subject}</h1>
              </div>
              <div class="content">
                ${newsletterContent.replace(/\n/g, '<br>')}
              </div>
              <div class="footer">
                <p>Sent with ❤️ from Briefly</p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: newsletterContent,
      })

      toast({
        title: 'Newsletter Sent!',
        description: `Successfully sent newsletter to ${emailList.length} recipient(s).`,
      })

      // Clear form
      setRecipients('')
      setSubject('')
    } catch (error) {
      toast({
        title: 'Send Failed',
        description: error instanceof Error ? error.message : 'Failed to send newsletter.',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Gmail Integration
        </CardTitle>
        <CardDescription>
          Connect your Gmail account to send newsletters directly to your subscribers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Gmail account not connected
            </div>
            <Button 
              onClick={handleConnectGmail} 
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? 'Connecting...' : 'Connect Gmail Account'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Gmail account connected
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recipients">Recipients (comma-separated)</Label>
              <Input
                id="recipients"
                placeholder="email1@example.com, email2@example.com"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Newsletter Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleSendNewsletter} 
              disabled={isSending || !newsletterContent}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSending ? 'Sending...' : 'Send Newsletter'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 