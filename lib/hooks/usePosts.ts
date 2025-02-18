
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useOfflineStorage } from './useOfflineStorage';

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOnline, savePendingPost, savePostsLocally, getLocalPosts } = useOfflineStorage();

  useEffect(() => {
    if (isOnline) {
      fetchPosts();
    } else {
      loadLocalPosts();
    }
  }, [isOnline]);

  const loadLocalPosts = async () => {
    const localPosts = await getLocalPosts();
    setPosts(localPosts);
    setLoading(false);
  };

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
