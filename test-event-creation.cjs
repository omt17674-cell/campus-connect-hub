#!/usr/bin/env node

/**
 * Test Event Creation Flow
 * Tests: Auth Server → Event API → Supabase
 */

const http = require('http');

const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:5173';

const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL || 'http://localhost:5001';

async function testEventCreation() {
  console.log('\n📋 Campus Connect Hub - Event Creation Test\n');
  console.log('🔧 Configuration:');
  console.log(`   Frontend: ${BASE_URL}`);
  console.log(`   Auth Server: ${AUTH_SERVER_URL}`);
  console.log(`   Supabase: dfl4luw5tr5l1h6jmnfql7a.supabase.co\n`);

  try {
    // Step 1: Test Auth Server
    console.log('1️⃣  Testing Auth Server...');
    const authRes = await fetch(`${AUTH_SERVER_URL}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!authRes.ok) {
      console.error('   ❌ Auth Server not responding');
      console.error(`   Status: ${authRes.status}`);
      return false;
    }

    const authData = await authRes.json();
    console.log(`   ✅ Auth Server OK: ${authData.message}\n`);

    // Step 2: Login with Admin
    console.log('2️⃣  Testing Admin Login...');
    const loginRes = await fetch(`${AUTH_SERVER_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin.dean@gsfcuniversity.ac.in',
        password: '9558413347@Om',
      }),
    });

    if (!loginRes.ok) {
      console.error('   ❌ Login failed');
      console.error(`   Status: ${loginRes.status}`);
      return false;
    }

    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.error('   ❌ Login unsuccessful:', loginData.message);
      return false;
    }

    const token = loginData.data.token;
    const user = loginData.data.user;
    console.log(`   ✅ Logged in as: ${user.name} (${user.role})`);
    console.log(`   🔑 Token: ${token.slice(0, 20)}...\n`);

    // Step 3: Create Test Event
    console.log('3️⃣  Creating Test Event...');
    const eventPayload = {
      title: 'Test Event - ' + new Date().toISOString().slice(0, 10),
      description: 'This is a test event to verify the creation flow',
      category: 'workshop',
      department: 'Computer Science & Engineering',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      venue: 'Main Auditorium',
      organizerName: user.name,
      organizerEmail: user.email,
      capacity: 100,
      status: 'upcoming',
      approvalRequired: false,
      isTeamEvent: false,
      minTeamSize: 1,
      maxTeamSize: 4,
      volunteerHoursReward: 2,
      bannerImage: '',
      averageRating: 5.0,
      reviewCount: 0,
    };

    const eventRes = await fetch(`${BASE_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(eventPayload),
    });

    console.log(`   📤 Event API Response: ${eventRes.status} ${eventRes.statusText}`);

    const eventData = await eventRes.json();
    
    if (eventRes.status === 201 && eventData.success) {
      console.log(`   ✅ Event Created Successfully!`);
      console.log(`   📌 Event ID: ${eventData.event?.id}`);
      console.log(`   📝 Title: ${eventData.event?.title}\n`);
      return true;
    } else {
      console.error(`   ❌ Event Creation Failed`);
      console.error(`   Message: ${eventData.message}`);
      console.error(`   Details:`, eventData);
      return false;
    }

  } catch (error) {
    console.error('   ❌ Test Error:', error.message);
    return false;
  }
}

// Run test
testEventCreation().then(success => {
  if (success) {
    console.log('✅ All tests passed! Your app should be working.\n');
    process.exit(0);
  } else {
    console.log('❌ Tests failed. Check the errors above.\n');
    process.exit(1);
  }
});
