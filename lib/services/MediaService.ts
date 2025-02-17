
import { supabase } from '../supabase';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export class MediaService {
  static async requestPermissions() {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library was denied');
      }
    }
  }

  static async pickImage() {
    await this.requestPermissions();
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0];
    }
    return null;
  }

  static async uploadMedia(uri: string, folder: string) {
    try {
      const MAX_FILE_SIZE = 1024 * 1024; // 1MB in bytes
      
      const fileName = uri.split('/').pop();
      const fileExt = fileName?.split('.').pop();
      const filePath = `${folder}/${Date.now()}.${fileExt}`;

      const response = await fetch(uri);
      const blob = await response.blob();
      
      if (blob.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 1MB limit');
      }

      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, blob);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Record in file_uploads table
      const { error: dbError } = await supabase
        .from('file_uploads')
        .insert({
          file_path: filePath,
          file_type: fileExt,
          file_size: blob.size,
          content_type: blob.type,
          metadata: { original_name: fileName }
        });

      if (dbError) throw dbError;

      return publicUrl;
    } catch (error) {
      throw error;
    }
  }
}
