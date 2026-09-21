# Migration Guide: From Supabase/External APIs to Local Auth Server

Complete guide to migrate from the old setup (with Supabase and external APIs) to the new local auth server setup.

---

## 📋 What's Changing

### Old Setup (Before)
```
Frontend (React)
    ↓ (API calls)
Supabase (cloud database)
    ↓ (SMS/Email)
Twilio / Fast2SMS / Resend / OpenAI
```

### New Setup (After)
```
Frontend (React) ←→ Express Auth Server (local)
                 ↓
           In-Memory Database
           (No external APIs)
```

---

## 🗑️ What's Being Removed

| Service | Purpose | Status |
|---------|---------|--------|
| Supabase | Cloud Database | ❌ Removed |
| Twilio | SMS Service | ❌ Removed |
| Fast2SMS | Alternative SMS | ❌ Removed |
| Resend | Email Service | ❌ Removed |
| OpenAI | AI Assistant | ❌ Removed |
| Google OAuth | Social Login | ⚠️ Simulated Locally |

### Pros of Migration
✅ No cloud infrastructure needed  
✅ No API credentials/secrets  
✅ Faster development cycle  
✅ Complete local control  
✅ Zero cost  
✅ No internet required  

### Cons to Be Aware
⚠️ Data is in-memory (resets on server restart)  
⚠️ No real SMS/Email sending  
⚠️ No cloud backup  
⚠️ Limited to one server instance  
⚠️ Not suitable for production  

---

## 🔄 Migration Steps

### Step 1: Stop Old Services

If you have Supabase or other services running:
```bash
# Stop any running instances
npm run stop
```

### Step 2: Backup Your .env (Optional)

```bash
# Keep old config for reference
cp .env .env.backup
```

### Step 3: Clean Old Environment Files

```bash
# Remove old external API keys
rm -f .env
# The old .env.example will still exist for reference
```

### Step 4: Create New Environment Files

```bash
# Frontend
echo "VITE_AUTH_SERVER_URL=http://localhost:5001" > .env.local

# Server (already exists as .env.auth-server)
cp .env.auth-server server/.env
```

### Step 5: Install New Dependencies

```bash
# Frontend already has dependencies, but install server
cd server
npm install
cd ..
```

### Step 6: Update Frontend API Calls

Change from `apiClient` to `localApiClient`:

**Before:**
```typescript
import { apiClient } from "@/lib/api-client";
```

**After:**
```typescript
import { localApiClient } from "@/lib/api-client-local";
```

### Step 7: Remove Supabase Imports (Optional)

If you want to clean up old code:

**Files to check:**
- `src/lib/supabase.ts` - Can be deleted
- `src/lib/supabase-mappers.ts` - Can be deleted
- `src/server/supabase-sync.ts` - Can be deleted
- `src/server/supabase-admin.ts` - Can be deleted

**Keep these for now:**
- `src/lib/api-client.ts` - As backup
- `src/server/api-router.ts` - May have useful utilities

### Step 8: Test the New Setup

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
npm run dev

# Open http://localhost:5173
```

### Step 9: Test Authentication

1. Click "Sign In"
2. Try demo credentials:
   - Email: `student@gsfcuniversity.ac.in`
   - Password: `Password@123`
3. Should see dashboard immediately

### Step 10: Commit Changes

```bash
git add .
git commit -m "feat: Migrate from Supabase to local auth server (no external APIs)"
git push origin main
```

---

## 🔍 Code Changes Required

### Authentication Functions

**Old (Supabase):**
```typescript
const user = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password"
});
```

**New (Local):**
```typescript
const response = await localApiClient.login(
  "user@example.com",
  "password",
  "student"
);
```

### Token Management

**Old (Supabase):**
```typescript
const token = session.access_token;
```

**New (Local):**
```typescript
const token = response.token;
localStorage.setItem("authToken", token);
```

### User Profile

**Old (Supabase):**
```typescript
const profile = await supabase
  .from("profiles")
  .select("*")
  .single();
```

**New (Local):**
```typescript
const response = await localApiClient.getCurrentUser(token);
const profile = response.user;
```

### Session Verification

**Old (Supabase):**
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

**New (Local):**
```typescript
const token = localStorage.getItem("authToken");
const verification = await localApiClient.verifyToken(token);
```

---

## 📱 Mobile/OTP Flow Changes

### Old OTP Flow (Twilio)
```
Send OTP via Twilio SMS
    ↓
User verifies code
    ↓
Supabase creates session
```

### New OTP Flow (Simulated)
```
OTP endpoint returns mock OTP
    ↓
User enters any 6-digit code
    ↓
Local auth server creates JWT token
```

**Note:** In production, you'll need to integrate a real SMS provider.

---

## 💾 Data Migration

### Transferring User Data

If you need to migrate existing users from Supabase:

```bash
# 1. Export from Supabase (SQL query)
SELECT id, email, user_metadata FROM auth.users;

# 2. Format as JSON
# 3. Add to server/auth-server.ts seedDatabase()
# 4. Restart server
```

### Example:
```typescript
// In seedDatabase() function
const importedUsers = [
  {
    id: "user-123",
    email: "existing@example.com",
    name: "Existing User",
    rollNo: "20CS100",
    role: "student"
  }
];

// Hash passwords
for (const user of importedUsers) {
  const hashedPassword = await bcrypt.hash("TempPassword@123", 10);
  usersDatabase.set(user.id, { ...user, password: hashedPassword });
}
```

---

## 🧪 Testing Checklist

After migration, verify:

### Authentication
- [ ] Email/password login works
- [ ] Incorrect password shows error
- [ ] Non-existent email shows error
- [ ] User registration works
- [ ] Google OAuth button works (simulated)

### Session Management
- [ ] Token is saved to localStorage
- [ ] Token is sent in Authorization header
- [ ] Verify token endpoint works
- [ ] Logout clears token
- [ ] Expired token redirects to login

### User Profile
- [ ] Get current user works
- [ ] User data is accurate
- [ ] Role-based access works
- [ ] Student/Admin/Organizer roles work

### Roles & Permissions
- [ ] Student role can access student portal
- [ ] Admin role can access admin portal
- [ ] Organizer role can access organizer portal
- [ ] Wrong role shows error

---

## 🐛 Common Issues During Migration

### Issue 1: "Cannot find module 'supabase'"
**Cause:** Old imports still present  
**Fix:**
```typescript
// Remove these lines
import { supabase } from "@/lib/supabase";

// Replace with
import { localApiClient } from "@/lib/api-client-local";
```

### Issue 2: "Auth server not running"
**Cause:** Forgot to start Express server  
**Fix:**
```bash
cd server && npm run dev
# Wait for startup message
```

### Issue 3: "CORS error" or "Network error"
**Cause:** Auth server URL mismatch  
**Fix:**
```env
# Frontend .env.local must match server port
VITE_AUTH_SERVER_URL=http://localhost:5001
```

### Issue 4: Token always invalid
**Cause:** JWT_SECRET changed  
**Fix:**
```bash
# Keep JWT_SECRET consistent
# Don't change in server/.env after generating tokens
```

### Issue 5: Demo accounts not working
**Cause:** Database not seeded  
**Fix:**
```bash
# Check server logs
# Restart server
cd server && npm run dev
```

---

## 🚀 Post-Migration

### What to Do Next

1. **Update Documentation**
   - Remove Supabase references
   - Add local auth server info
   - Update API endpoints

2. **Remove Old Code**
   - Delete Supabase files (optional)
   - Clean up old imports
   - Update test files

3. **Configure for Team**
   - Commit new setup
   - Update team documentation
   - Run onboarding for team members

4. **Plan for Production**
   - This is dev-only, plan production setup
   - Consider database: PostgreSQL, MongoDB, Firebase
   - Consider auth service: Auth0, Clerk, Supabase (again)

### Production Considerations

When ready for production:

```typescript
// Production setup (example with PostgreSQL)
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

// Replace Map with actual queries
const user = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
```

---

## 📞 Need Help?

### Common Questions

**Q: Can I go back to Supabase?**
A: Yes, all old code is in git history. But migrate back only if necessary.

**Q: How do I handle real SMS in production?**
A: Replace local OTP with Twilio, Fast2SMS, or similar API in production.

**Q: Where's my old data?**
A: It's still in Supabase. Export it if needed, then disconnect.

**Q: Can I run both old and new setups?**
A: Not recommended. Use branching strategy if needed.

**Q: What about database migrations?**
A: Not needed for in-memory database. All data resets on server restart.

---

## ✅ Migration Complete!

Once you've verified everything:

1. ✅ Old services removed
2. ✅ New auth server running
3. ✅ Frontend using localApiClient
4. ✅ Demo accounts working
5. ✅ Tests passing
6. ✅ Team notified

**You're ready to develop!** 🎉

---

## 📚 Related Documentation

- [Quick Start](./QUICK_START.md)
- [Full Setup Guide](./SETUP_LOCAL_AUTH.md)
- [Server README](./server/README.md)
- [API Reference](./server/README.md#-api-endpoints)

---

**Last Updated:** September 20, 2026  
**Status:** Active  
**Supported Node Version:** 18+
