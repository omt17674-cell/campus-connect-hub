# 📚 Campus Connect Hub - Local Auth Server - Complete Index

Everything you need to know about the new local authentication system.

---

## 🎯 Overview

This project has been migrated from cloud-based services (Supabase, Twilio, Resend, OpenAI) to a **complete local authentication system** running on your machine.

### Key Characteristics
- ✅ **Zero External APIs** - Everything runs locally
- ✅ **Express.js Server** - Lightweight and fast
- ✅ **In-Memory Database** - No database setup needed
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Pre-seeded Demo Accounts** - Ready to use immediately
- ✅ **CORS Enabled** - Ready for frontend integration

---

## 📖 Documentation Map

### For First-Time Users
1. **[QUICK_START.md](./QUICK_START.md)** ⭐ START HERE
   - Installation in 2 minutes
   - Demo accounts to test
   - Basic troubleshooting

2. **[SETUP_LOCAL_AUTH.md](./SETUP_LOCAL_AUTH.md)** 📖 COMPREHENSIVE GUIDE
   - Detailed step-by-step setup
   - All features explained
   - Complete API reference
   - Testing guide

### For Existing Users Migrating
3. **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** 🔄 MIGRATION HELP
   - What's changing and why
   - Step-by-step migration
   - Code changes required
   - Troubleshooting during migration

### For Server Developers
4. **[server/README.md](./server/README.md)** 🖥️ SERVER DOCUMENTATION
   - Architecture details
   - API endpoints
   - Database schema
   - Authentication flow

### For Frontend Developers
5. **[src/lib/api-client-local.ts](./src/lib/api-client-local.ts)** 🔗 API CLIENT
   - Frontend API client code
   - All methods documented
   - Usage examples

---

## 🚀 Quick Start (TL;DR)

### 1. Install
```bash
npm install
cd server && npm install && cd ..
```

### 2. Start
```bash
./start-local.sh    # Mac/Linux
start-local.bat     # Windows
```

### 3. Login
Open **http://localhost:5173** and use:
- Email: `student@gsfcuniversity.ac.in`
- Password: `Password@123`

---

## 📁 Project Structure

```
campus-connect-hub/
│
├── 📚 Documentation
│   ├── QUICK_START.md ......................... Quick setup (60 seconds)
│   ├── SETUP_LOCAL_AUTH.md ................... Full documentation
│   ├── MIGRATION_GUIDE.md .................... Migrate from old setup
│   ├── LOCAL_AUTH_INDEX.md ................... This file
│   └── README.md ............................. Project README
│
├── 🖥️ Server (Express Auth Server)
│   ├── server/
│   │   ├── auth-server.ts .................... Main Express server
│   │   ├── package.json ...................... Dependencies
│   │   ├── tsconfig.json ..................... TypeScript config
│   │   └── README.md ......................... Server docs
│   │
│   ├── .env.auth-server ...................... Server config template
│   ├── start-local.sh ........................ Auto-start (Mac/Linux)
│   └── start-local.bat ....................... Auto-start (Windows)
│
├── 🎨 Frontend (React + Vite)
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api-client-local.ts .......... ✨ NEW: Local API client
│   │   │   ├── api-client.ts ................ Old API client (backup)
│   │   │   ├── campus-store.ts .............. State management
│   │   │   └── types.ts ..................... TypeScript types
│   │   │
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx ............ Login UI
│   │   │   │   ├── PhoneEmailAuth.tsx ....... Phone verification
│   │   │   │   └── [other auth components]
│   │   │   └── [other components]
│   │   │
│   │   └── styles.css ........................ Global styles
│   │
│   ├── .env.local ............................ Frontend config
│   ├── vite.config.ts ........................ Vite configuration
│   ├── package.json .......................... Frontend dependencies
│   └── tsconfig.json ......................... TypeScript config
│
├── 🗄️ Build Output (Ignore)
│   └── .output/ .............................. Build artifacts
│
└── 📝 Configuration
    ├── .env.auth-server ...................... Server env template
    ├── .env ................................. Main project env
    ├── .env.example .......................... Example env
    └── .gitignore ............................ Git ignore rules
```

---

## 🔄 System Architecture

```
User Browser (http://localhost:5173)
        ↓ HTTP
        │ /api/auth/login
        │ /api/auth/register
        │ /api/auth/google
        ↓
Express Auth Server (http://localhost:5001)
        │ ↓ In-Memory
        ├─→ Users Map
        ├─→ Sessions Map
        └─→ JWT Generator
        ↓
Response with Token + User Data
        ↓
Frontend: Save to localStorage
```

---

## 🔐 Authentication Flow

### Password Login
```
1. User enters email + password
2. Frontend sends to /api/auth/login
3. Server finds user by email
4. Server compares password (bcrypt)
5. Server generates JWT token
6. Server creates session
7. Frontend receives token
8. Frontend saves to localStorage
9. Frontend authenticated ✅
```

### Google OAuth (Simulated)
```
1. User clicks "Sign in with Google"
2. Frontend sends email to /api/auth/google
3. Server checks if user exists
4. If not, creates new user
5. Server generates JWT token
6. Frontend receives token
7. Frontend authenticated ✅
```

### Token Verification
```
1. App loads
2. Frontend retrieves token from localStorage
3. Frontend sends to /api/auth/verify-token
4. Server verifies JWT signature
5. Server checks if expired
6. Server returns user data
7. Frontend restores session ✅
```

---

## 📡 API Endpoints

All endpoints return JSON responses.

### Authentication Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/auth/login` | Email/password login | ❌ No |
| POST | `/api/auth/register` | New user registration | ❌ No |
| POST | `/api/auth/google` | Google OAuth (simulated) | ❌ No |
| POST | `/api/auth/verify-token` | Verify JWT token | ❌ No |
| GET | `/api/auth/me` | Get user profile | ✅ Yes |
| POST | `/api/auth/logout` | Logout user | ✅ Yes |
| GET | `/api/health` | Server health check | ❌ No |

### Demo Credentials

```
👤 Student Portal
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:      student@gsfcuniversity.ac.in
Password:   Password@123
Roll No:    20CS001
Role:       student

👨‍💼 Admin Portal
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:      admin.dean@gsfcuniversity.ac.in
Password:   AdminPass@123
Roll No:    ADM-DEAN-001
Role:       admin

💼 Organizer Portal
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:      placement@gsfcuniversity.ac.in
Password:   OrgPass@123
Roll No:    ORG-TPC-001
Role:       organizer
```

---

## 💻 Frontend Integration

### Import the API Client
```typescript
import { localApiClient } from "@/lib/api-client-local";
```

### Available Methods
```typescript
// Login
await localApiClient.login(email, password, role);

// Register
await localApiClient.register(email, password, name, rollNo, role);

// Google OAuth
await localApiClient.loginWithGoogle(email, name, rollNo);

// Verify Token
await localApiClient.verifyToken(token);

// Get Current User
await localApiClient.getCurrentUser(token);

// Logout
await localApiClient.logout(token);

// Health Check
await localApiClient.health();
```

### Example: Complete Login Flow
```typescript
import { localApiClient } from "@/lib/api-client-local";

async function handleLogin(email: string, password: string) {
  try {
    // 1. Call login API
    const response = await localApiClient.login(email, password, "student");
    
    // 2. Check if successful
    if (!response.success) {
      console.error("Login failed:", response.message);
      return;
    }
    
    // 3. Save token
    localStorage.setItem("authToken", response.token);
    
    // 4. Update app state
    setCurrentUser(response.user);
    
    // 5. Redirect to dashboard
    navigate("/dashboard");
  } catch (error) {
    console.error("Login error:", error);
  }
}
```

---

## 🔧 Environment Configuration

### Frontend `.env.local`
```env
# Auth Server URL
VITE_AUTH_SERVER_URL=http://localhost:5001

# Optional: Dev server port
VITE_PORT=5173
```

### Server `.env`
```env
# Server Settings
AUTH_SERVER_PORT=5001
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=campus-connect-hub-local-jwt-secret-2026
JWT_EXPIRY=7d

# Environment
NODE_ENV=development
```

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5001/api/health
```

### Login Test
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@gsfcuniversity.ac.in",
    "password": "Password@123"
  }'
```

### Verify Token
```bash
curl -X POST http://localhost:5001/api/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_TOKEN_HERE"}'
```

---

## 🐛 Troubleshooting

### Top Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `EADDRINUSE: port 5001 in use` | Another process using port | Kill: `lsof -i :5001 \| xargs kill -9` |
| `Cannot find module 'express'` | Dependencies not installed | Run: `cd server && npm install` |
| `Network error connecting to server` | Auth server not running | Start: `cd server && npm run dev` |
| `Invalid email or password` | Wrong credentials | Check demo account credentials |
| `Token is invalid` | Token expired or malformed | Delete localStorage, login again |
| `CORS error` | Frontend URL not configured | Check `FRONTEND_URL` in server `.env` |

See [SETUP_LOCAL_AUTH.md](./SETUP_LOCAL_AUTH.md#-troubleshooting) for more troubleshooting.

---

## 🚀 Commands Reference

### Installation
```bash
npm install                          # Install frontend deps
cd server && npm install && cd ..    # Install server deps
```

### Development
```bash
./start-local.sh                     # Mac/Linux: Start everything
start-local.bat                      # Windows: Start everything

npm run dev                          # Frontend only
cd server && npm run dev && cd ..    # Server only
```

### Production (Future)
```bash
npm run build                        # Build frontend
cd server && npm run build && cd ..  # Build server
npm run preview                      # Preview build
```

---

## ✨ Features

### Current Features ✅
- Email/password authentication
- User registration
- JWT token management
- Role-based access (student/admin/organizer)
- Session persistence
- Google OAuth simulation
- In-memory database
- Demo accounts
- CORS support
- Health monitoring

### Planned Features 🚧
- Real SMS integration (Twilio/Fast2SMS)
- Real email service (Resend/SMTP)
- AI assistant integration
- Persistent database (PostgreSQL/MongoDB)
- Real Google OAuth
- Two-factor authentication
- Social login (GitHub, etc.)

---

## 🔒 Security

### In Development ✅
- Password hashing (bcrypt)
- JWT token signing
- CORS protection
- Input validation

### In Production ⚠️
- Use HTTPS only
- Implement rate limiting
- Add request logging
- Use secure database
- Rotate JWT secrets
- Implement refresh tokens
- Add CSRF protection

---

## 📞 Support

### Getting Help

1. **Quick question?** → See [QUICK_START.md](./QUICK_START.md)
2. **Setup help?** → See [SETUP_LOCAL_AUTH.md](./SETUP_LOCAL_AUTH.md)
3. **Migrating?** → See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
4. **Server docs?** → See [server/README.md](./server/README.md)
5. **API reference?** → See endpoint documentation above

### Common Questions

**Q: Is this for production?**
A: No, this is for local development only.

**Q: How do I add SMS?**
A: Replace local logic with Twilio/Fast2SMS API calls.

**Q: Can I use a real database?**
A: Yes, replace in-memory Map with database queries.

**Q: What about Google OAuth?**
A: Currently simulated. Integrate Google OAuth SDK for real authentication.

---

## 🎓 Learning Resources

### Express.js
- [Express Documentation](https://expressjs.com/)
- [Express Tutorial](https://expressjs.com/en/starter/basic-routing.html)

### JWT
- [JWT Introduction](https://jwt.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

### bcrypt
- [bcrypt Package](https://www.npmjs.com/package/bcrypt)
- [Password Hashing Guide](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript for Node.js](https://nodejs.org/en/docs/guides/nodejs-guide-to-typescript/)

---

## 📊 Statistics

```
Project:             Campus Connect Hub
Architecture:        Frontend + Express Backend
Database:            In-Memory (Development)
Language:            TypeScript
Framework:           React + Express
Authentication:      JWT + bcrypt
External APIs:       0 (Zero!)
Supported Roles:     3 (Student, Admin, Organizer)
Demo Accounts:       3 (Pre-configured)
API Endpoints:       7 (Auth focused)
Development Setup:   5 minutes
Production Ready:    No (Development only)
```

---

## 🎯 Next Steps

1. ✅ Read [QUICK_START.md](./QUICK_START.md)
2. ✅ Install dependencies
3. ✅ Start both services
4. ✅ Test login with demo accounts
5. ✅ Explore the dashboard
6. ✅ Read complete documentation
7. ✅ Start building your features!

---

## 📝 Notes

- This setup is **development-only**
- Data is **NOT persistent** (resets on server restart)
- For production, use a real database and auth service
- No internet connection required
- Works offline
- Optimal for team development

---

## 🙏 Acknowledgments

Built with:
- Express.js
- TypeScript
- bcrypt
- jsonwebtoken
- React
- Vite

---

## 📄 License

MIT - GSFC University

---

**Last Updated:** September 20, 2026  
**Version:** 1.0.0  
**Status:** Active ✅

---

### Quick Links
- [QUICK_START.md](./QUICK_START.md) - Start here!
- [SETUP_LOCAL_AUTH.md](./SETUP_LOCAL_AUTH.md) - Full guide
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Migrate from old setup
- [server/README.md](./server/README.md) - Server documentation
