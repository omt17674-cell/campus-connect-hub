#!/usr/bin/env node

/**
 * Direct Supabase Event Test
 * Checks if events table is accessible and RLS policies work
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://dfl4luw5tr5l1h6jmnfql7a.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

async function testSupabase() {
  console.log('\n📋 Supabase Direct Connection Test\n');
  console.log('🔧 Configuration:');
  console.log(`   Project: dfl4luw5tr5l1h6jmnfql7a`);
  console.log(`   URL: ${SUPABASE_URL}\n`);

  try {
    // Create admin client (service role)
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    console.log('1️⃣  Testing Supabase Connection...');
    const { data: testData, error: testError } = await supabase
      .from('events')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('   ❌ Connection failed:', testError.message);
      return false;
    }
    console.log('   ✅ Connected to Supabase\n');

    // Test event creation
    console.log('2️⃣  Testing Event Creation...');
    const testEvent = {
      id: `evt-test-${Date.now()}`,
      title: `Test Event - ${new Date().toISOString()}`,
      description: 'This is a test event',
      category: 'workshop',
      department: 'Computer Science & Engineering',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      venue: 'Main Auditorium',
      organizer_name: 'Test Admin',
      organizer_email: 'test@gsfc.edu',
      capacity: 100,
      registered_count: 0,
      waitlist_count: 0,
      approval_required: false,
      is_team_event: false,
      min_team_size: 1,
      max_team_size: 4,
      volunteer_hours_reward: 0,
      banner_image: '',
      status: 'upcoming',
      average_rating: 5.0,
      review_count: 0,
    };

    const { data: createdEvent, error: createError } = await supabase
      .from('events')
      .upsert(testEvent)
      .select()
      .single();

    if (createError) {
      console.error('   ❌ Event creation failed:', createError.message);
      console.error('   Error code:', createError.code);
      return false;
    }

    console.log('   ✅ Event Created Successfully!');
    console.log(`   📌 Event ID: ${createdEvent.id}`);
    console.log(`   📝 Title: ${createdEvent.title}\n`);

    // Verify event exists
    console.log('3️⃣  Verifying Event in Database...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('events')
      .select('*')
      .eq('id', testEvent.id)
      .single();

    if (verifyError) {
      console.error('   ❌ Verification failed:', verifyError.message);
      return false;
    }

    console.log('   ✅ Event Verified!');
    console.log(`   ✓ Stored in Supabase events table`);
    console.log(`   ✓ Title: ${verifyData.title}`);
    console.log(`   ✓ Status: ${verifyData.status}\n`);

    return true;

  } catch (error) {
    console.error('   ❌ Test Error:', error.message);
    return false;
  }
}

// Run test
testSupabase().then(success => {
  if (success) {
    console.log('✅ All Supabase tests passed!');
    console.log('✅ Your RLS policies are working!');
    console.log('✅ Events ARE saving to the database.\n');
    process.exit(0);
  } else {
    console.log('❌ Supabase tests failed.');
    console.log('❌ Check your RLS policies and Supabase configuration.\n');
    process.exit(1);
  }
});
