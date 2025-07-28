# Domain Setup Guide for Briefly

## Issues Fixed

### ✅ **1. Newsletter Template Images**
- **Problem**: Newsletter template images were missing because `newslettersample6` directory wasn't in the public folder
- **Solution**: Copied `example_newsletters/newslettersample6` to `public/example_newsletters/`
- **Status**: ✅ **FIXED** - All template images are now accessible

### ✅ **2. Newsletter Generation on Domain**
- **Problem**: Newsletter generation not working on domain due to missing API keys
- **Solution**: Enhanced error handling and API key validation
- **Status**: ✅ **FIXED** - Better error messages and validation

## Required Environment Variables

For the application to work properly on your domain, you need to set these environment variables:

### **Production Environment Variables**

```env
# OpenAI Configuration (Required for newsletter generation)
VITE_OPENAI_API_KEY=sk-your_openai_api_key_here

# RapidAPI Configuration (Required for social media data)
VITE_RAPIDAPI_KEY=your_rapidapi_key_here

# Auth0 Configuration (Required for authentication)
VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=your_auth0_audience

# Google OAuth2 Configuration (Required for Gmail sending)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## Setup Steps

### **1. Get API Keys**

#### **OpenAI API Key**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)

#### **RapidAPI Key**
1. Go to [RapidAPI](https://rapidapi.com/)
2. Sign up/Login
3. Get your API key from the dashboard
4. Subscribe to these APIs:
   - Twitter241 API
   - Instagram Basic Display API
   - YouTube Data API v3

### **2. Configure Environment Variables**

#### **For Vercel Deployment:**
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable from the list above

#### **For Other Hosting Platforms:**
- Add the environment variables in your hosting platform's dashboard
- Ensure all variables are prefixed with `VITE_`

### **3. Test the Setup**

1. **Check API Keys**: The app will now show clear error messages if API keys are missing
2. **Test Newsletter Generation**: Try generating a newsletter with a social media handle
3. **Test Gmail Sending**: Try sending a newsletter via Gmail

## Error Messages

The application now provides clear error messages:

- **"OpenAI API key not configured"** → Set `VITE_OPENAI_API_KEY`
- **"RapidAPI key not configured"** → Set `VITE_RAPIDAPI_KEY`
- **"Newsletter generation is not working on the domain"** → Check all API keys are set

## Troubleshooting

### **If Newsletter Generation Still Fails:**

1. **Check Browser Console**: Look for specific API errors
2. **Verify API Keys**: Ensure keys are properly formatted
3. **Test API Endpoints**: Verify your RapidAPI subscriptions are active
4. **Check CORS**: Ensure your domain is allowed in API settings

### **If Images Still Don't Load:**

1. **Clear Browser Cache**: Hard refresh the page (Ctrl+F5)
2. **Check Network Tab**: Look for 404 errors on image requests
3. **Verify File Paths**: Ensure images are in `public/example_newsletters/newslettersample6/images/`

## Security Notes

- **Never commit API keys** to version control
- **Use environment variables** for all sensitive data
- **Rotate API keys** regularly
- **Monitor API usage** to avoid rate limits

## Support

If you're still experiencing issues:

1. Check the browser console for specific error messages
2. Verify all environment variables are set correctly
3. Test with a simple social media handle first
4. Contact support with the specific error message 