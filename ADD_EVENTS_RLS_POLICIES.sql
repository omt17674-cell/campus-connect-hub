-- COMPLETE RLS RESET FOR EVENTS TABLE
-- Drop ALL existing policies completely
DROP POLICY IF EXISTS "events_select" ON events;
DROP POLICY IF EXISTS "events_insert" ON events;
DROP POLICY IF EXISTS "events_update" ON events;
DROP POLICY IF EXISTS "events_delete" ON events;
DROP POLICY IF EXISTS "events_insert_organizers" ON events;
DROP POLICY IF EXISTS "events_update_organizers" ON events;
DROP POLICY IF EXISTS "events_delete_admin" ON events;
DROP POLICY IF EXISTS "public_insert_events" ON events;
DROP POLICY IF EXISTS "public_update_events" ON events;
DROP POLICY IF EXISTS "public_delete_events" ON events;

-- Disable and re-enable RLS to force clean state
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create new policies with unique names
CREATE POLICY "allow_all_select"
  ON events
  FOR SELECT
  USING (true);

CREATE POLICY "allow_all_insert"
  ON events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "allow_all_update"
  ON events
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_all_delete"
  ON events
  FOR DELETE
  USING (true);
