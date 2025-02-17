
import { supabase } from '../supabase';

export class VerificationService {
  static async uploadVerificationDocument(file: any, userId: string) {
    try {
      const fileExt = file.type.split('/')[1];
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verifications')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('verifications')
        .getPublicUrl(fileName);

      // Update profile verification status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          verification_status: 'pending',
          verification_document: publicUrl,
          verification_submitted_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      return publicUrl;
    } catch (error) {
      throw error;
    }
  }

  static async getVerificationStatus(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('verification_status, verification_document')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }
}
