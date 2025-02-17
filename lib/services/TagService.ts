
import { supabase } from '../supabase';

export class TagService {
  static async getAllTags() {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }

  static async getTagsByCollege(collegeId: string) {
    const { data, error } = await supabase
      .from('college_tags')
      .select('*, tag:tags(*)')
      .eq('college_id', collegeId)
      .order('created_at');
    
    if (error) throw error;
    return data;
  }

  static async getTagsByPost(postId: string) {
    const { data, error } = await supabase
      .from('post_tags')
      .select('*, tag:tags(*)')
      .eq('post_id', postId)
      .order('created_at');
    
    if (error) throw error;
    return data;
  }

  static async addTagToPost(postId: string, tagId: string) {
    const { error } = await supabase
      .from('post_tags')
      .insert({ post_id: postId, tag_id: tagId });
    
    if (error) throw error;
  }

  static async removeTagFromPost(postId: string, tagId: string) {
    const { error } = await supabase
      .from('post_tags')
      .delete()
      .match({ post_id: postId, tag_id: tagId });
    
    if (error) throw error;
  }

  static async createTag(name: string, category: string) {
    const { data, error } = await supabase
      .from('tags')
      .insert({ name, category })
      .single();
    
    if (error) throw error;
    return data;
  }
}
