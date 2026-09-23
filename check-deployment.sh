#!/bin/bash

echo "=========================================="
echo "Campus Connect Hub - Deployment Checklist"
echo "=========================================="
echo ""

# Check local .env
echo "✅ LOCAL .env file:"
echo ""
if [ -f ".env" ]; then
  grep -E "^(VITE_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_URL)" .env | head -3
  echo ""
else
  echo "❌ .env file not found!"
  echo ""
fi

# Check if vercel CLI is installed
echo "📦 Vercel CLI Status:"
if command -v vercel &> /dev/null; then
  echo "✅ Vercel CLI installed"
  echo ""
  echo "🔍 Environment variables in Vercel:"
  vercel env list --environment production 2>/dev/null || echo "   (Run: vercel login && vercel link)"
else
  echo "❌ Vercel CLI not installed"
  echo "   Install: npm install -g vercel"
  echo "   Then: vercel login && vercel link"
  echo ""
fi

# Check git status
echo ""
echo "📌 Git Status:"
git log --oneline -1
echo ""

# Check build
echo "🏗️  Build Status:"
if npm run build > /dev/null 2>&1; then
  echo "✅ Build successful"
else
  echo "❌ Build failed"
fi
echo ""

echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo "1. Install Vercel CLI: npm install -g vercel"
echo "2. Link project: vercel link"
echo "3. Set env vars: vercel env add"
echo "4. Deploy: vercel deploy --prod"
echo "5. Test: https://campus-connect-hub.vercel.app/api/health"
echo "=========================================="
