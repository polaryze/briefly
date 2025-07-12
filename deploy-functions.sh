#!/bin/bash

# Deploy Supabase Edge Functions
echo "🚀 Deploying Supabase Edge Functions..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Deploy scrape-socials function
echo "📦 Deploying scrape-socials function..."
supabase functions deploy scrape-socials

# Deploy transcribe function
echo "📦 Deploying transcribe function..."
supabase functions deploy transcribe

echo "✅ Edge Functions deployed successfully!"
echo "🌐 Your functions are now available at:"
echo "   - ${SUPABASE_URL}/functions/v1/scrape-socials"
echo "   - ${SUPABASE_URL}/functions/v1/transcribe" 