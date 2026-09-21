# 📚 Database Setup Guide

## Overview

This guide explains how to set up the Campus Connect Hub database using Supabase.

## Prerequisites

- Supabase account (https://supabase.com)
- PostgreSQL database instance from Supabase
- Node.js 18+

## Step 1: Set Up Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_xxxxxxxxxxxxx"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_xxxxxxxxxxxxx"
DATABASE_URL="postgresql://username:password@host:5432/postgres"

# AI Campus Assistant Configuration
OPENAI_API_KEY="sk-xxxxxxxxxxxxx"
OPENAI_BASE_URL="http://localhost:20128/v1"
OPENAI_MODEL="gemini/gemini-3.8-flash"

# Email Service — Resend
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="Campus Connect Hub"
```

### How to Get These Values

1. **VITE_SUPABASE_URL**: 
   - Go to Supabase Dashboard → Settings → API
   - Copy the Project URL

2. **VITE_SUPABASE_ANON_KEY**:
   - Go to Supabase Dashboard → Settings → API → Publishable key
   - Copy the "Publishable Key" (starts with `sb_publishable_`)

3. **SUPABASE_SERVICE_ROLE_KEY**:
   - Go to Supabase Dashboard → Settings → API → Secret key
   - Copy the "Secret Key" (starts with `sb_secret_`)
   - ⚠️ **Keep this secure! Don't commit it!**

4. **DATABASE_URL**:
   - Go to Supabase Dashboard → Settings → Database
   - Copy the connection string
   - Format: `postgresql://user:password@host:5432/postgres`

## Step 2: Execute Database Schema

The database schema is defined in `CORRECT_DATABASE_SETUP.sql`.

### Option A: Using Supabase Dashboard

1. Go to https://app.supabase.com
2. Select your project
3. Go to **SQL Editor**
4. Create a **New Query**
5. Copy the entire content of `CORRECT_DATABASE_SETUP.sql`
6. Paste it into the query editor
7. Click **Run** or press `Ctrl+Enter`
8. Wait for "Success: No rows returned" message

### Option B: Using psql CLI

```bash
psql $DATABASE_URL < CORRECT_DATABASE_SETUP.sql
```

## Step 3: Verify Database Setup

Check that all tables were created:

```bash
npm run verify-db  # If available
# or
psql $DATABASE_URL -c "\dt public.*"
```

Expected 21 tables:
- accounts
- new_registered_students
- events
- registrations
- attendance_records
- event_feedback
- vehicle_records
- visitor_records
- pending_checkin
- clubs
- club_members
- club_activities
- verified_achievements
- campus_announcements
- campus_services
- internships
- internship_applications
- internship_attendance_records
- internship_approval_records
- internship_notifications
- event_broadcasts

## Database Schema Overview

### Core Tables (2)
- **accounts** - User authentication and roles
- **new_registered_students** - Student registry with verification

### Event Management (4)
- **events** - Event details with QR check-in support
- **registrations** - Event registrations with team support
- **attendance_records** - Attendance logs with location verification
- **event_feedback** - User ratings and reviews

### Security & Access (3)
- **vehicle_records** - Vehicle parking management
- **visitor_records** - Visitor check-in with QR passes
- **pending_checkin** - Offline attendance sync queue

### Community (5)
- **clubs** - Club directory with categories
- **club_members** - Club membership tracking
- **club_activities** - Club events and activities
- **verified_achievements** - Certificates and badges
- **campus_announcements** - University broadcasts

### Internship System (5)
- **internships** - Internship job postings
- **internship_applications** - Application tracking with workflow
- **internship_attendance_records** - Daily punch in/out records
- **internship_approval_records** - Admin & Dean review logs
- **internship_notifications** - Status update notifications

### Additional Services (2)
- **campus_services** - Service directory
- **event_broadcasts** - Event notifications

## Features Enabled

✅ Event management with QR code check-in
✅ Real-time attendance tracking
✅ Student registry with academic integrity
✅ Club management and membership
✅ Internship application portal with multi-stage approval
✅ Visitor and vehicle security management
✅ Achievement and certificate verification
✅ Campus announcements and services
✅ Location-based verification
✅ Offline attendance sync

## Troubleshooting

### Error: "Unable to load student records from database"

**Solution:**
- Verify `CORRECT_DATABASE_SETUP.sql` was executed successfully
- Check that `new_registered_students` table exists
- Verify credentials in `.env` are correct
- Refresh the application

### Error: "SUPABASE_SERVICE_ROLE_KEY is not configured"

**Solution:**
- Add `SUPABASE_SERVICE_ROLE_KEY` to `.env`
- Restart your development server
- Restart the application

### Slow database queries

**Solution:**
- All indexes are created by default in `CORRECT_DATABASE_SETUP.sql`
- Check Supabase project is in active region
- Consider adding more indexes if needed

### Connection timeout

**Solution:**
- Check internet connection
- Verify Supabase project is running
- Check if IP is whitelisted in Supabase
- Try using the pooler connection string

## Security Notes

- 🔒 `.env` is in `.gitignore` - **never commit it**
- 🔒 `SUPABASE_SERVICE_ROLE_KEY` has full admin access
- 🔒 All tables have Row-Level Security (RLS) enabled
- 🔒 Use different keys for development and production
- 🔒 Rotate keys regularly
- 🔒 Never share secret keys

## Files Reference

| File | Purpose |
|------|---------|
| `CORRECT_DATABASE_SETUP.sql` | Complete database schema |
| `.env` | Local environment variables (not committed) |
| `.env.example` | Template for environment variables |
| `.gitignore` | Excludes `.env` and sensitive files |

## Next Steps

1. ✅ Set up `.env` file with credentials
2. ✅ Execute `CORRECT_DATABASE_SETUP.sql`
3. ✅ Verify all 21 tables exist
4. ✅ Start the application: `npm run dev`
5. ✅ Test the features

## Support

For issues, check:
- Supabase Dashboard for error logs
- Database connection in Settings
- `.env` variables are correct
- All 21 tables exist

---

**Last Updated:** September 2026
**Database Version:** Production Ready
