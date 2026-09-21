# Campus Connect Hub - Local Auth Server Setup Guide

Complete guide to remove all third-party APIs and run the app locally.

## 🎯 What Changed

### ✅ Removed All External APIs
- ❌ Supabase (database)
- ❌ Twilio (SMS)
- ❌ Fast2SMS (SMS)
- ❌ Resend (email)
- ❌ OpenAI (AI assistant)

### ✅ What You Get Instead
- ✅ Local Express Auth Server (zero dependencies)
- ✅ In-memory database (users & sessions)
- ✅ JWT token authentication
- ✅ Email/password login
- ✅ Google OAuth simulation
- ✅ Pre-seeded demo accounts
- ✅ No external API calls needed

---

## 📋 Prerequisites

Make sure you have installed:
- Node.js (v18 or higher)
- npm or yarn
- Git

Check versions:
```bash
node --version
npm --version
```

---

## 🚀 Installation & Setup

### Step 1: Navigate to Project Directory

```bash
cd /path/to/campus-connect-hub
```

### Step 2: Install Main Project Dependencies (if not already done)

```bash
npm install
```

### Step 3: Install Auth Server Dependencies

```bash
cd server
npm install
cd ..
```

### Step 4: Configure Environment Variables

The frontend and server are already configured with default values, but you can customize them:

**Frontend** - Create/update `.env.local`:
```env
VITE_AUTH_SERVER_URL=http://localhost:5001
```

**Auth Server** - Copy the `.env.auth-server` template:
```bash
cp .env.auth-server server/.env
```

You can customize:
```env
AUTH_SERVER_PORT=5001                    # Change if port is already in use
FRONTEND_URL=http://localhost:5173      # Your frontend URL
JWT_SECRET=your-secret-key              # Change for production
JWT_EXPIRY=7d                           # Token expiration time
NODE_ENV=development
```

---

## ▶️ Starting the Services

### Option 1: Automated (Recommended)

**Mac/Linux:**
```bash
./start-local.sh
```

**Windows:**
```bash
start-local.bat
```

This will automatically:
1. Install dependencies if needed
2. Start the auth server on port 5001
3. Start the frontend on port 5173
4. Display login credentials
5. Monitor both services

### Option 2: Manual (Separate Terminals)

**Terminal 1 - Start Auth Server:**
```bash
cd server
npm run dev
```

Expected output:
```
╔════════════════════════════════════════════════════════════════════════════╗
║                  GSFC Campus Connect Hub - Auth Server                     ║
║                          🚀 Server Started                                 ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  📡 Server running at: http://localhost:5001                             ║
│  🔌 CORS enabled for: http://localhost:5173
...
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

Expected output:
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## 📝 Using the App

### 1. Open Frontend
Navigate to: **http://localhost:5173**

### 2. Select Portal & Login Method
- Select your role: Student, Admin, or Organizer
- Choose login method: Password or Mobile OTP

### 3. Login with Demo Credentials

#### 👤 Student Portal
```
Email: student@gsfcuniversity.ac.in
Password: Password@123
Roll No: 20CS001
```

#### 👨‍💼 Admin Portal
```
Email: admin.dean@gsfcuniversity.ac.in
Password: AdminPass@123
Roll No: ADM-DEAN-001
```

#### 💼 Organizer Portal
```
Email: placement@gsfcuniversity.ac.in
Password: OrgPass@123
Roll No: ORG-TPC-001
```

### 4. Google OAuth (Simulated)
Click "Sign in with Google Workspace" → Returns immediately (local simulation, no actual Google involved)

---

## 🔒 Authentication Flow

### Password Login Flow

```
Frontend (Login Form)
        ↓
    /api/auth/login (POST)
        ↓
Auth Server:
  1. Find user by email
  2. Compare password (bcrypt)
  3. Generate JWT token
  4. Create session
        ↓
Response with token + user data
        ↓
Frontend: Save token in localStorage
```

### Token Verification Flow

```
Frontend (on app start)
        ↓
    /api/auth/verify-token (POST)
        ↓
Auth Server:
  1. Verify JWT signature
  2. Check if token expired
  3. Return user data
        ↓
Response: success + user data OR error
        ↓
Frontend: Load dashboard or redirect to login
```

---

## 🧪 Testing the API

### Test Auth Server Health

```bash
curl http://localhost:5001/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "server": "Campus Connect Hub Auth Server",
  "timestamp": "2026-09-20T09:15:30.123Z",
  "uptime": 12.345
}
```

### Test Login

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@gsfcuniversity.ac.in",
    "password": "Password@123",
    "role": "student"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "student-001",
    "email": "student@gsfcuniversity.ac.in",
    "name": "GSFC Student",
    "role": "student",
    "rollNo": "20CS001",
    "avatar": "ST"
  }
}
```

### Test Google OAuth

```bash
curl -X POST http://localhost:5001/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@gmail.com",
    "name": "New User"
  }'
```

---

## 📱 Frontend API Client Usage

### Updated to use Local API Client

The frontend now uses `localApiClient` instead of external APIs:

```typescript
import { localApiClient } from "@/lib/api-client-local";

// Login
const response = await localApiClient.login(
  "student@gsfcuniversity.ac.in",
  "Password@123",
  "student"
);

if (response.success) {
  // Save token
  localStorage.setItem("authToken", response.token);
  
  // Redirect to dashboard
  navigate("/dashboard");
}

// Google OAuth
const googleResponse = await localApiClient.loginWithGoogle(
  "user@gmail.com",
  "User Name"
);

// Verify token
const verification = await localApiClient.verifyToken(token);

// Get current user
const profile = await localApiClient.getCurrentUser(token);

// Logout
await localApiClient.logout(token);
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5001`

**Solution:**
```bash
# Find process on port 5001
lsof -i :5001

# Kill process
kill -9 <PID>

# Or use different port
AUTH_SERVER_PORT=5002 npm run dev
```

### Auth Server Won't Start

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
cd server
npm install
cd ..
npm run dev
```

### Frontend Can't Connect to Auth Server

**Error:** `Network error. Check if auth server is running on port 5001.`

**Solution:**
1. Verify auth server is running:
   ```bash
   curl http://localhost:5001/api/health
   ```

2. Check frontend environment:
   ```bash
   # .env.local should have:
   VITE_AUTH_SERVER_URL=http://localhost:5001
   ```

3. Restart frontend after updating env

### Login Always Fails

**Error:** `Invalid email or password`

**Solution:**
1. Check email spelling (case-insensitive but must be exact)
2. Check password (case-sensitive!)
3. Verify user exists in auth server logs
4. Check role matches (student/admin/organizer)

### Token Verification Fails

**Error:** `Invalid or expired token`

**Solution:**
1. Token might be expired (7 days default)
2. Clear localStorage and login again:
   ```javascript
   localStorage.clear();
   ```
3. Check JWT_EXPIRY setting in `.env`

---

## 🔄 Adding New Users

### Via Frontend Registration

1. Click "New Student Registration"
2. Fill in all fields
3. Complete registration
4. User is automatically saved to in-memory database

### Via Code (for testing)

Edit `server/auth-server.ts` and add to `seedDatabase()`:

```typescript
const newUserHashedPassword = await bcrypt.hash("MyPass@123", 10);
usersDatabase.set("user-002", {
  id: "user-002",
  email: "newuser@gsfcuniversity.ac.in",
  password: newUserHashedPassword,
  name: "New User",
  rollNo: "20CS002",
  role: "student",
  avatar: "NU",
  createdAt: new Date(),
});
```

Then restart the auth server.

---

## 📊 Database Structure

All data is stored in-memory (RAM). When the server restarts, data resets to demo accounts.

### Users Table
```typescript
{
  id: string;
  email: string;
  password: string; // bcrypt hashed
  name: string;
  rollNo?: string;
  role: "student" | "admin" | "organizer";
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}
```

### Sessions Table
```typescript
{
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}
```

---

## 🔐 Security Considerations

### Development Only
This setup is for **local development only**. Do not use in production.

### Password Security
- All passwords are hashed using bcrypt (10 salt rounds)
- Never log passwords
- Passwords are never returned in API responses

### Token Security
- Tokens are JWT signed with JWT_SECRET
- Tokens expire after JWT_EXPIRY (default 7 days)
- Change JWT_SECRET in production!

### CORS Configuration
- CORS is enabled only for FRONTEND_URL (default: http://localhost:5173)
- Restrict to your domain in production

---

## 📦 What's in Each File

```
campus-connect-hub/
├── server/                          # Auth Server
│   ├── auth-server.ts              # Main Express server
│   ├── package.json                # Dependencies
│   ├── tsconfig.json               # TypeScript config
│   └── README.md                   # Server documentation
│
├── src/
│   ├── lib/
│   │   ├── api-client-local.ts    # Frontend API client (NEW)
│   │   └── campus-store.ts         # Zustand store
│   │
│   └── components/
│       └── auth/
│           └── LoginPage.tsx       # Login UI
│
├── .env.auth-server               # Server env template
├── SETUP_LOCAL_AUTH.md            # This file
├── start-local.sh                 # Auto-start script (Mac/Linux)
└── start-local.bat                # Auto-start script (Windows)
```

---

## ✨ Next Steps

1. ✅ Install dependencies
2. ✅ Start both services
3. ✅ Test login with demo accounts
4. ✅ Test registration with new account
5. ✅ Test Google OAuth
6. ✅ Build your features!

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [JWT Introduction](https://jwt.io/)
- [bcrypt Hash Tutorial](https://www.npmjs.com/package/bcrypt)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## ❓ Need Help?

### Common Questions

**Q: Can I use this for production?**
A: No, this is for local development only. For production, use a proper database and secure authentication service.

**Q: How do I persist data?**
A: Currently data is in-memory only. To persist, connect a real database (PostgreSQL, MongoDB, etc.).

**Q: Can I add SMS/Email?**
A: Yes, you can add third-party services later. This setup just removes them to keep it simple for development.

**Q: How do I reset the database?**
A: Restart the auth server. Demo accounts will be reseeded automatically.

---

## 🎉 You're All Set!

You now have a complete local authentication system with **zero external APIs**!

Happy developing! 🚀
