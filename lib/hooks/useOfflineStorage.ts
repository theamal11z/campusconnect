
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

const OFFLINE_POSTS_KEY = '@offline_posts';
const PENDING_POSTS_KEY = '@pending_posts';

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
      if (state.isConnected) {
        syncPendingPosts();
      }
    });

    loadPendingPosts();
    return () => unsubscribe();
  }, []);

  const loadPendingPosts = async () => {
    try {
      const storedPosts = await AsyncStorage.getItem(PENDING_POSTS_KEY);
      if (storedPosts) {
        setPendingPosts(JSON.parse(storedPosts));
      }
    } catch (error) {
      console.error('Error loading pending posts:', error);
    }
  };

  const savePendingPost = async (post: any) => {
    try {
      const newPendingPosts = [...pendingPosts, post];
      await AsyncStorage.setItem(PENDING_POSTS_KEY, JSON.stringify(newPendingPosts));
      setPendingPosts(newPendingPosts);
    } catch (error) {
      console.error('Error saving pending post:', error);
    }
  };

  const syncPendingPosts = async () => {
    try {
      for (const post of pendingPosts) {
        // Attempt to sync each pending post
        const { error } = await supabase
          .from('posts')
          .insert(post);
        
        if (!error) {
          // Remove successfully synced post from pending
          const updatedPending = pendingPosts.filter(p => p.id !== post.id);
          await AsyncStorage.setItem(PENDING_POSTS_KEY, JSON.stringify(updatedPending));
          setPendingPosts(updatedPending);
        }
      }
    } catch (error) {
      console.error('Error syncing pending posts:', error);
    }
  };

  const savePostsLocally = async (posts: any[]) => {
    try {
      await AsyncStorage.setItem(OFFLINE_POSTS_KEY, JSON.stringify(posts));
    } catch (error) {
      console.error('Error saving posts locally:', error);
    }
  };

  const getLocalPosts = async () => {
    try {
      const storedPosts = await AsyncStorage.getItem(OFFLINE_POSTS_KEY);
      return storedPosts ? JSON.parse(storedPosts) : [];
    } catch (error) {
      console.error('Error getting local posts:', error);
      return [];
    }
  };

  return {
    isOnline,
    pendingPosts,
    savePendingPost,
    savePostsLocally,
    getLocalPosts,
    syncPendingPosts
  };
}
