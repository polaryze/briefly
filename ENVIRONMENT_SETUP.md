# 🔧 Environment Variables Setup Guide

This guide will help you set up all required environment variables for the Briefly.ai application.

## 📋 Required Environment Variables

### **Frontend Variables (VITE_ prefix)**
These are safe to expose in the client:

```env
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_SCOPE=openid profile email
VITE_CUSTOM_DOMAIN=your-custom-domain.com
```

### **Server-side Variables (no VITE_ prefix)**
These are kept secure on the server:

```env
# API Keys
OPENAI_API_KEY=sk-your-openai-api-key-here
RAPIDAPI_KEY=your-rapidapi-key-here

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Admin Dashboard Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_PASSWORD=your-secure-admin-password
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

## 🔐 Security Setup

### **1. Generate a Secure JWT Secret**
```bash
# Generate a random 32-character string
openssl rand -base64 32
```

### **2. Generate a Secure Encryption Key**
```bash
# Generate exactly 32 characters
openssl rand -hex 16
```

### **3. Create a Strong Admin Password**
Use a password manager or generate a secure password:
```bash
# Generate a random password
openssl rand -base64 12
```

## 📝 Complete .env File Example

```env
# Frontend (safe to expose)
VITE_AUTH0_DOMAIN=dev-your-domain.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_SCOPE=openid profile email
VITE_CUSTOM_DOMAIN=https://yourdomain.com

# Server-side (secure)
OPENAI_API_KEY=sk-proj-your-openai-key-here
RAPIDAPI_KEY=your-rapidapi-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Admin Dashboard Security (CHANGE THESE!)
JWT_SECRET=your-generated-jwt-secret-here
ADMIN_PASSWORD=your-secure-admin-password
ENCRYPTION_KEY=your-32-character-encryption-key
```

## 🚀 Quick Setup

### **Step 1: Update your .env file**
Add these lines to your existing `.env` file:

```env
# Admin Dashboard Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_PASSWORD=admin123
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

### **Step 2: Generate proper keys**
Replace the placeholder values with secure ones:

```bash
# Generate JWT secret
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env

# Generate encryption key
echo "ENCRYPTION_KEY=$(openssl rand -hex 16)" >> .env

# Set admin password (change this!)
echo "ADMIN_PASSWORD=your-secure-password" >> .env
```

### **Step 3: Verify setup**
Run the server and check the environment variables:

```bash
node server.cjs
```

You should see:
```
🔧 Environment Variables Check:
   OpenAI API Key: ✅ Configured
   RapidAPI Key: ✅ Configured
   JWT Secret: ✅ Configured
   Admin Password: ✅ Configured
   Encryption Key: ✅ Valid length
```

## 🔑 Admin Dashboard Access

### **Default Login:**
- **URL:** `http://localhost:3000/admin`
- **Password:** `admin123` (CHANGE THIS!)

### **Change Admin Password:**
1. Update `ADMIN_PASSWORD` in your `.env` file
2. Restart the server
3. Use the new password to login

## 🛡️ Security Best Practices

### **1. Production Environment:**
- ✅ Use strong, unique passwords
- ✅ Generate random JWT secrets
- ✅ Use 32-character encryption keys
- ✅ Never commit `.env` files to git
- ✅ Use environment-specific configurations

### **2. Development Environment:**
- ⚠️ Default passwords are OK for development
- ⚠️ Default keys are OK for testing
- ✅ Change before deploying to production

### **3. Key Management:**
- 🔐 Store production keys securely
- 🔐 Rotate keys regularly
- 🔐 Use different keys for different environments
- 🔐 Monitor key usage and access

## 🚨 Troubleshooting

### **Common Issues:**

#### **1. "ENCRYPTION_KEY must be exactly 32 characters"**
```bash
# Generate a proper 32-character key
openssl rand -hex 16
```

#### **2. "JWT_SECRET not configured"**
```bash
# Generate a secure JWT secret
openssl rand -base64 32
```

#### **3. "Admin login failed"**
- Check that `ADMIN_PASSWORD` is set correctly
- Default password is `admin123`
- Restart server after changing password

#### **4. "Cannot access admin dashboard"**
- Ensure server is running on port 3001
- Check that `/admin` route is accessible
- Verify JWT token is valid

## 📞 Support

If you encounter issues:
1. Check the server console for error messages
2. Verify all environment variables are set
3. Ensure the server is running on the correct port
4. Check that the frontend can connect to the backend

---

**Remember:** Change all default passwords and keys before deploying to production! 🔐 