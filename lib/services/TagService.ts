
import { supabase } from '../supabase';

export class TagService {
  static async getAllTags() {
    const { data, error } = await supabase
      .from('college_tags')
      .select('*')
      .order('tag');
    
    if (error) throw error;
    return data;
  }

  static async getTagsByCollege(collegeId: string) {
    const { data, error } = await supabase
      .from('college_tags')
      .select('*')
      .eq('college_id', collegeId)
      .order('tag');
    
    if (error) throw error;
    return data;
  }

  static async addTag(collegeId: string, tag: string) {
    const { error } = await supabase
      .from('college_tags')
      .insert({ college_id: collegeId, tag });
    
    if (error) throw error;
  }

  static async removeTag(tagId: string) {
    const { error } = await supabase
      .from('college_tags')
      .delete()
      .eq('id', tagId);
    
    if (error) throw error;
  }
}
