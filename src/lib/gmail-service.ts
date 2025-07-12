import { supabase } from './supabase'

export interface NewsletterEmail {
  to: string[]
  subject: string
  htmlContent: string
  textContent: string
}

export interface GmailCredentials {
  access_token: string
  refresh_token: string
  scope: string
  token_type: string
  expiry_date: number
}

export class GmailService {
  private static async getGmailCredentials(): Promise<GmailCredentials | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_gmail_credentials')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting Gmail credentials:', error)
      return null
    }
  }

  private static async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${data.error}`)
    }

    return data.access_token
  }

  static async sendNewsletter(newsletter: NewsletterEmail): Promise<boolean> {
    try {
      const credentials = await this.getGmailCredentials()
      if (!credentials) {
        throw new Error('Gmail credentials not found. Please connect your Gmail account.')
      }

      // Check if token needs refresh
      const now = Date.now()
      if (now >= credentials.expiry_date) {
        const newAccessToken = await this.refreshAccessToken(credentials.refresh_token)
        credentials.access_token = newAccessToken
        credentials.expiry_date = now + 3600000 // 1 hour from now
      }

      // Create email message
      const message = this.createEmailMessage(newsletter)
      
      // Send email via Gmail API
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: message,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Failed to send email: ${error.error?.message || 'Unknown error'}`)
      }

      return true
    } catch (error) {
      console.error('Error sending newsletter:', error)
      throw error
    }
  }

  private static createEmailMessage(newsletter: NewsletterEmail): string {
    const email = {
      to: newsletter.to.join(', '),
      subject: newsletter.subject,
      html: newsletter.htmlContent,
      text: newsletter.textContent,
    }

    const emailContent = [
      `To: ${email.to}`,
      `Subject: ${email.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      email.html,
    ].join('\r\n')

    return Buffer.from(emailContent).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
  }

  static async connectGmail(): Promise<string> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email',
        },
      },
    })

    if (error) throw error
    return data.url || ''
  }

  static async saveGmailCredentials(credentials: GmailCredentials): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('user_gmail_credentials')
        .upsert({
          user_id: user.id,
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token,
          scope: credentials.scope,
          token_type: credentials.token_type,
          expiry_date: credentials.expiry_date,
        })

      if (error) throw error
    } catch (error) {
      console.error('Error saving Gmail credentials:', error)
      throw error
    }
  }
} 