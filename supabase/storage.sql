-- ============================================
-- Repet Storage Buckets Setup
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('pet-images', 'pet-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('walk-photos', 'walk-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('provider-images', 'provider-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Storage Policies
-- ============================================

-- Pet Images: Family members can upload/delete, public read
CREATE POLICY "Public read pet images" ON storage.objects
  FOR SELECT USING (bucket_id = 'pet-images');

CREATE POLICY "Family upload pet images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pet-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Family delete pet images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pet-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Walk Photos: User's own photos
CREATE POLICY "Public read walk photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'walk-photos');

CREATE POLICY "Users upload walk photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'walk-photos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users delete own walk photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'walk-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Provider Images: Provider owners can manage
CREATE POLICY "Public read provider images" ON storage.objects
  FOR SELECT USING (bucket_id = 'provider-images');

CREATE POLICY "Providers upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'provider-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Providers delete images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'provider-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars: Users manage their own
CREATE POLICY "Public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
