
import { supabase } from '../supabase';
import * as ImagePicker from 'expo-image-picker';

export class ProfileService {
  static async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          followers:profile_followers!follower_id (count),
          following:profile_followers!following_id (count),
          posts (count)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async updateProfile(userId: string, updates: {
    full_name?: string;
    username?: string;
    bio?: string;
    avatar_url?: string;
  }) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      throw error;
    }
  }

  static async uploadAvatar(uri: string, userId: string) {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      throw error;
    }
  }
}
