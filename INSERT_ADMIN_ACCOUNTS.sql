-- Insert Admin and TPC Coordinator accounts into Supabase accounts table
-- This allows them to login and create events

-- 1. Admin (Dean) Account
INSERT INTO public.accounts (
  id,
  roll_no,
  email,
  password_hash,
  role,
  department,
  mobile_number,
  avatar,
  is_verified,
  created_at,
  updated_at
) VALUES (
  'admin-001',
  'DEAN-001',
  'admin.dean@gsfcuniversity.ac.in',
  '$2b$10$abcd1234password', -- placeholder hash (not validated on login for demo)
  'admin',
  'Administration',
  '+91-8765432100',
  'AS',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- 2. TPC Coordinator (Placement Faculty Coordinator) Account
INSERT INTO public.accounts (
  id,
  roll_no,
  email,
  password_hash,
  role,
  department,
  mobile_number,
  avatar,
  is_verified,
  created_at,
  updated_at
) VALUES (
  'organizer-001',
  'TPC-001',
  'tpc.admin@gsfcuniversity.ac.in',
  '$2b$10$abcd1234password', -- placeholder hash (not validated on login for demo)
  'organizer',
  'Training & Placement Cell',
  '+91-8765432101',
  'RM',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Verify insertion
SELECT id, email, role FROM public.accounts WHERE role IN ('admin', 'organizer');
