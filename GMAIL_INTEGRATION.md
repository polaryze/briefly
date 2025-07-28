# Gmail API Integration Guide

## Current Status
The Gmail sending functionality is currently set to mock mode because proper Google OAuth2 setup is required for Gmail API access.

## Error Explanation
The error "Request had invalid authentication credentials" occurs because:
1. Auth0 access tokens are not Google access tokens
2. Gmail API requires Google OAuth2 authentication
3. The current Auth0 setup doesn't include Google API scopes

## Solutions

### Option 1: Configure Auth0 with Google APIs (Recommended)
1. **Set up Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Gmail API
   - Create OAuth2 credentials

2. **Configure Auth0**:
   - In Auth0 Dashboard, go to Applications > Your App
   - Add Google as a Social Connection
   - Configure with your Google OAuth2 credentials
   - Add Gmail scopes: `https://www.googleapis.com/auth/gmail.send`

3. **Update Application Code**:
   - Modify Auth0 configuration to include Google scopes
   - Update Gmail library to use Google access tokens

### Option 2: Use Alternative Email Service
Consider using services like:
- **SendGrid**: Easy to integrate, good deliverability
- **Mailgun**: Developer-friendly, good API
- **Resend**: Modern email API, good documentation
- **AWS SES**: Cost-effective for high volume

### Option 3: Backend Email Service
Create a backend service that handles email sending:
- Use NodeMailer with SMTP
- Integrate with email service providers
- Handle authentication server-side

## Current Implementation
The current implementation shows a mock success response to demonstrate the UI flow. To enable real Gmail sending, follow Option 1 above.

## Files to Update
- `src/App.tsx`: Add Google scopes to Auth0 config
- `src/lib/gmail.ts`: Update to use Google access tokens
- `src/components/GmailSender.tsx`: Update error handling

## Testing
Once properly configured, test with:
1. Small test emails first
2. Check Gmail API quotas
3. Monitor for authentication errors
4. Verify email delivery

## Security Considerations
- Store Google credentials securely
- Use environment variables for sensitive data
- Implement proper error handling
- Add rate limiting for email sending 