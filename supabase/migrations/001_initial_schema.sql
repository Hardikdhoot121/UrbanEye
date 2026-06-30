-- =====================================================
-- Community Hero — Supabase Initial Schema
-- Migration: 001_initial_schema.sql
--
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- =====================================================
-- 1. PROFILES
-- Extends auth.users. Created automatically via trigger.
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      text UNIQUE NOT NULL,
  avatar_url    text,
  karma_points  integer NOT NULL DEFAULT 0,
  level         integer NOT NULL DEFAULT 1,
  role          text NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- 2. BADGES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.badges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text UNIQUE NOT NULL,
  description text NOT NULL,
  image_url   text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. PROFILE BADGES (junction)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profile_badges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id    uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id, badge_id)
);

-- =====================================================
-- 4. ISSUES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.issues (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description           text NOT NULL,
  category              text NOT NULL,
  severity              text NOT NULL,
  status                text NOT NULL DEFAULT 'PENDING_VERIFICATION',
  latitude              float8 NOT NULL,
  longitude             float8 NOT NULL,
  image_url             text,
  trust_score           float4 NOT NULL DEFAULT 0,
  consensus_score       integer NOT NULL DEFAULT 0,
  required_consensus    integer NOT NULL DEFAULT 15,
  supporter_count       integer NOT NULL DEFAULT 0,
  is_potential_duplicate boolean NOT NULL DEFAULT false,
  merged_into_id        uuid REFERENCES public.issues(id) ON DELETE SET NULL,
  -- AI Analysis fields (stored denormalized for read performance)
  ai_category           text,
  ai_severity           text,
  ai_summary            text,
  ai_confidence         float4,
  ai_is_valid           boolean,
  ai_reason             text,
  ai_suggested_action   text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Index for map queries (lat/lng range lookups)
CREATE INDEX IF NOT EXISTS idx_issues_location ON public.issues (latitude, longitude);
-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues (status);
-- Index for reporter filtering
CREATE INDEX IF NOT EXISTS idx_issues_reporter ON public.issues (reporter_id);

-- =====================================================
-- 5. ISSUE TIMELINE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.issue_timeline (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id   uuid NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  status     text NOT NULL,
  actor      text NOT NULL CHECK (actor IN ('CITIZEN', 'COMMUNITY', 'ADMIN', 'SYSTEM')),
  actor_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  note       text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timeline_issue ON public.issue_timeline (issue_id);

-- =====================================================
-- 6. VOTES
-- One vote per user per issue enforced at DB level
-- =====================================================
CREATE TABLE IF NOT EXISTS public.votes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id    uuid NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  voter_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote_weight integer NOT NULL DEFAULT 1,
  is_approved boolean NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(issue_id, voter_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_issue ON public.votes (issue_id);

-- =====================================================
-- 7. ADMIN ACTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id        uuid NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  admin_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action          text NOT NULL CHECK (action IN ('APPROVE', 'REJECT', 'MERGE')),
  note            text,
  target_issue_id uuid REFERENCES public.issues(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- 8. NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       text NOT NULL,
  message    text NOT NULL,
  issue_id   uuid REFERENCES public.issues(id) ON DELETE SET NULL,
  is_read    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications (user_id);

-- =====================================================
-- 9. TRIGGERS
-- =====================================================

-- Auto-create profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 6)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE WHEN NEW.email = 'superadmin@123.com' THEN 'admin' ELSE 'citizen' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on issues
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_issues_updated ON public.issues;
CREATE TRIGGER on_issues_updated
  BEFORE UPDATE ON public.issues
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_badges  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_timeline  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications   ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES ----
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ---- BADGES ----
CREATE POLICY "badges_select_public" ON public.badges
  FOR SELECT USING (true);

-- ---- PROFILE BADGES ----
CREATE POLICY "profile_badges_select_public" ON public.profile_badges
  FOR SELECT USING (true);

CREATE POLICY "profile_badges_insert_own" ON public.profile_badges
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- ---- ISSUES ----
CREATE POLICY "issues_select_public" ON public.issues
  FOR SELECT USING (true);

CREATE POLICY "issues_insert_authenticated" ON public.issues
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "issues_update_own" ON public.issues
  FOR UPDATE USING (auth.uid() = reporter_id);

-- Admin can update any issue (status changes, merges, etc.)
CREATE POLICY "issues_update_admin" ON public.issues
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "issues_delete_admin" ON public.issues
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---- ISSUE TIMELINE ----
CREATE POLICY "timeline_select_public" ON public.issue_timeline
  FOR SELECT USING (true);

CREATE POLICY "timeline_insert_authenticated" ON public.issue_timeline
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ---- VOTES ----
CREATE POLICY "votes_select_public" ON public.votes
  FOR SELECT USING (true);

CREATE POLICY "votes_insert_authenticated" ON public.votes
  FOR INSERT WITH CHECK (auth.uid() = voter_id);

-- ---- ADMIN ACTIONS ----
CREATE POLICY "admin_actions_select_admin" ON public.admin_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "admin_actions_insert_admin" ON public.admin_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---- NOTIFICATIONS ----
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 11. STORAGE BUCKET
-- Run AFTER the bucket is created in Supabase dashboard
-- =====================================================

-- Allow authenticated users to upload to issue-images
-- (Run in Supabase Storage → Policies after creating the bucket manually)
/*
CREATE POLICY "storage_upload_authenticated"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'issue-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'issue-images');
*/

-- =====================================================
-- 12. SEED DATA (Optional — Default Badges)
-- =====================================================
INSERT INTO public.badges (name, description, image_url) VALUES
  ('First Report', 'Submitted your first civic issue', '🚩'),
  ('Community Verifier', 'Cast 10 verification votes', '🛡️'),
  ('Neighborhood Hero', 'Reached 100 karma points', '🦸'),
  ('Guardian', 'Reached 500 karma points', '⚔️'),
  ('Civic Champion', 'Reached 1000 karma points', '🏆')
ON CONFLICT (name) DO NOTHING;
