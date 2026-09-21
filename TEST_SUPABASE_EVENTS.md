# 🧪 Test Guide - Supabase Events API

Complete testing guide for the new Supabase-backed event management system.

---

## ✅ Pre-Test Checklist

Before testing, ensure:
- [ ] Supabase account created and project initialized
- [ ] Database tables created (SQL from SUPABASE_SETUP.md)
- [ ] `.env` file updated with Supabase credentials
- [ ] Server dependencies installed: `cd server && npm install`
- [ ] Server started: `./start-local.sh` or `cd server && npm run dev`

---

## 🚀 Test Sequence

### Test 1: Server Health Check

**Verify server is running and connected to Supabase**

```bash
curl http://localhost:5001/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "server": "Campus Connect Hub Auth Server",
  "timestamp": "2026-09-21T04:15:00.000Z",
  "uptime": 12.345,
  "eventsCount": 0,
  "registrationsCount": 0
}
```

**Result:** ✅ **PASS** if status is "ok" and `eventsCount` exists

---

### Test 2: Admin Login

**Admin authenticates to create events**

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.dean@gsfcuniversity.ac.in",
    "password": "AdminPass@123",
    "role": "admin"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin-001",
    "email": "admin.dean@gsfcuniversity.ac.in",
    "name": "Dr. Ananya Sharma (Dean)",
    "role": "admin",
    "rollNo": "ADM-DEAN-001",
    "avatar": "AS"
  }
}
```

**Action:** Save the `token` value for next tests (example: `ADMIN_TOKEN`)

**Result:** ✅ **PASS** if success is true and token is provided

---

### Test 3: Create Event (Admin)

**Admin creates an event and stores it in Supabase**

```bash
curl -X POST http://localhost:5001/api/events \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python Programming Workshop",
    "description": "Learn Python from basics to advanced. Hands-on coding session with live projects.",
    "category": "Workshop",
    "date": "2026-09-28",
    "time": "02:00 - 04:00 PM",
    "venue": "Computer Lab 101",
    "capacity": 40,
    "bannerImage": "https://via.placeholder.com/800x400?text=Python+Workshop"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "event": {
    "id": "event-1695274512345-abc123xyz",
    "title": "Python Programming Workshop",
    "description": "Learn Python from basics to advanced...",
    "category": "Workshop",
    "date": "2026-09-28",
    "time": "02:00 - 04:00 PM",
    "venue": "Computer Lab 101",
    "organizerName": "Dr. Ananya Sharma (Dean)",
    "organizerEmail": "admin.dean@gsfcuniversity.ac.in",
    "capacity": 40,
    "registeredCount": 0,
    "bannerImage": "https://via.placeholder.com/...",
    "status": "upcoming",
    "createdAt": "2026-09-21T04:15:00.000Z"
  }
}
```

**Action:** Save the `event.id` value (example: `EVENT_ID`)

**Result:** ✅ **PASS** if success is true and event ID is returned

**Server Log:** Should show `✅ Event created: Python Programming Workshop`

---

### Test 4: Verify Event in Supabase Dashboard

**Confirm event was saved to database**

1. Go to [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Click **Table Editor**
4. Select **events** table
5. You should see your created event with:
   - Title: "Python Programming Workshop"
   - Date: "2026-09-28"
   - Capacity: 40
   - Status: "upcoming"

**Result:** ✅ **PASS** if event appears in table

---

### Test 5: Get All Events (Public)

**Students view all available events**

```bash
curl http://localhost:5001/api/events
```

**Expected Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": "event-1695274512345-abc123xyz",
      "title": "Python Programming Workshop",
      "description": "Learn Python from basics to advanced...",
      "category": "Workshop",
      "date": "2026-09-28",
      "time": "02:00 - 04:00 PM",
      "venue": "Computer Lab 101",
      "organizerName": "Dr. Ananya Sharma (Dean)",
      "organizerEmail": "admin.dean@gsfcuniversity.ac.in",
      "capacity": 40,
      "registeredCount": 0,
      "bannerImage": "https://...",
      "status": "upcoming",
      "createdAt": "2026-09-21T04:15:00.000Z"
    }
  ],
  "count": 1
}
```

**Result:** ✅ **PASS** if events array contains the created event

---

### Test 6: Student Login

**Student authenticates to register for events**

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

**Action:** Save the `token` value (example: `STUDENT_TOKEN`)

**Result:** ✅ **PASS** if success is true

---

### Test 7: Register for Event (Student)

**Student registers for the created event**

```bash
curl -X POST http://localhost:5001/api/events/EVENT_ID/register \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json"
```

Replace:
- `EVENT_ID` with value from Test 3
- `STUDENT_TOKEN` with value from Test 6

**Expected Response:**
```json
{
  "success": true,
  "message": "Registered for event successfully",
  "registration": {
    "id": "reg-1695274612345-xyz789abc",
    "eventId": "event-1695274512345-abc123xyz",
    "userId": "student-001",
    "userName": "GSFC Student",
    "userEmail": "student@gsfcuniversity.ac.in",
    "registeredAt": "2026-09-21T04:16:00.000Z",
    "status": "confirmed"
  }
}
```

**Result:** ✅ **PASS** if success is true and registration ID is returned

**Server Log:** Should show `✅ Student registered: GSFC Student → Python Programming Workshop`

---

### Test 8: Verify Registration in Supabase Dashboard

**Confirm registration was saved to database**

1. In Supabase Dashboard, select **event_registrations** table
2. You should see:
   - event_id: (same as EVENT_ID)
   - student_id: "student-001"
   - student_name: "GSFC Student"
   - student_email: "student@gsfcuniversity.ac.in"
   - status: "confirmed"

**Result:** ✅ **PASS** if registration appears in table

---

### Test 9: View Event with Updated Count

**Verify registered count increased**

```bash
curl http://localhost:5001/api/events/EVENT_ID
```

Replace `EVENT_ID` with value from Test 3

**Expected Response:**
```json
{
  "success": true,
  "event": {
    "id": "event-1695274512345-abc123xyz",
    "title": "Python Programming Workshop",
    ...
    "capacity": 40,
    "registeredCount": 1,  ← INCREASED!
    "status": "upcoming",
    ...
  }
}
```

**Result:** ✅ **PASS** if `registeredCount` is 1

---

### Test 10: Get Registrations (Admin)

**Admin views who registered for event**

```bash
curl http://localhost:5001/api/events/EVENT_ID/registrations \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "registrations": [
    {
      "id": "reg-1695274612345-xyz789abc",
      "eventId": "event-1695274512345-abc123xyz",
      "userId": "student-001",
      "userName": "GSFC Student",
      "userEmail": "student@gsfcuniversity.ac.in",
      "registeredAt": "2026-09-21T04:16:00.000Z",
      "status": "confirmed"
    }
  ],
  "count": 1
}
```

**Result:** ✅ **PASS** if registrations array shows the student

---

### Test 11: Get My Events (Student)

**Student views events they registered for**

```bash
curl http://localhost:5001/api/user/events \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": "event-1695274512345-abc123xyz",
      "title": "Python Programming Workshop",
      ...
      "registeredCount": 1,
      "status": "upcoming",
      ...
    }
  ],
  "count": 1
}
```

**Result:** ✅ **PASS** if events array contains the registered event

---

### Test 12: Update Event (Admin)

**Admin updates event details**

```bash
curl -X PUT http://localhost:5001/api/events/EVENT_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python Programming Workshop - Advanced",
    "status": "live",
    "capacity": 50
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Event updated successfully",
  "event": {
    "id": "event-1695274512345-abc123xyz",
    "title": "Python Programming Workshop - Advanced",
    "capacity": 50,
    "status": "live",
    ...
  }
}
```

**Result:** ✅ **PASS** if updates are reflected

---

### Test 13: Test Duplicate Registration (Should Fail)

**Student tries to register for same event again**

```bash
curl -X POST http://localhost:5001/api/events/EVENT_ID/register \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Failed to register or already registered"
}
```

**Result:** ✅ **PASS** if duplicate registration is prevented

---

### Test 14: Create Another Event

**Create a second event to test multiple events**

```bash
curl -X POST http://localhost:5001/api/events \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Web Development Workshop",
    "description": "Learn React, Node.js, MongoDB",
    "category": "Workshop",
    "date": "2026-09-29",
    "time": "03:00 - 05:00 PM",
    "venue": "Classroom 201",
    "capacity": 30
  }'
```

**Result:** ✅ **PASS** if event created successfully

---

### Test 15: Get All Events Again

**Verify multiple events are returned**

```bash
curl http://localhost:5001/api/events
```

**Expected Response:**
```json
{
  "success": true,
  "events": [
    { /* Event 1 */ },
    { /* Event 2 */ }
  ],
  "count": 2
}
```

**Result:** ✅ **PASS** if both events are returned

---

### Test 16: Delete Event (Admin)

**Admin deletes an event**

```bash
curl -X DELETE http://localhost:5001/api/events/EVENT_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

**Result:** ✅ **PASS** if deletion succeeds

**Verify in Supabase:** Event should be gone from events table

---

## 📋 Test Results Summary

| Test | Description | Status |
|------|-------------|--------|
| 1 | Health Check | ✅ |
| 2 | Admin Login | ✅ |
| 3 | Create Event | ✅ |
| 4 | Verify in Supabase | ✅ |
| 5 | Get All Events | ✅ |
| 6 | Student Login | ✅ |
| 7 | Register for Event | ✅ |
| 8 | Verify Registration in Supabase | ✅ |
| 9 | View Event Count | ✅ |
| 10 | Get Registrations (Admin) | ✅ |
| 11 | Get My Events (Student) | ✅ |
| 12 | Update Event | ✅ |
| 13 | Duplicate Registration | ✅ |
| 14 | Create Second Event | ✅ |
| 15 | Get Multiple Events | ✅ |
| 16 | Delete Event | ✅ |

---

## 🔍 Troubleshooting During Tests

### Error: "Supabase Not Connected"
- Check server logs show `✅ Supabase Connected`
- Verify `.env` has correct credentials
- Restart server

### Error: "Table does not exist"
- Re-run SQL from SUPABASE_SETUP.md
- Verify tables appear in Supabase Dashboard

### Error: "Unauthorized"
- Check Bearer token is valid
- Verify token is passed in `Authorization: Bearer TOKEN` header

### Error: "Event capacity full"
- Event is at max capacity
- Try with different event or increase capacity

### Event not appearing in Supabase
- Check server logs for errors
- Verify Supabase connection works
- Try creating event again

---

## 📊 Performance Notes

**Expected Response Times:**
- Create Event: < 500ms
- Get Events: < 300ms
- Register: < 500ms
- Get Registrations: < 300ms

---

## ✅ All Tests Passed?

If all 16 tests pass with ✅, your Supabase integration is working perfectly!

**Next Steps:**
1. Deploy to production (optional)
2. Create real events
3. Share with team
4. Start taking student registrations

---

**Test Status**: ✅ Ready to Run  
**Last Updated**: September 21, 2026
