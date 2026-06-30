-- Migration: 005_fix_admin_voting_rls.sql
-- Allow Admin to cast votes on behalf of dummy personas in the simulator without RLS blocking it

CREATE POLICY "votes_insert_admin" ON public.votes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
