# 🚀 Campus Connect Hub - Quick Start Guide

Get the app running in 60 seconds with zero external APIs.

## Installation (2 minutes)

```bash
# Clone and install
git clone https://github.com/omt17674-cell/campus-connect-hub.git
cd campus-connect-hub

# Install all dependencies
npm install
cd server && npm install && cd ..
```

## Start Everything (1 click)

### Mac/Linux
```bash
./start-local.sh
```

### Windows
```bash
start-local.bat
```

### Manual Start
```bash
# Terminal 1: Auth Server
cd server && npm run dev

# Terminal 2: Frontend
npm run dev
```

## Login

Open **http://localhost:5173** and use any demo account:

| Role | Email | Password | 
|------|-------|----------|
| 👤 Student | `student@gsfcuniversity.ac.in` | `Password@123` |
| 👨‍💼 Admin | `admin.dean@gsfcuniversity.ac.in` | `AdminPass@123` |
| 💼 Organizer | `placement@gsfcuniversity.ac.in` | `OrgPass@123` |

## What's Running

```
Frontend ────────────────► http://localhost:5173
Auth Server ─────────────► http://localhost:5001
             (No External APIs)
```

## API Endpoints

```
POST   /api/auth/login              Email/password login
POST   /api/auth/register           Create new account  
POST   /api/auth/google             Google OAuth (simulated)
GET    /api/auth/me                 Get user profile
POST   /api/auth/logout             Logout
POST   /api/auth/verify-token       Verify JWT token
GET    /api/health                  Server health
```

## Test Login

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@gsfcuniversity.ac.in",
    "password": "Password@123"
  }'
```

## What's Removed

✅ No Supabase  
✅ No Twilio  
✅ No Fast2SMS  
✅ No Resend Email  
✅ No OpenAI  
✅ **Everything runs locally!**

## Environment

Frontend `.env.local`:
```env
VITE_AUTH_SERVER_URL=http://localhost:5001
```

Server `.env`:
```env
AUTH_SERVER_PORT=5001
JWT_SECRET=local-secret-key
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port in use | `lsof -i :5001 \| xargs kill -9` |
| Can't connect | Check `http://localhost:5001/api/health` |
| Login fails | Check email/password spelling |
| Module not found | Run `npm install` in server directory |

## Documentation

- 📖 [Full Setup Guide](./SETUP_LOCAL_AUTH.md)
- 📚 [Server Documentation](./server/README.md)
- 🔗 [API Reference](./server/README.md#-api-endpoints)

## Next Steps

1. ✅ Start services
2. ✅ Login with demo account
3. ✅ Explore the dashboard
4. ✅ Register new account
5. ✅ Build your features!

---

**Need more help?** See [SETUP_LOCAL_AUTH.md](./SETUP_LOCAL_AUTH.md) for complete documentation.

**Ready to code?** Start building! 🎉
