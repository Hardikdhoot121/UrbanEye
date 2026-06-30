-- =====================================================
-- Development Seed Data & Admin Bootstrap
-- Run this in Supabase Dashboard → SQL Editor
-- (Make sure you have run the schema migrations first)
-- =====================================================

-- Enable pgcrypto for password hashing if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 1. SEED AUTHENTICATION USERS
-- =====================================================

-- We use hardcoded UUIDs so we can easily reference them in issues and votes

DO $$
DECLARE
  admin_uid uuid := 'c0000000-0000-0000-0000-000000000000';
  alice_uid uuid := 'c0000000-0000-0000-0000-000000000001';
  bob_uid uuid := 'c0000000-0000-0000-0000-000000000002';
  charlie_uid uuid := 'c0000000-0000-0000-0000-000000000003';
BEGIN

  -- (Removed DELETE statement due to Supabase auth schema permissions)

  -- Insert Admin User (test@123 / password123)
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    admin_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
    'admin@123.com', crypt('password123', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"name":"System Admin 2"}', now(), now()
  );

  -- Insert Alice
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    alice_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
    'alice_seed@example.com', crypt('password123', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"name":"Alice Seed"}', now(), now()
  );

  -- Insert Bob
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    bob_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
    'bob_seed@example.com', crypt('password123', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"name":"Bob Seed"}', now(), now()
  );

  -- Insert Charlie
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    charlie_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
    'charlie_seed@example.com', crypt('password123', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"name":"Charlie Seed"}', now(), now()
  );

  -- The `handle_new_user` trigger automatically creates entries in `public.profiles`.
  -- Now we update those profiles with demo Karma points and avatars.

  UPDATE public.profiles 
  SET karma_points = 5000, level = 20, avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' 
  WHERE id = admin_uid;

  UPDATE public.profiles 
  SET karma_points = 150, level = 4, avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' 
  WHERE id = alice_uid;

  UPDATE public.profiles 
  SET karma_points = 350, level = 8, avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' 
  WHERE id = bob_uid;

  UPDATE public.profiles 
  SET karma_points = 950, level = 14, avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' 
  WHERE id = charlie_uid;

  -- =====================================================
  -- 2. SEED ISSUES
  -- =====================================================
  
  -- Clear existing mock issues to prevent duplicates
  DELETE FROM public.issues WHERE reporter_id IN (alice_uid, bob_uid, charlie_uid);

  -- Issue 1: Water Leak (Alice)
  INSERT INTO public.issues (
    id, reporter_id, description, category, severity, status, latitude, longitude, 
    trust_score, consensus_score, ai_category, ai_severity, ai_summary, ai_confidence, ai_is_valid
  ) VALUES (
    'c0000000-0000-0000-0000-000000000001', alice_uid, 'Massive water pipe burst flooding the intersection.', 'WATER_SUPPLY', 'CRITICAL', 'COMMUNITY_VERIFIED', 37.7749, -122.4194, 
    95, 25, 'WATER_SUPPLY', 'CRITICAL', 'Major Pipe Burst', 0.98, true
  );

  -- Issue 2: Pothole (Bob)
  INSERT INTO public.issues (
    id, reporter_id, description, category, severity, status, latitude, longitude, 
    trust_score, consensus_score, ai_category, ai_severity, ai_summary, ai_confidence, ai_is_valid
  ) VALUES (
    'c0000000-0000-0000-0000-000000000002', bob_uid, 'Deep pothole causing vehicle damage.', 'TRANSPORTATION', 'HIGH', 'PENDING_VERIFICATION', 37.7849, -122.4094, 
    75, 5, 'TRANSPORTATION', 'HIGH', 'Dangerous Pothole', 0.85, true
  );

  -- Issue 3: Garbage Dump (Charlie)
  INSERT INTO public.issues (
    id, reporter_id, description, category, severity, status, latitude, longitude, 
    trust_score, consensus_score, ai_category, ai_severity, ai_summary, ai_confidence, ai_is_valid
  ) VALUES (
    'c0000000-0000-0000-0000-000000000003', charlie_uid, 'Illegal dumping of toxic waste behind the park.', 'PUBLIC_HEALTH', 'HIGH', 'COMMUNITY_VERIFIED', 37.7649, -122.4294, 
    88, 18, 'PUBLIC_HEALTH', 'HIGH', 'Illegal Dumping', 0.92, true
  );

  -- =====================================================
  -- 3. SEED TIMELINES & VOTES
  -- =====================================================

  -- Votes for Issue 1
  INSERT INTO public.votes (issue_id, voter_id, vote_weight, is_approved) VALUES 
  ('c0000000-0000-0000-0000-000000000001', bob_uid, 3, true),
  ('c0000000-0000-0000-0000-000000000001', charlie_uid, 5, true);

  -- Votes for Issue 3
  INSERT INTO public.votes (issue_id, voter_id, vote_weight, is_approved) VALUES 
  ('c0000000-0000-0000-0000-000000000003', alice_uid, 2, true),
  ('c0000000-0000-0000-0000-000000000003', bob_uid, 3, true);

END $$;
