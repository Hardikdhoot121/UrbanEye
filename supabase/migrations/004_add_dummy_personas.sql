-- Migration: 004_add_dummy_personas.sql
-- Creates 5 dummy users so the Admin Persona Simulator can cast mock votes without FK errors

DO $$
DECLARE
  uid1 uuid := 'e0000000-0000-0000-0000-000000000001';
  uid2 uuid := 'e0000000-0000-0000-0000-000000000002';
  uid3 uuid := 'e0000000-0000-0000-0000-000000000003';
  uid4 uuid := 'e0000000-0000-0000-0000-000000000004';
  uid5 uuid := 'e0000000-0000-0000-0000-000000000005';
BEGIN
  -- 1. Jane Doe
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
  VALUES (uid1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jane@example.com', 'pwd', now(), '{"provider":"email"}', '{"name":"Jane Doe"}', now(), now()) ON CONFLICT DO NOTHING;

  -- 2. Mark Garcia
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
  VALUES (uid2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mark@example.com', 'pwd', now(), '{"provider":"email"}', '{"name":"Mark Garcia"}', now(), now()) ON CONFLICT DO NOTHING;

  -- 3. Hardik Dhoot
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
  VALUES (uid3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hardik@example.com', 'pwd', now(), '{"provider":"email"}', '{"name":"Hardik Dhoot"}', now(), now()) ON CONFLICT DO NOTHING;

  -- 4. Sarah Connor
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
  VALUES (uid4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sarah@example.com', 'pwd', now(), '{"provider":"email"}', '{"name":"Sarah Connor"}', now(), now()) ON CONFLICT DO NOTHING;

  -- 5. Marcus Aurelius
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
  VALUES (uid5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'marcus@example.com', 'pwd', now(), '{"provider":"email"}', '{"name":"Marcus Aurelius"}', now(), now()) ON CONFLICT DO NOTHING;

  -- The trigger automatically creates profiles, now we update them to match their dummy stats
  UPDATE public.profiles SET karma_points = 45, level = 2 WHERE id = uid1;
  UPDATE public.profiles SET karma_points = 150, level = 4 WHERE id = uid2;
  UPDATE public.profiles SET karma_points = 350, level = 8 WHERE id = uid3;
  UPDATE public.profiles SET karma_points = 950, level = 14 WHERE id = uid4;
  UPDATE public.profiles SET karma_points = 2400, level = 25 WHERE id = uid5;
END $$;
