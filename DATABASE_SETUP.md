# Database Setup Guide

## Internship Tables Setup

To set up the internship management system tables in your Supabase database:

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Schema Script

1. Open the file: `supabase-schema.sql`
2. Copy the entire SQL content
3. Paste it into the Supabase SQL Editor
4. Click **Run** button

### Step 3: Verify Tables Created

After running the script, you should see these new tables:

- ✅ **internships** - Stores internship opportunities
- ✅ **internship_applications** - Student applications
- ✅ **internship_attendance** - Daily attendance records

### Step 4: Check in Table Editor

1. Go to **Table Editor** in Supabase
2. You should now see the new tables listed
3. They should match the screenshot in Image 1

## What the Tables Store

### 1. internships
- Company name and internship details
- Skills required, eligibility
- Start/end dates, stipend
- Application deadline
- Status (open/closed/draft)

### 2. internship_applications
- Student application details
- Academic information (CGPA, semester)
- Resume and documents
- **Status workflow**: SUBMITTED → ADMIN_REVIEW → APPROVED
- Faculty coordinator approval comments

### 3. internship_attendance
- Daily GPS punch-in/out records
- Working hours calculation
- Location verification
- Tasks summary and notes

## Simplified Approval Workflow

As per your requirement, we've simplified the approval process:

**Old**: Application → Admin Review → Dean Review → Approved
**New**: Application → Faculty Coordinator Review → Approved ✅

This reduces approval time significantly!

## Troubleshooting

### If tables don't appear:
1. Check for SQL errors in the editor
2. Make sure you're in the correct project
3. Refresh the Table Editor page

### If you see permission errors:
1. Make sure RLS policies are created (they're in the script)
2. The service role should have full access

### To reset and start fresh:
```sql
DROP TABLE IF EXISTS internship_attendance CASCADE;
DROP TABLE IF EXISTS internship_applications CASCADE;
DROP TABLE IF EXISTS internships CASCADE;
```
Then run the schema script again.

## Next Steps

After tables are created:
1. ✅ Tables appear in Supabase
2. ✅ Date filter is fixed (shows dd/mm/yyyy)
3. ✅ QR codes generate properly with high quality
4. ✅ Certificates include GSFC logo

Ready to use! 🎉
