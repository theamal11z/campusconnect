
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { toast } from 'sonner-native';

const ForumsScreen = ({ navigation }) => {
  const { forums, loading: forumsLoading } = useRealtimeForums();
  const [activeForumId, setActiveForumId] = useState(null);
  const { messages, loading: messagesLoading } = useRealtimeMessages(activeForumId);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  useEffect(() => {
    fetchForums();
    fetchUserProfile();
    setupForumSubscription();
    
    return () => {
      if (forumSubscription.current) {
        forumSubscription.current.unsubscribe();
      }
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userId = supabase.auth.user()?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
      
      // Auto-connect to verified college forum
      if (data.college_id && data.verification_status === 'verified') {
        setActiveForumId(data.college_id);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchForums = async () => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select(`
          id,
          name,
          logo_url,
          conversations (
            id,
            updated_at,
            messages (
              content,
              created_at
            )
          )
        `)
        .order('name');

      if (error) throw error;
      setForums(data);
    } catch (error) {
      console.error('Error fetching forums:', error);
      toast.error('Failed to load forums');
    } finally {
      setLoading(false);
    }
  };

  const setupForumSubscription = () => {
    forumSubscription.current = supabase
      .from('conversations')
      .on('*', payload => {
        fetchForums();
      })
      .subscribe();
  };

  const handleSend = async () => {
    if (!message.trim() || !activeForumId) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeForumId,
          sender_id: supabase.auth.user()?.id,
          content: message.trim(),
        });

      if (error) throw error;
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const ForumCard = ({ forum }) => {
    const latestMessage = forum.conversations?.[0]?.messages?.[0];
    const isVerifiedForThisForum = userProfile?.college_id === forum.id && 
                                  userProfile?.verification_status === 'verified';

    return (
      <TouchableOpacity
        style={[
          styles.forumCard,
          activeForumId === forum.id && styles.activeForumCard
        ]}
        onPress={() => setActiveForumId(forum.id)}
      >
        <Image
          source={{ uri: forum.logo_url || 'https://via.placeholder.com/50' }}
          style={styles.forumLogo}
        />
        <View style={styles.forumInfo}>
          <View style={styles.forumHeader}>
            <Text style={styles.forumName}>{forum.name}</Text>
            {isVerifiedForThisForum && (
              <MaterialCommunityIcons name="check-decagram" size={16} color="#1DA1F2" />
            )}
          </View>
          <Text style={styles.forumLastMessage} numberOfLines={1}>
            {latestMessage?.content || 'No messages yet'}
          </Text>
          {latestMessage && (
            <Text style={styles.forumTimestamp}>
              {new Date(latestMessage.created_at).toLocaleTimeString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>College Forums</Text>
      </View>

      <FlatList
        data={forums}
        renderItem={({ item }) => <ForumCard forum={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.forumsList}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <MaterialCommunityIcons name="paperclip" size={24} color="#657786" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder={activeForumId ? "Type a message..." : "Select a forum to start chatting"}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            editable={!!activeForumId}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || !activeForumId) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!message.trim() || !activeForumId || sending}
          >
            <LinearGradient
              colors={['#1DA1F2', '#0D8ED9']}
              style={styles.sendButtonGradient}
            >
              {sending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <MaterialCommunityIcons name="send" size={24} color="#fff" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forumsList: {
    padding: 16,
  },
  forumCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F8FA',
    marginBottom: 12,
  },
  activeForumCard: {
    backgroundColor: '#E8F5FE',
    borderColor: '#1DA1F2',
    borderWidth: 1,
  },
  forumLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  forumInfo: {
    flex: 1,
  },
  forumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  forumName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14171A',
    marginRight: 4,
  },
  forumLastMessage: {
    fontSize: 14,
    color: '#657786',
    marginBottom: 4,
  },
  forumTimestamp: {
    fontSize: 12,
    color: '#657786',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
    backgroundColor: '#fff',
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F8FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    fontSize: 16,
    maxHeight: 100,
    color: '#14171A',
  },
  sendButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ForumsScreen;
