# 🗄️ Supabase Setup Guide

## 🎯 **Current Status: Hybrid Storage System**

Your application now supports **both Supabase and file-based storage** with automatic fallback:

- ✅ **Supabase available** → Uses database
- ❌ **Supabase unavailable** → Falls back to encrypted file storage
- 🔄 **Automatic switching** → No downtime during migration

## 📋 **Environment Variables Setup**

### **Step 1: Get Your Supabase Credentials**

1. **Go to your Supabase Dashboard:**
   - Visit [supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Get your credentials:**
   - **Settings** → **API**
   - Copy your **Project URL** and **anon public key**
   - Copy your **service_role key** (for admin operations)

### **Step 2: Local Environment (.env file)**

Add these to your existing `.env` file:

```env
# Existing variables (keep these)
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_SCOPE=openid profile email
VITE_CUSTOM_DOMAIN=https://yourdomain.com

# Server-side (secure)
OPENAI_API_KEY=your-openai-api-key-here
RAPIDAPI_KEY=your-rapidapi-key-here
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Admin Dashboard Security
JWT_SECRET=your-jwt-secret-here
ADMIN_PASSWORD=your-admin-password-here
ENCRYPTION_KEY=your-32-character-encryption-key-here

# NEW: Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Frontend Supabase (for future features)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### **Step 3: Vercel Environment Variables**

1. **Go to your Vercel Dashboard:**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your Briefly.ai project

2. **Add Environment Variables:**
   - Go to **Settings** → **Environment Variables**
   - Add these variables:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Deploy to apply changes:**
   - Vercel will automatically redeploy with new environment variables

## 🗄️ **Database Schema Setup**

### **Step 1: Create the Waitlist Table**

1. **Go to Supabase Dashboard:**
   - **Table Editor** → **New Table**

2. **Create the table:**
   ```sql
   CREATE TABLE waitlist (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     ip_address INET,
     user_agent TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **Add indexes for performance:**
   ```sql
   CREATE INDEX idx_waitlist_email ON waitlist(email);
   CREATE INDEX idx_waitlist_subscribed_at ON waitlist(subscribed_at);
   CREATE INDEX idx_waitlist_created_at ON waitlist(created_at);
   ```

### **Step 2: Enable Row Level Security (Optional)**

```sql
-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for waitlist signups)
CREATE POLICY "Anyone can insert waitlist data" ON waitlist
  FOR INSERT WITH CHECK (true);

-- Only allow service role to read (for admin dashboard)
CREATE POLICY "Service role can read all data" ON waitlist
  FOR SELECT USING (auth.role() = 'service_role');
```

## 🔄 **Data Migration (Optional)**

### **Migrate Existing Data**

If you have existing waitlist data in `waitlist.json`, you can migrate it:

```javascript
// migration.js
const fs = require('fs').promises;
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateData() {
  try {
    // Read existing data
    const data = JSON.parse(await fs.readFile('waitlist.json', 'utf8'));
    
    // Transform data
    const transformedData = data.map(entry => ({
      email: entry.email,
      subscribed_at: entry.subscribedAt,
      ip_address: entry.ip,
      user_agent: entry.userAgent
    }));

    // Insert into Supabase
    const { data: result, error } = await supabase
      .from('waitlist')
      .insert(transformedData);

    if (error) {
      console.error('Migration error:', error);
    } else {
      console.log(`✅ Migrated ${result.length} subscribers`);
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateData();
```

## 🧪 **Testing Your Setup**

### **Step 1: Test Local Environment**

```bash
# Start the server
node server.cjs

# Expected output:
# ✅ Supabase connected successfully
# 🔧 Environment Variables Check:
#    Supabase: ✅ Connected
```

### **Step 2: Test Waitlist Functionality**

1. **Submit an email** at `http://localhost:8080/`
2. **Check Supabase Dashboard** → **Table Editor** → **waitlist**
3. **Verify the data** appears in the database

### **Step 3: Test Admin Dashboard**

1. **Go to** `http://localhost:8080/admin`
2. **Login** with your admin password
3. **Verify** statistics and recent subscribers

## 🔐 **Security Features**

### **Automatic Fallback System**
- ✅ **Supabase available** → Secure database storage
- ✅ **Supabase unavailable** → Falls back to encrypted file storage
- ✅ **No data loss** → Automatic switching
- ✅ **Production ready** → Works on both local and Vercel

### **Data Protection**
- 🔐 **Emails encrypted** in file storage
- 🔐 **Service role** for admin operations
- 🔐 **Rate limiting** on submissions
- 🔐 **Input validation** and sanitization

## 🚀 **Deployment Checklist**

### **Before Deploying:**
- [ ] ✅ Supabase project created
- [ ] ✅ Environment variables set in Vercel
- [ ] ✅ Database table created
- [ ] ✅ Local testing completed
- [ ] ✅ Admin dashboard working

### **After Deploying:**
- [ ] ✅ Test waitlist signup on live site
- [ ] ✅ Test admin dashboard on live site
- [ ] ✅ Verify data appears in Supabase
- [ ] ✅ Monitor error logs

## 🎯 **Benefits You Get**

### **Immediate Benefits:**
- ✅ **Real-time data** - Live dashboard updates
- ✅ **Better performance** - Database queries vs file reads
- ✅ **Concurrent access** - Multiple users can access simultaneously
- ✅ **Automatic backups** - Supabase handles backups

### **Future Benefits:**
- ✅ **Scalability** - Handles millions of subscribers
- ✅ **Analytics** - Advanced querying capabilities
- ✅ **User authentication** - Built-in auth system
- ✅ **Real-time features** - Live updates and notifications

## 🆘 **Troubleshooting**

### **"Supabase not configured"**
- Check environment variables are set correctly
- Verify Supabase project URL and keys
- Restart server after changing .env

### **"Database error"**
- Check Supabase table exists
- Verify service role key has proper permissions
- Check network connectivity

### **"Admin dashboard not working"**
- Verify JWT_SECRET is set
- Check admin password is correct
- Ensure service role key is configured

---

**🎉 You're all set!** Your application now has enterprise-grade database storage with automatic fallback to secure file storage. Both local development and production deployment will work seamlessly! 🚀 