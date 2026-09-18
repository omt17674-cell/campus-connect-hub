# Debug Guide: Student Registration Not Showing in Admin

## Quick Diagnosis Steps

### Step 1: Check if Registration Actually Saved to Supabase

**Method A: Using Browser Console**
```javascript
// After student registers, run this in browser console:
const { data, error } = await supabase
  .from('new_registered_students')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(5);

console.log('Recent students:', data);
console.log('Error:', error);
```

**Method B: Check Supabase Dashboard**
1. Go to https://supabase.com
2. Open your project
3. Click "Table Editor"
4. Click `new_registered_students` table
5. Sort by `created_at` descending
6. Check if your new student appears

### Step 2: Check if Admin is Loading from Supabase

**Add this to browser console when logged in as Admin:**
```javascript
// Check current state
const state = campusStore.getState();
console.log('Students in state:', state.newRegisteredStudents?.length);
console.log('Students:', state.newRegisteredStudents);

// Force a manual load
await campusStore.loadFromSupabase();
console.log('After sync:', campusStore.getState().newRegisteredStudents?.length);
```

### Step 3: Check Supabase Connection

**Run in console:**
```javascript
// Test Supabase connection
const { data: testData, error: testError } = await supabase
  .from('new_registered_students')
  .select('count');

console.log('Connection test:', { data: testData, error: testError });
```

## Common Issues and Solutions

### Issue 1: Supabase Environment Variables Missing

**Check:**
- Open `.env` file
- Verify these exist:
  - `VITE_SUPABASE_URL=https://your-project.supabase.co`
  - `VITE_SUPABASE_ANON_KEY=your-anon-key`

**Fix:**
- Copy from `.env.example`
- Get keys from Supabase dashboard → Settings → API
- Restart dev server after updating `.env`

### Issue 2: Registration Fails Silently

**Check Network Tab:**
1. Open DevTools → Network tab
2. Register a student
3. Find POST request to `/api/students/register`
4. Check response:
   - ✅ Status 201 = Success
   - ❌ Status 409 = Already registered
   - ❌ Status 500 = Server error

**Look for error in response body:**
```json
{
  "success": false,
  "message": "Database insertion failed: ..."
}
```

### Issue 3: Admin Not Subscribed to Realtime

**Check in console (while Admin panel is open):**
```javascript
// Check active subscriptions
supabase.getChannels().forEach(channel => {
  console.log('Channel:', channel.topic, 'State:', channel.state);
});
```

**Expected output:**
```
Channel: admin-student-registry-sync State: joined
```

**Fix if not subscribed:**
- Refresh admin panel
- Check console for subscription errors
- Verify Supabase Realtime is enabled in project settings

### Issue 4: Data in Supabase but Not Loading

**This means the issue is in `loadFromSupabase()` function**

**Debug by adding logs:**
```typescript
// In campus-store.ts → loadFromSupabase()
async loadFromSupabase(): Promise<void> {
  console.log('🔄 Starting Supabase sync...');
  
  // After fetching students:
  const { data: supaStudents, error: stuFetchErr } = await supabase
    .from("new_registered_students")
    .select("*")
    .order("created_at", { ascending: false });
    
  console.log('📚 Fetched students:', supaStudents?.length, 'Error:', stuFetchErr);
  console.log('📚 Student data:', supaStudents);
}
```

### Issue 5: LocalStorage Conflict

**Admin might be viewing cached data instead of Supabase data**

**Clear localStorage and test:**
```javascript
// Clear all local data
localStorage.clear();
// Reload page
window.location.reload();
```

Then log in as admin and check registry.

### Issue 6: Timing Issue - Data Not Yet Synced

**The admin loads before Supabase sync completes**

**Current fixes in place:**
- Login triggers sync after 300ms delay
- Registry button click triggers sync
- Automatic polling every 4 seconds
- Realtime subscription for instant updates

**Manual workaround:**
- Wait 5 seconds after student registers
- Click "Sync Supabase" button
- Student should appear

## Debugging Script

**Paste this in browser console to get full diagnostic:**

```javascript
async function diagnoseRegistrationIssue() {
  console.log('🔍 Running Registration Diagnostic...\n');
  
  // 1. Check Supabase connection
  console.log('1️⃣ Testing Supabase Connection...');
  const { data: connTest, error: connError } = await supabase
    .from('new_registered_students')
    .select('count');
  console.log(connError ? '❌ Connection failed:' : '✅ Connected:', 
              connError || connTest);
  
  // 2. Count students in Supabase
  console.log('\n2️⃣ Counting students in Supabase...');
  const { data: allStudents, error: fetchError } = await supabase
    .from('new_registered_students')
    .select('*');
  console.log(`Found ${allStudents?.length || 0} students in Supabase`);
  if (fetchError) console.error('Fetch error:', fetchError);
  
  // 3. Check app state
  console.log('\n3️⃣ Checking app state...');
  const state = campusStore.getState();
  console.log(`App state has ${state.newRegisteredStudents?.length || 0} students`);
  console.log('Current user role:', state.currentRole);
  console.log('Is authenticated:', state.isAuthenticated);
  
  // 4. Check realtime subscriptions
  console.log('\n4️⃣ Checking realtime subscriptions...');
  const channels = supabase.getChannels();
  console.log(`Active channels: ${channels.length}`);
  channels.forEach(ch => {
    console.log(`  - ${ch.topic}: ${ch.state}`);
  });
  
  // 5. Force sync and compare
  console.log('\n5️⃣ Forcing sync from Supabase...');
  await campusStore.loadFromSupabase();
  const stateAfter = campusStore.getState();
  console.log(`After sync: ${stateAfter.newRegisteredStudents?.length || 0} students`);
  
  // 6. Show recent students
  console.log('\n6️⃣ Recent registrations (last 5):');
  const recent = allStudents?.slice(0, 5) || [];
  recent.forEach((s, i) => {
    console.log(`  ${i+1}. ${s.full_name} (${s.roll_no}) - ${s.created_at}`);
  });
  
  // 7. Summary
  console.log('\n📊 SUMMARY:');
  console.log(`Supabase students: ${allStudents?.length || 0}`);
  console.log(`App state students: ${stateAfter.newRegisteredStudents?.length || 0}`);
  if (allStudents?.length === stateAfter.newRegisteredStudents?.length) {
    console.log('✅ Data is in sync!');
  } else {
    console.log('⚠️ Data mismatch! Run campusStore.loadFromSupabase() and check console errors.');
  }
}

// Run it
diagnoseRegistrationIssue();
```

## Expected Behavior

### When Student Registers:
1. POST `/api/students/register` returns 201
2. Data saved to `new_registered_students` table
3. Data saved to `accounts` table
4. Student gets success message
5. Supabase broadcasts change to all subscribers

### When Admin Views Registry:
1. `loadFromSupabase()` called on component mount
2. Fetches all students from `new_registered_students` table
3. Updates `campusStore` state
4. UI re-renders with new data
5. Realtime subscription listens for new changes

### Real-time Update Flow:
```
Student registers
    ↓
Supabase writes to DB
    ↓
Supabase broadcasts postgres_changes event
    ↓
Admin panel receives event via subscription
    ↓
Triggers campusStore.loadFromSupabase()
    ↓
Toast notification appears
    ↓
UI updates with new student
```

## Still Not Working?

### Last Resort Checklist:

1. ✅ Supabase credentials in `.env` are correct
2. ✅ Supabase project has tables: `new_registered_students`, `accounts`
3. ✅ Tables have correct schema (check `supabase-schema.sql`)
4. ✅ Realtime is enabled in Supabase project settings
5. ✅ No JavaScript errors in console
6. ✅ Network tab shows successful API calls
7. ✅ Admin is actually logged in (check state.isAuthenticated)
8. ✅ Registration completes without errors
9. ✅ Data appears in Supabase dashboard
10. ✅ Browser is online (not offline mode)

### Contact Support With:
- Screenshot of Network tab showing POST /api/students/register
- Screenshot of Supabase table showing the student
- Screenshot of Admin panel NOT showing the student
- Console output from diagnostic script above
- Any error messages from console

## Quick Fix to Test Immediately

**Temporary workaround while debugging:**

Add a "Force Refresh" button to admin panel:

```typescript
<Button onClick={async () => {
  await campusStore.loadFromSupabase();
  toast.success('Reloaded from Supabase');
}}>
  Force Refresh All Data
</Button>
```

This will manually trigger sync and bypass any timing/subscription issues.
