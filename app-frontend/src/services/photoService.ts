import { supabase, PROFILE_PHOTOS_BUCKET } from '../lib/supabase';
import api from './api';

export interface PhotoUploadResponse {
  url: string;
  path: string;
}

export const photoService = {
  // Upload photo to Supabase storage
  async uploadPhoto(file: File, userId: string): Promise<PhotoUploadResponse> {
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from(PROFILE_PHOTOS_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(PROFILE_PHOTOS_BUCKET)
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: filePath
      };
    } catch (error) {
      console.error('Photo upload error:', error);
      throw error;
    }
  },

  // Delete photo from Supabase storage
  async deletePhoto(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(PROFILE_PHOTOS_BUCKET)
        .remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Photo delete error:', error);
      throw error;
    }
  },

  // Update profile photo URL in backend
  async updateProfilePhoto(photoUrl: string): Promise<void> {
    try {
      const response = await api.put('/api/auth/profile-photo', {
        profileUrl: photoUrl
      });
      return response.data;
    } catch (error) {
      console.error('Profile photo update error:', error);
      throw error;
    }
  },

  // Remove profile photo (set to null)
  async removeProfilePhoto(): Promise<void> {
    try {
      const response = await api.delete('/api/auth/profile-photo');
      return response.data;
    } catch (error) {
      console.error('Profile photo removal error:', error);
      throw error;
    }
  }
};
