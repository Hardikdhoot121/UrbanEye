-- Migration: 003_storage_policies.sql
-- Fixes RLS (Row-Level Security) error for the storage bucket

-- Allow anyone to view files in the issue-images bucket
CREATE POLICY "Allow public viewing" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'issue-images');

-- Allow anyone to upload files to the issue-images bucket
CREATE POLICY "Allow public uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'issue-images');

-- Allow anyone to delete files from the issue-images bucket
CREATE POLICY "Allow public deletion" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'issue-images');

-- Allow anyone to update files in the issue-images bucket
CREATE POLICY "Allow public updates" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'issue-images');
