# Auth0 Setup Guide for Briefly

## Step 1: Create Auth0 Account and Application

1. **Sign up for Auth0**: Go to [auth0.com](https://auth0.com) and create a free account
2. **Create a new application**:
   - In the Auth0 Dashboard, go to "Applications" 
   - Click "Create Application"
   - Choose "Single Page Application" (SPA)
   - Name it "Briefly" or similar

## Step 2: Configure Application Settings

In your Auth0 application settings, configure:

### Allowed Callback URLs:
```
http://localhost:5173/auth/callback, https://www.usebriefly.io/auth/callback, https://usebriefly.io/auth/callback
```

### Allowed Logout URLs:
```
http://localhost:5173, https://www.usebriefly.io, https://usebriefly.io
```

### Allowed Web Origins:
```
http://localhost:5173, https://www.usebriefly.io, https://usebriefly.io
```

### Allowed Origins (CORS):
```
http://localhost:5173, https://www.usebriefly.io, https://usebriefly.io
```

## Step 3: Get Your Auth0 Credentials

From your Auth0 application settings, copy:
- **Domain** (e.g., `dev-abc123.us.auth0.com`)
- **Client ID** (e.g., `ABC123XYZ456...`)

## Step 4: Set Environment Variables

Create a `.env` file in your project root with:

```bash
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=https://your-auth0-domain.auth0.com/api/v2/
VITE_AUTH0_SCOPE=openid profile email

# API Keys (if needed)
VITE_OPENAI_API_KEY=your-openai-key
VITE_RAPIDAPI_KEY=your-rapidapi-key
```

## Step 5: Configure Vercel Environment Variables

In your Vercel dashboard, add these environment variables:
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE`
- `VITE_AUTH0_SCOPE`

## Step 6: Test Authentication

1. Start your dev server: `npm run dev`
2. Navigate to `/signin`
3. Click "Sign In with Auth0"
4. Complete the Auth0 login flow
5. You should be redirected back to your app

## Troubleshooting

### "Auth0 configuration error"
- Check that all environment variables are set correctly
- Verify your Auth0 domain and client ID

### "Callback URL mismatch"
- Ensure your callback URLs are correctly configured in Auth0
- Check that the redirect URI matches exactly

### "Origin not allowed"
- Add your domain to "Allowed Web Origins" in Auth0
- Include both localhost and production URLs

## Current Auth0 Configuration in Code

The app is configured with:
- **Cache Location**: localStorage
- **Use Refresh Tokens**: true
- **Redirect URI**: `${window.location.origin}/auth/callback`
- **Scope**: openid profile email
