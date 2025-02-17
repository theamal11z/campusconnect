import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOCK_USER = {
  name: 'John Doe',
  handle: '@johndoe',
  bio: 'Software Engineer | React Native Developer | Coffee Enthusiast ☕️\nBuilding amazing mobile experiences 📱',
  avatar: 'https://api.a0.dev/assets/image?text=A%20professional%20headshot%20of%20a%20young%20man%20with%20a%20warm%20smile&aspect=1:1&seed=1',
  verified: true,
  stats: {
    posts: 1234,
    followers: 5678,
    following: 910
  },
  coverImage: 'https://api.a0.dev/assets/image?text=A%20beautiful%20cityscape%20during%20sunset&aspect=16:9&seed=7'
};

const MOCK_POSTS = [
  {
    id: '1',
    content: 'Just launched my new React Native app! 🚀 #reactnative #development',
    timestamp: '2h',
    image: 'https://api.a0.dev/assets/image?text=A%20beautiful%20mobile%20app%20interface%20with%20modern%20design&aspect=16:9&seed=2',
    likes: 42,
    comments: 12,
    shares: 5,
  },
  {
    id: '2',
    content: 'Beautiful sunset at the beach today! 🌅 #nature #peace',
    timestamp: '4h',
    image: 'https://api.a0.dev/assets/image?text=A%20stunning%20beach%20sunset%20with%20orange%20sky&aspect=16:9&seed=4',
    likes: 128,
    comments: 24,
    shares: 8,
  },
];

const Header = ({ onBack, onSettings, scrollY }) => {
  const insets = useSafeAreaInsets();
  const opacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.header, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']}
        style={styles.headerGradient}
      >
        <TouchableOpacity onPress={onBack} style={styles.headerIcon}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1DA1F2" />
        </TouchableOpacity>
        
        <Animated.Text style={[styles.headerTitle, { opacity }]}>
          {MOCK_USER.name}
        </Animated.Text>
        
        <TouchableOpacity onPress={onSettings} style={styles.headerIcon}>
          <MaterialCommunityIcons name="cog" size={24} color="#1DA1F2" />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

const ProfileStats = ({ stats }) => (
  <View style={styles.statsContainer}>
    <View style={styles.statItem}>
      <Text style={styles.statNumber}>{stats.posts.toLocaleString()}</Text>
      <Text style={styles.statLabel}>Posts</Text>
    </View>
    <View style={styles.statItem}>
      <Text style={styles.statNumber}>{stats.followers.toLocaleString()}</Text>
      <Text style={styles.statLabel}>Followers</Text>
    </View>
    <View style={styles.statItem}>
      <Text style={styles.statNumber}>{stats.following.toLocaleString()}</Text>
      <Text style={styles.statLabel}>Following</Text>
    </View>
  </View>
);

const TabBar = ({ activeTab, onTabPress }) => (
  <View style={styles.tabBar}>
    {['Posts', 'Likes', 'Activity'].map((tab) => (
      <TouchableOpacity
        key={tab}
        style={[styles.tab, activeTab === tab && styles.activeTab]}
        onPress={() => onTabPress(tab)}
      >
        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
          {tab}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const Post = ({ post }) => {
  const { width } = useWindowDimensions();
  
  return (
    <View style={styles.post}>
      <Text style={styles.postContent}>{post.content}</Text>
      {post.image && (
        <Image
          source={{ uri: post.image }}
          style={[styles.postImage, { width: width - 32 }]}
          resizeMode="cover"
        />
      )}
      <View style={styles.postActions}>
        <View style={styles.actionButton}>
          <MaterialCommunityIcons name="comment-outline" size={20} color="#657786" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </View>
        <View style={styles.actionButton}>
          <MaterialCommunityIcons name="repeat" size={20} color="#657786" />
          <Text style={styles.actionText}>{post.shares}</Text>
        </View>
        <View style={styles.actionButton}>
          <MaterialCommunityIcons name="heart-outline" size={20} color="#657786" />
          <Text style={styles.actionText}>{post.likes}</Text>
        </View>
      </View>
    </View>
  );
};

const ProfileScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Posts');
  const scrollY = new Animated.Value(0);
  const { width } = useWindowDimensions();

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <Header
        onBack={() => navigation.goBack()}
        onSettings={() => {}}
        scrollY={scrollY}
      />

      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ uri: MOCK_USER.coverImage }}
          style={[styles.coverImage, { width }]}
        />
        
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: MOCK_USER.avatar }}
              style={styles.avatar}
            />
            {MOCK_USER.verified && (
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons name="check-circle" size={24} color="#1DA1F2" />
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{MOCK_USER.name}</Text>
            <Text style={styles.userHandle}>{MOCK_USER.handle}</Text>
            <Text style={styles.userBio}>{MOCK_USER.bio}</Text>
          </View>

          <ProfileStats stats={MOCK_USER.stats} />
        </View>

        <TabBar
          activeTab={activeTab}
          onTabPress={setActiveTab}
        />

        <View style={styles.content}>
          {activeTab === 'Posts' && MOCK_POSTS.map(post => (
            <Post key={post.id} post={post} />
          ))}
          {activeTab === 'Likes' && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="heart-outline" size={48} color="#657786" />
              <Text style={styles.emptyStateText}>No likes yet</Text>
            </View>
          )}
          {activeTab === 'Activity' && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="bell-outline" size={48} color="#657786" />
              <Text style={styles.emptyStateText}>No recent activity</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'transparent',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14171A',
  },
  coverImage: {
    height: 150,
  },
  profileInfo: {
    padding: 16,
  },
  avatarContainer: {
    marginTop: -50,
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  editButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1DA1F2',
  },
  editButtonText: {
    color: '#1DA1F2',
    fontWeight: '600',
  },
  userInfo: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14171A',
  },
  userHandle: {
    fontSize: 16,
    color: '#657786',
    marginBottom: 8,
  },
  userBio: {
    fontSize: 16,
    color: '#14171A',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14171A',
  },
  statLabel: {
    fontSize: 14,
    color: '#657786',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1DA1F2',
  },
  tabText: {
    fontSize: 16,
    color: '#657786',
  },
  activeTabText: {
    color: '#1DA1F2',
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  post: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
    paddingBottom: 16,
  },
  postContent: {
    fontSize: 16,
    color: '#14171A',
    lineHeight: 22,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginTop: 8,
    fontSize: 16,
    color: '#657786',
  },
});

export default ProfileScreen;