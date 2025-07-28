# Gmail API Integration Setup Guide

## Current Issue
The error "Missing Refresh Token" occurs because Auth0 is not properly configured to work with Google OAuth2 for Gmail API access.

## Solutions

### Option 1: Configure Auth0 with Google APIs (Recommended)

#### Step 1: Set up Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

#### Step 2: Create OAuth2 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `https://your-auth0-domain.auth0.com/oauth/token`
   - `https://your-auth0-domain.auth0.com/oauth/authorize`
5. Note down the Client ID and Client Secret

#### Step 3: Configure Auth0
1. Go to your Auth0 Dashboard
2. Navigate to "Applications" > Your App
3. Go to "Addons" tab
4. Enable "Google OAuth2" addon
5. Configure with your Google Client ID and Secret
6. Add scopes: `https://www.googleapis.com/auth/gmail.send`

#### Step 4: Update Application Code
```typescript
// In src/App.tsx
const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: `${window.location.origin}/auth/callback`,
    scope: 'openid profile email https://www.googleapis.com/auth/gmail.send',
    audience: 'https://www.googleapis.com/auth/gmail.send'
  },
  useRefreshTokens: true,
  cacheLocation: 'localstorage'
};
```

### Option 2: Use a Different Email Service

#### Alternative 1: SendGrid
```bash
npm install @sendgrid/mail
```

```typescript
// In src/lib/email.ts
import sgMail from '@sendgrid/mail';

export async function sendEmailWithSendGrid(message: any) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: message.to,
    from: 'your-verified-sender@yourdomain.com',
    subject: message.subject,
    html: message.html,
  };
  
  return sgMail.send(msg);
}
```

#### Alternative 2: Resend
```bash
npm install resend
```

```typescript
// In src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailWithResend(message: any) {
  return resend.emails.send({
    from: 'onboarding@resend.dev',
    to: message.to,
    subject: message.subject,
    html: message.html,
  });
}
```

#### Alternative 3: EmailJS
```bash
npm install emailjs-com
```

```typescript
// In src/lib/email.ts
import emailjs from 'emailjs-com';

export async function sendEmailWithEmailJS(message: any) {
  return emailjs.send(
    'YOUR_SERVICE_ID',
    'YOUR_TEMPLATE_ID',
    {
      to_email: message.to,
      subject: message.subject,
      message_html: message.html,
    },
    'YOUR_USER_ID'
  );
}
```

### Option 3: Backend Proxy (Current Implementation)

The current implementation uses a mock response to demonstrate the UI flow. To implement a real backend proxy:

#### Backend Implementation
```javascript
// server.cjs
app.post('/api/send-email', async (req, res) => {
  const { to, subject, html } = req.body;
  
  // Use any email service here
  // Example with nodemailer
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    html: html
  };
  
  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## Environment Variables

### For Google OAuth2 Setup
```env
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### For SendGrid
```env
VITE_SENDGRID_API_KEY=your-sendgrid-api-key
```

### For Resend
```env
VITE_RESEND_API_KEY=your-resend-api-key
```

## Testing

### Test Gmail API Setup
```javascript
// Test in browser console
const { getAccessTokenSilently } = useAuth0();
const token = await getAccessTokenSilently({
  authorizationParams: {
    audience: 'https://www.googleapis.com/auth/gmail.send',
    scope: 'https://www.googleapis.com/auth/gmail.send'
  }
});
console.log('Token:', token);
```

### Test Email Service
```javascript
// Test email sending
const result = await sendHtmlNewsletter({
  to: 'test@example.com',
  subject: 'Test Newsletter',
  html: '<h1>Test</h1>'
});
console.log('Result:', result);
```

## Troubleshooting

### Common Issues

1. **"Missing Refresh Token"**
   - Auth0 not configured for Google OAuth2
   - Solution: Follow Option 1 setup

2. **"Invalid Credentials"**
   - Google API credentials not set up correctly
   - Solution: Verify Google Cloud Console setup

3. **"CORS Error"**
   - Backend proxy not configured
   - Solution: Set up proper CORS headers

4. **"Rate Limit Exceeded"**
   - Too many API calls
   - Solution: Implement rate limiting

## Next Steps

1. Choose an email service option
2. Set up the required credentials
3. Update the code to use the chosen service
4. Test the email sending functionality
5. Deploy the changes

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Implement proper error handling
- Add rate limiting for production use 