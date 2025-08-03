# Supabase Setup Guide for Briefly Waitlist

## 🚀 Quick Setup

### Step 1: Create Supabase Project

1. **Go to** [supabase.com](https://supabase.com)
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Choose your organization**
5. **Enter project details:**
   - **Name:** `briefly-waitlist`
   - **Database Password:** Choose a strong password (save this!)
   - **Region:** Choose closest to your users
6. **Click "Create new project"**

### Step 2: Get Your Credentials

1. **Go to Settings → API** in your Supabase dashboard
2. **Copy these values:**
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

### Step 3: Create Database Table

1. **Go to SQL Editor** in Supabase dashboard
2. **Run this SQL:**

```sql
-- Create waitlist table
CREATE TABLE waitlist (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_subscribed_at ON waitlist(subscribed_at);
```

### Step 4: Set Environment Variables in Vercel

1. **Go to** [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Find your Briefly project**
3. **Go to Settings → Environment Variables**
4. **Add these variables:**

```
SUPABASE_URL=https://your-project-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
ADMIN_PASSWORD=skibidiballs
```

### Step 5: Deploy

The functions are already updated to use Supabase. Once you set the environment variables, redeploy:

1. **Go to your Vercel project**
2. **Click "Redeploy"** or wait for automatic deployment
3. **Test the waitlist** - it should now store data in Supabase!

## 🔍 Testing

### Test Waitlist Signup
```bash
curl -X POST https://www.usebriefly.io/api/waitlist/join \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test Admin Dashboard
1. **Go to** `https://www.usebriefly.io/admin`
2. **Login with:** `skibidiballs`
3. **Check dashboard** - should show real data from Supabase

## 📊 View Data in Supabase

1. **Go to your Supabase dashboard**
2. **Click "Table Editor"**
3. **Click "waitlist" table**
4. **See all signups** in real-time!

## 🔧 Troubleshooting

### If functions fail:
1. **Check environment variables** are set correctly in Vercel
2. **Verify Supabase URL** and keys are correct
3. **Check Supabase logs** in the dashboard

### If data doesn't appear:
1. **Check the waitlist table** exists in Supabase
2. **Verify the SQL** was run successfully
3. **Check function logs** in Vercel dashboard

## 🎯 What's Working Now

- ✅ **Real database storage** in Supabase
- ✅ **Persistent data** across deployments
- ✅ **Admin dashboard** shows real signups
- ✅ **CSV export** of actual data
- ✅ **Email validation** and duplicate prevention
- ✅ **IP tracking** and user agent logging

## 🚀 Next Steps

1. **Set up the environment variables**
2. **Deploy to Vercel**
3. **Test with real emails**
4. **Monitor in Supabase dashboard**

Your waitlist is now production-ready with proper database storage! 🎉 