#!/bin/bash

# Test Vercel Deployment

if [ -z "$1" ]; then
  echo "Usage: ./test-vercel-deployment.sh <VERCEL_URL>"
  echo ""
  echo "Example:"
  echo "  ./test-vercel-deployment.sh https://campus-connect-hub.vercel.app"
  echo ""
  exit 1
fi

VERCEL_URL="$1"
CONFIG_URL="${VERCEL_URL}/api/health"

echo ""
echo "🧪 Testing Campus Connect Hub Deployment"
echo "======================================"
echo ""
echo "📍 Vercel URL: $VERCEL_URL"
echo "🔗 Testing endpoint: $CONFIG_URL"
echo ""

# Test /api/health endpoint
echo "Testing /api/health..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$CONFIG_URL")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo ""
echo "Response:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

# Check if configured
if echo "$BODY" | grep -q '"environmentConfigured":true'; then
  echo "✅ Environment variables are CONFIGURED!"
  echo ""
  echo "✅ You can now:"
  echo "   1. Log in to the app"
  echo "   2. Create an event"
  echo "   3. Verify event appears in database"
  echo ""
elif echo "$BODY" | grep -q '"environmentConfigured":false'; then
  echo "❌ Environment variables are NOT configured"
  echo ""
  echo "❌ Next steps:"
  echo "   1. Set env vars in Vercel dashboard"
  echo "   2. Redeploy the application"
  echo "   3. Run this test again"
  echo ""
else
  echo "⚠️  Unable to parse response"
  echo "   Make sure the URL is correct: $VERCEL_URL"
  echo ""
fi
