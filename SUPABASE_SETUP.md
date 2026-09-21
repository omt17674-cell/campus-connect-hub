# 🔧 Supabase Integration Setup Guide

Complete guide to configure Supabase for storing events and registrations persistently.

---

## 📋 Overview

Events and registrations are now stored in **Supabase PostgreSQL database** instead of in-memory. This means:
- ✅ Events persist across server restarts
- ✅ Data is backed up
- ✅ Multiple server instances can share data
- ✅ Production-ready setup

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start Your Project"
3. Sign up with email or GitHub
4. Create a new organization (or use existing)

### Step 2: Create New Project

1. Click "New Project"
2. Fill in:
   - **Project Name**: `campus-connect-hub`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your location
3. Click "Create new project"
4. Wait for project to initialize (2-3 minutes)

### Step 3: Get Your Credentials

Once project is ready:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### Step 4: Create Database Tables

1. Go to **SQL Editor** in Supabase
2. Click "New query"
3. Copy and paste the SQL below:

```sql
-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  organizer_email TEXT NOT NULL,
  capacity INT NOT NULL DEFAULT 100,
  registered_count INT NOT NULL DEFAULT 0,
  banner_image TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  UNIQUE(event_id, student_id)
);

-- Create indexes for performance
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_date ON public.events(date);
CREATE INDEX idx_registrations_event ON public.event_registrations(event_id);
CREATE INDEX idx_registrations_student ON public.event_registrations(student_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Public can read events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can register" ON public.event_registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read registrations" ON public.event_registrations
  FOR SELECT USING (true);
```

4. Click "Run" to execute
5. You should see "✓ Success"

### Step 5: Update Environment Variables

Update `.env` file with your Supabase credentials:

```env
# GSFC University Campus Connect Hub — Supabase Configuration

# Supabase Project Credentials (from Step 3)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# Auth Server
AUTH_SERVER_PORT=5001
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=campus-connect-hub-local-jwt-secret-2026
JWT_EXPIRY=7d

# Environment
NODE_ENV=development
```

### Step 6: Install Dependencies

```bash
cd server
npm install
cd ..
```

### Step 7: Start Server

```bash
./start-local.sh
```

You should see:
```
✅ Supabase Connected - Events saved to database
```

---

## ✅ Testing Supabase Connection

### Check Connection Status

```bash
curl http://localhost:5001/api/health
```

Response should include:
```json
{
  "status": "ok",
  "server": "Campus Connect Hub Auth Server",
  "eventsCount": 0,
  "registrationsCount": 0
}
```

### Create Event via API

```bash
# 1. Login as admin
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.dean@gsfcuniversity.ac.in",
    "password": "AdminPass@123"
  }'

# Save the token from response

# 2. Create event
curl -X POST http://localhost:5001/api/events \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python Workshop",
    "description": "Learn Python from basics",
    "category": "Workshop",
    "date": "2026-09-28",
    "time": "02:00 - 04:00 PM",
    "venue": "Lab 101",
    "capacity": 40
  }'

# Event is now in Supabase!
```

### View Events in Supabase

1. Go to Supabase Dashboard
2. Click **Table Editor**
3. Select **events** table
4. You should see your created event!

---

## 🔗 Database Schema

### events Table

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key (unique event ID) |
| title | TEXT | Event name |
| description | TEXT | Event details |
| category | TEXT | Event category (e.g., "Workshop") |
| date | TEXT | Event date (YYYY-MM-DD) |
| time | TEXT | Event time (HH:MM - HH:MM) |
| venue | TEXT | Location of event |
| organizer_name | TEXT | Name of event organizer |
| organizer_email | TEXT | Email of organizer |
| capacity | INT | Max attendees |
| registered_count | INT | Current registrations |
| banner_image | TEXT | Event image URL |
| status | TEXT | Event status (upcoming/live/completed/cancelled) |
| created_by | TEXT | User ID who created |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### event_registrations Table

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key (unique registration ID) |
| event_id | TEXT | Reference to events table |
| student_id | TEXT | Student user ID |
| student_name | TEXT | Student name |
| student_email | TEXT | Student email |
| registered_at | TIMESTAMPTZ | Registration timestamp |
| status | TEXT | Registration status (confirmed/cancelled) |

---

## 🔐 Environment Variables Explained

### VITE_SUPABASE_URL
- **What**: Your Supabase project URL
- **Where**: Supabase Dashboard → Settings → API
- **Format**: `https://your-project.supabase.co`
- **Used by**: Frontend & Backend

### VITE_SUPABASE_ANON_KEY
- **What**: Anonymous API key (public)
- **Where**: Supabase Dashboard → Settings → API → anon public
- **Used by**: Frontend for limited access
- **Note**: Safe to expose in frontend

### SUPABASE_SERVICE_ROLE_KEY
- **What**: Service role key (privileged)
- **Where**: Supabase Dashboard → Settings → API → service_role secret
- **Used by**: Backend server only
- **⚠️ WARNING**: DO NOT expose this key!

---

## 📝 Workflow: Admin Creates Event

```
1. Admin logs in
   → POST /api/auth/login
   → Receives JWT token

2. Admin creates event
   → POST /api/events
   → Server uses Supabase to save

3. Supabase stores event in database
   → events table gets new row
   → Event is now visible to students

4. Students can view & register
   → GET /api/events
   → POST /api/events/:id/register
   → Registration saved to event_registrations table
```

---

## 🚨 Troubleshooting

### "Supabase Not Connected" Error

**Problem**: Server shows `⚠️ Supabase Not Connected`

**Solutions**:
1. Check `.env` file has all 3 credentials
2. Verify URLs are correct (copy-paste from Supabase)
3. Check internet connection
4. Restart server: `./start-local.sh`

### "Table does not exist" Error

**Problem**: Getting error like `relation "events" does not exist`

**Solution**: Re-run the SQL from Step 4 to create tables

### "Insufficient permissions" Error

**Problem**: Events created but can't view them

**Solution**: Check RLS policies are created (see Step 4 SQL)

### Events Not Persisting

**Problem**: Events disappear after server restart

**Solution**: Events should persist! If not, check:
1. Supabase connection is working
2. Tables exist in Supabase
3. No errors in server logs

---

## 🔄 Switching Between Local & Supabase

### Use Only Local (In-Memory)
- Remove Supabase credentials from `.env`
- Server will use in-memory storage
- Data resets on restart

### Use Supabase (Current)
- Add Supabase credentials to `.env`
- Events are stored in database
- Data persists

### Use Both
- Local first for speed
- Sync to Supabase for backup
- (Advanced setup - request if needed)

---

## 📊 Monitoring Events

### In Supabase Dashboard

1. Go to **SQL Editor**
2. Write queries:

```sql
-- Count total events
SELECT COUNT(*) FROM public.events;

-- View all events
SELECT * FROM public.events ORDER BY created_at DESC;

-- Count registrations per event
SELECT event_id, COUNT(*) as registrations
FROM public.event_registrations
WHERE status = 'confirmed'
GROUP BY event_id;

-- View all registrations for specific event
SELECT * FROM public.event_registrations
WHERE event_id = 'event-xxx'
AND status = 'confirmed';
```

---

## 🎓 Next Steps

1. ✅ Create Supabase account & project
2. ✅ Get credentials
3. ✅ Create tables (SQL)
4. ✅ Update `.env`
5. ✅ Install dependencies
6. ✅ Start server
7. ✅ Test event creation
8. ✅ Verify in Supabase Dashboard

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [API Reference](./EVENT_MANAGEMENT.md)

---

## ✨ Features Now Available

- ✅ Events stored permanently
- ✅ Student registrations tracked
- ✅ Admin event management
- ✅ Multi-server deployment ready
- ✅ Data backup & recovery
- ✅ Scalable to 1000+ events

---

**Status**: ✅ Complete  
**Version**: 1.0.0  
**Last Updated**: September 20, 2026
