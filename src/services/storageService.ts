import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'issue-images';

export const storageService = {
  /**
   * Uploads an image file to Supabase storage under the user's folder.
   * @param userId The ID of the user uploading the image.
   * @param file The file to upload.
   * @returns An object containing the public URL and the storage path.
   */
  async uploadIssueImage(userId: string, file: File): Promise<{ publicUrl: string; path: string }> {
    // Basic validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPG, PNG, and WEBP are allowed.');
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new Error('File size exceeds the 2MB limit.');
    }

    // Generate unique path
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      publicUrl: publicUrlData.publicUrl,
      path: data.path,
    };
  },

  /**
   * Deletes an image from the storage bucket using its path.
   * @param path The path of the file to delete (e.g. userId/filename.jpg).
   */
  async deleteIssueImage(path: string): Promise<void> {
    if (!path) return;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('Failed to delete image from storage:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }
};
