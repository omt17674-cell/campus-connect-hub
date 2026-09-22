# Campus Connect Hub - Vercel Deployment Instructions

## Your Live Site URL
Find it here: https://vercel.com/dashboard → Your Project → Production URL

## Critical: Set These Environment Variables in Vercel

Go to: **Vercel Dashboard → campus-connect-hub Project → Settings → Environment Variables**

Add these for **Production**:

```
VITE_SUPABASE_URL = https://dfl4luw5tr5l1h6jmnfql7a.supabase.co
VITE_SUPABASE_ANON_KEY = sb_publishable_dF4Lu5WtR5l1H6jmNFQl7A_Xw15G04Z
```

## Then:
1. Go to Deployments tab
2. Click the latest deployment
3. Click "Redeploy" 

OR just push a new commit:
```bash
git commit --allow-empty -m "trigger: redeploy with env vars"
git push origin main
```

Your site will be live in 2-3 minutes.
