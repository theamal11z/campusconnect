
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Database } from '../types/supabase';

export function useColleges() {
  const [colleges, setColleges] = useState<Database['public']['Tables']['colleges']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchColleges();
  }, []);

  async function fetchColleges() {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setColleges(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { colleges, loading, error, refetch: fetchColleges };
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Database['public']['Tables']['profiles']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { profiles, loading, error, refetch: fetchProfiles };
}

export function usePosts() {
  const [posts, setPosts] = useState<Database['public']['Tables']['posts']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function likePost(postId: string) {
    try {
      const { error } = await supabase
        .from('post_likes')
        .upsert({ post_id: postId, user_id: supabase.auth.user()?.id });
      
      if (error) throw error;
      await fetchPosts();
    } catch (err) {
      console.error('Error liking post:', err);
    }
  }

  return { posts, loading, error, refetch: fetchPosts, likePost };
}

export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  async function fetchProfile() {
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
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { profile, loading, error, refetch: fetchProfile };
}
