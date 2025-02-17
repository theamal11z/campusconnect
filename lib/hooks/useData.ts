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

export function useNotifications() {
  const [notifications, setNotifications] = useState<Database['public']['Tables']['notifications']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const { data, error } = await supabase
        .from('notifications')
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
      setNotifications(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { notifications, loading, error, refetch: fetchNotifications };
}

export function useVerificationUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadVerificationDocument = async (file: any) => {
    setUploading(true);
    try {
      const fileExt = file.uri.split('.').pop();
      const userId = supabase.auth.user()?.id;
      const fileName = `${userId}-verification.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('Verification Document')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ verification_status: 'pending', verification_document: fileName })
        .eq('id', userId);

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setUploading(false);
    }
  };

  return { uploadVerificationDocument, uploading, error };
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

export function useRealtimeForums() {
  const [forums, setForums] = useState<Database['public']['Tables']['forums']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchForums();

    // Set up real-time subscription
    const subscription = supabase
      .channel('forums')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'forums' },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              setForums(current => [...current, payload.new]);
              break;
            case 'UPDATE':
              setForums(current => 
                current.map(forum => 
                  forum.id === payload.new.id ? payload.new : forum
                )
              );
              break;
            case 'DELETE':
              setForums(current => 
                current.filter(forum => forum.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchForums() {
    try {
      const { data, error } = await supabase
        .from('forums')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setForums(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { forums, loading, error, refetch: fetchForums };
}