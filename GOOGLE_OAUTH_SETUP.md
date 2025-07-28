# Google OAuth2 Setup Guide

## Your Google Credentials
- **Client ID**: `your_google_client_id_here`
- **Client Secret**: `your_google_client_secret_here`

## Security Warning ⚠️
**IMPORTANT**: Never commit your client secret to version control. The client secret should be kept private and secure.

## Setup Steps

### 1. Create Environment File
Create a `.env` file in your project root with the following content:

```env
# Google OAuth2 Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Auth0 Configuration
VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=your_auth0_audience
VITE_AUTH0_SCOPE=openid profile email https://www.googleapis.com/auth/gmail.send

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key

# RapidAPI Configuration
VITE_RAPIDAPI_KEY=your_rapidapi_key

# Custom Domain (Production)
VITE_CUSTOM_DOMAIN=https://usebriefly.io
```

### 2. Configure Auth0
In your Auth0 Dashboard:

1. **Go to Applications** → Your App
2. **Add Google as a Social Connection**:
   - Go to Authentication → Social
   - Add Google connection
   - Use your Google Client ID and Secret
   - Add scopes: `https://www.googleapis.com/auth/gmail.send`

3. **Update Application Settings**:
   - Add callback URLs: `http://localhost:8080/auth/callback`
   - Add logout URLs: `http://localhost:8080`

### 3. Google Cloud Console Setup
1. **Enable Gmail API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project
   - Go to APIs & Services → Library
   - Search for "Gmail API" and enable it

2. **Configure OAuth Consent Screen**:
   - Go to APIs & Services → OAuth consent screen
   - Add your domain to authorized domains
   - Add scopes: `https://www.googleapis.com/auth/gmail.send`

3. **Verify Credentials**:
   - Go to APIs & Services → Credentials
   - Verify your OAuth2 client ID is configured correctly
   - Add authorized redirect URIs for Auth0

### 4. Update Application Code
The application code has already been updated to use Google OAuth2 scopes. The key changes are in:

- `src/App.tsx`: Added Gmail scope to Auth0 config
- `src/lib/gmail.ts`: Updated to request Google access tokens

### 5. Testing
1. **Start your development server**: `npm run dev`
2. **Sign in** with Google account
3. **Test Gmail sending** functionality
4. **Check browser console** for any authentication errors

## Troubleshooting

### Common Issues:
1. **"Invalid authentication credentials"**: Check that Google OAuth2 is properly configured in Auth0
2. **"Scope not authorized"**: Ensure Gmail API is enabled in Google Cloud Console
3. **"Redirect URI mismatch"**: Verify callback URLs in both Auth0 and Google Cloud Console

### Debug Steps:
1. Check browser console for authentication errors
2. Verify Auth0 configuration in dashboard
3. Test Google OAuth2 flow independently
4. Check Google Cloud Console for API quotas and errors

## Security Best Practices
- ✅ Store credentials in environment variables
- ✅ Never commit `.env` files to version control
- ✅ Use HTTPS in production
- ✅ Regularly rotate client secrets
- ✅ Monitor API usage and quotas 