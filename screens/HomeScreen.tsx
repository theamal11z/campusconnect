import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Animated,
  StyleSheet,
  RefreshControl,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOCK_POSTS = [
  {
    id: '1',
    user: {
      name: 'John Doe',
      handle: '@johndoe',
      avatar: 'https://api.a0.dev/assets/image?text=A%20professional%20headshot%20of%20a%20young%20man%20with%20a%20warm%20smile&aspect=1:1&seed=1',
    },
    content: 'Just launched my new React Native app! 🚀 #reactnative #development',
    timestamp: '2h',
    image: 'https://api.a0.dev/assets/image?text=A%20beautiful%20mobile%20app%20interface%20with%20modern%20design&aspect=16:9&seed=2',
    likes: 42,
    comments: 12,
    shares: 5,
    liked: false,
  },
  {
    id: '2',
    user: {
      name: 'Jane Smith',
      handle: '@janesmith',
      avatar: 'https://api.a0.dev/assets/image?text=A%20professional%20headshot%20of%20a%20young%20woman%20with%20confidence&aspect=1:1&seed=3',
    },
    content: 'Beautiful sunset at the beach today! 🌅 #nature #peace',
    timestamp: '4h',
    image: 'https://api.a0.dev/assets/image?text=A%20stunning%20beach%20sunset%20with%20orange%20sky&aspect=16:9&seed=4',
    likes: 128,
    comments: 24,
    shares: 8,
    liked: true,
  },
  {
    id: '3',
    user: {
      name: 'Tech Insider',
      handle: '@techinsider',
      avatar: 'https://api.a0.dev/assets/image?text=A%20modern%20tech%20company%20logo&aspect=1:1&seed=5',
    },
    content: 'Breaking: New AI breakthrough changes everything! 🤖 Read more about how this will impact the future of technology. #AI #tech #future',
    timestamp: '6h',
    likes: 356,
    comments: 89,
    shares: 145,
    liked: false,
  },
];

const Header = ({ navigation, onNotificationsPress, hasNewPosts }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <Animated.View style={[styles.header, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']}
        style={styles.headerGradient}
      >      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#1DA1F2" />
      </TouchableOpacity>
        
        <MaterialCommunityIcons name="twitter" size={24} color="#1DA1F2" />
        
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={onNotificationsPress} style={styles.headerIcon}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#1DA1F2" />
            {hasNewPosts && <View style={styles.notificationBadge} />}
          </TouchableOpacity>          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')} 
            style={styles.headerAvatar}
          >
            <Image
              source={{ uri: 'https://api.a0.dev/assets/image?text=A%20professional%20user%20avatar&aspect=1:1&seed=6' }}
              style={styles.avatarImage}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const Post = ({ post, onLike, onComment, onShare }) => {
  const [isLiked, setIsLiked] = useState(post.liked);
  const likeScale = useRef(new Animated.Value(1)).current;
  const { width } = useWindowDimensions();
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1.2,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }),
    ]).start();
    onLike?.();
  };

  return (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <Image source={{ uri: post.user.avatar }} style={styles.postAvatar} />
        <View style={styles.postUserInfo}>
          <Text style={styles.userName}>{post.user.name}</Text>
          <Text style={styles.userHandle}>{post.user.handle} · {post.timestamp}</Text>
        </View>
        <TouchableOpacity style={styles.postMenuButton}>
          <MaterialCommunityIcons name="dots-horizontal" size={20} color="#657786" />
        </TouchableOpacity>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>
      
      {post.image && (
        <Image
          source={{ uri: post.image }}
          style={[styles.postImage, { width: width - 32 }]}
          resizeMode="cover"
        />
      )}

      <View style={styles.postActions}>
        <TouchableOpacity onPress={onComment} style={styles.actionButton}>
          <MaterialCommunityIcons name="comment-outline" size={20} color="#657786" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onShare} style={styles.actionButton}>
          <MaterialCommunityIcons name="repeat" size={20} color="#657786" />
          <Text style={styles.actionText}>{post.shares}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <MaterialCommunityIcons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? "#E0245E" : "#657786"}
            />
          </Animated.View>
          <Text style={[styles.actionText, isLiked && styles.likedText]}>
            {post.likes + (isLiked && !post.liked ? 1 : 0)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const NewPostsFab = ({ onPress, visible }) => {
  if (!visible) return null;
  
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#1DA1F2', '#0D8ED9']}
        style={styles.fabGradient}
      >
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { posts, loading, error, refetch: refreshPosts, likePost } = usePosts();
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
    setHasNewPosts(false);
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>      <Header
        navigation={navigation}
        hasNewPosts={hasNewPosts}
        onMenuPress={() => {}}
        onNotificationsPress={() => {}}
      />

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <Post
            post={item}
            onLike={() => {}}
            onComment={() => {}}
            onShare={() => {}}
          />
        )}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1DA1F2"
          />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      <NewPostsFab
        visible={!refreshing}
        onPress={() => navigation.navigate('PostScreen')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    zIndex: 1000,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerIcon: {
    padding: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    marginLeft: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0245E',
  },
  post: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  postAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  postUserInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#14171A',
  },
  userHandle: {
    fontSize: 14,
    color: '#657786',
  },
  postMenuButton: {
    padding: 8,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 22,
    color: '#14171A',
    marginBottom: 12,
  },
  postImage: {
    height: 200,
    borderRadius: 16,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#657786',
  },
  likedText: {
    color: '#E0245E',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;