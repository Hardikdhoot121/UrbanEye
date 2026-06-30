-- Migration: 002_add_image_path.sql

-- Add image_path to track the Supabase Storage object path for deletion
ALTER TABLE public.issues
ADD COLUMN IF NOT EXISTS image_path text;
