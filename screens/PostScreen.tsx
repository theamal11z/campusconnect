
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Tag } from '../lib/components/Tag';
import { TagService } from '../lib/services/TagService';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner-native';

const PostScreen = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const tags = await TagService.getAllTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error loading tags:', error);
      toast.error('Failed to load tags');
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(current =>
      current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag]
    );
  };

  const handlePost = async () => {
    if (!content.trim()) return;

    setPosting(true);
    try {
      const user = supabase.auth.user();
      const newPost = {
        id: Date.now().toString(),
        content: content.trim(),
        author_id: user.id,
        created_at: new Date().toISOString(),
      };

      if (isOnline) {
        const { data: post, error: postError } = await supabase
          .from('posts')
          .insert(newPost)
          .single();

        if (postError) throw postError;
      } else {
        await savePendingPost(newPost);
        toast.success('Post saved offline and will sync when online');
      }

      if (postError) throw postError;

      // Add tags to the post
      if (selectedTags.length > 0) {
        const { error: tagError } = await supabase
          .from('post_tags')
          .insert(
            selectedTags.map(tag => ({
              post_id: post.id,
              tag_id: tag.id
            }))
          );

        if (tagError) throw tagError;
      }

      toast.success('Post created successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <MaterialCommunityIcons name="close" size={24} color="#657786" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePost}
            disabled={!content.trim() || posting}
            style={[styles.postButton, !content.trim() && styles.postButtonDisabled]}
          >
            <LinearGradient
              colors={['#1DA1F2', '#0D8ED9']}
              style={styles.postButtonGradient}
            >
              <Text style={styles.postButtonText}>
                {posting ? 'Posting...' : 'Post'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <TextInput
            style={styles.input}
            placeholder="What's happening?"
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={280}
            autoFocus
          />

          <View style={styles.tagsContainer}>
            <Text style={styles.tagsTitle}>Add tags:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tagsList}>
                {availableTags.map(tag => (
                  <Tag
                    key={tag.id}
                    label={tag.name}
                    active={selectedTags.includes(tag)}
                    onPress={() => toggleTag(tag)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  headerButton: {
    padding: 8,
  },
  postButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  tagsContainer: {
    marginTop: 16,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#14171A',
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default PostScreen;
