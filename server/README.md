# Campus Connect Hub - Local Auth Server

A lightweight Express.js authentication server for local development with **zero external API dependencies**.

## 🎯 Features

- ✅ **Email/Password Authentication** - Basic login with bcrypt hashing
- ✅ **User Registration** - Create new accounts locally
- ✅ **Google OAuth Simulation** - Local Google login emulation
- ✅ **JWT Token Management** - Secure session handling
- ✅ **In-Memory Database** - No external database required
- ✅ **CORS Support** - Ready for frontend integration
- ✅ **Demo Accounts** - Pre-seeded test accounts

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm run start
```

The server will start on `http://localhost:5001`

### 3. Verify It's Running

```bash
curl http://localhost:5001/api/health
```

## 📝 Demo Accounts

All passwords are **case-sensitive**:

### Student Account
```
Email: student@gsfcuniversity.ac.in
Password: Password@123
Role: student
Roll No: 20CS001
```

### Admin Account
```
Email: admin.dean@gsfcuniversity.ac.in
Password: AdminPass@123
Role: admin
Roll No: ADM-DEAN-001
```

### Organizer Account
```
Email: placement@gsfcuniversity.ac.in
Password: OrgPass@123
Role: organizer
Roll No: ORG-TPC-001
```

## 📡 API Endpoints

### Authentication

#### POST `/api/auth/login`
Email/Password login

**Request:**
```json
{
  "email": "student@gsfcuniversity.ac.in",
  "password": "Password@123",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
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

#### POST `/api/auth/register`
Register a new user

**Request:**
```json
{
  "email": "newuser@gsfcuniversity.ac.in",
  "password": "SecurePass@123",
  "name": "New User",
  "rollNo": "20CS999",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGc...",
  "user": { ... }
}
```

#### POST `/api/auth/google`
Google OAuth (local simulation)

**Request:**
```json
{
  "email": "user@gmail.com",
  "name": "User Name",
  "rollNo": "20CS500"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Google login successful",
  "token": "eyJhbGc...",
  "user": { ... }
}
```

#### POST `/api/auth/verify-token`
Verify if a JWT token is valid

**Request:**
```json
{
  "token": "eyJhbGc..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "user": { ... }
}
```

#### GET `/api/auth/me`
Get current user profile (requires Bearer token)

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "student-001",
    "email": "student@gsfcuniversity.ac.in",
    "name": "GSFC Student",
    "role": "student",
    "rollNo": "20CS001",
    "avatar": "ST",
    "createdAt": "2026-09-20T...",
    "lastLogin": "2026-09-20T..."
  }
}
```

#### POST `/api/auth/logout`
Logout user (requires Bearer token)

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### GET `/api/health`
Server health check

**Response:**
```json
{
  "status": "ok",
  "server": "Campus Connect Hub Auth Server",
  "timestamp": "2026-09-20T...",
  "uptime": 123.456
}
```

## 🔗 Frontend Integration

### 1. Update .env

```env
VITE_AUTH_SERVER_URL=http://localhost:5001
```

### 2. Use the Local API Client

```typescript
import { localApiClient } from "@/lib/api-client-local";

// Login
const response = await localApiClient.login(
  "student@gsfcuniversity.ac.in",
  "Password@123",
  "student"
);

if (response.success) {
  localStorage.setItem("authToken", response.token);
  // Redirect to dashboard
}
```

### 3. Verify Token on App Start

```typescript
const token = localStorage.getItem("authToken");
if (token) {
  const result = await localApiClient.verifyToken(token);
  if (result.success) {
    // Token valid, load user
  } else {
    // Token invalid, clear storage
    localStorage.removeItem("authToken");
  }
}
```

## 🔒 Security Notes

### Development Only
This server is designed for **local development only**. Do not use in production.

### Password Hashing
All passwords are hashed using `bcrypt` (10 rounds).

### JWT Secrets
- Default JWT Secret: `campus-connect-hub-local-jwt-secret-2026`
- Change in production via `JWT_SECRET` env variable

### Token Expiry
- Default expiry: 7 days
- Configure via `JWT_EXPIRY` env variable

## 📦 Environment Variables

Create `.env` file in `server/` directory:

```env
# Server Port
AUTH_SERVER_PORT=5001

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=7d

# Environment
NODE_ENV=development
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or use different port
AUTH_SERVER_PORT=5002 npm run dev
```

### Cannot Connect from Frontend
1. Check auth server is running: `curl http://localhost:5001/api/health`
2. Update `VITE_AUTH_SERVER_URL` in frontend .env
3. Verify CORS is enabled for your frontend URL

### Authentication Fails
1. Check email/password spelling (case-sensitive)
2. Ensure user exists in database (check server logs)
3. Verify token format in Authorization header: `Bearer <token>`

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Frontend (React + Vite)                       │
│        (http://localhost:5173)                          │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/JSON
                   ↓
┌─────────────────────────────────────────────────────────┐
│     Local Auth Server (Express + TypeScript)            │
│          (http://localhost:5001)                        │
├─────────────────────────────────────────────────────────┤
│  • Email/Password Authentication                        │
│  • Google OAuth (Simulated)                             │
│  • JWT Token Management                                 │
│  • User Registration                                    │
├─────────────────────────────────────────────────────────┤
│     In-Memory Database (No External APIs)               │
│  • Users (email, password, profile, role)               │
│  • Sessions (token management)                          │
└─────────────────────────────────────────────────────────┘
```

## ✨ What's Removed

This server has **zero external API dependencies**:

- ❌ Supabase database
- ❌ Twilio SMS
- ❌ Fast2SMS
- ❌ Resend email service
- ❌ OpenAI API
- ❌ All other third-party services

Everything runs locally!

## 📝 Next Steps

1. **Start the auth server**: `npm run dev`
2. **Update frontend**: Use `localApiClient` for authentication
3. **Test demo accounts**: Login with provided credentials
4. **Customize**: Add more users, change demo data as needed

## 📄 License

MIT - GSFC University
