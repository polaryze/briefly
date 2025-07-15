#!/bin/bash

# Deploy Supabase Edge Functions
echo "🚀 Deploying Supabase Edge Functions..."

# Get Supabase URL from environment or use default
SUPABASE_URL=${SUPABASE_URL:-"http://localhost:54321"}

# Deploy scrape-socials function
echo "📦 Deploying scrape-socials function..."
supabase functions deploy scrape-socials

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Available endpoints:"
echo "   - ${SUPABASE_URL}/functions/v1/scrape-socials"
echo ""
echo "🔧 To test locally:"
echo "   supabase functions serve" 