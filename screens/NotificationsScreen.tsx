
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotifications } from '../lib/hooks/useData';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner-native';

const NotificationIcon = ({ type, read }) => {
  const getIconDetails = () => {
    switch (type) {
      case 'like':
        return { name: 'heart', color: '#E0245E' };
      case 'follow':
        return { name: 'account-plus', color: '#1DA1F2' };
      case 'mention':
        return { name: 'at', color: '#17BF63' };
      case 'comment':
        return { name: 'comment-text', color: '#794BC4' };
      default:
        return { name: 'bell', color: '#1DA1F2' };
    }
  };

  const { name, color } = getIconDetails();

  return (
    <View style={[styles.iconContainer, !read && styles.unreadIconContainer]}>
      <MaterialCommunityIcons name={name} size={24} color={color} />
    </View>
  );
};

const NotificationItem = ({ notification, onPress }) => (
  <TouchableOpacity
    style={[
      styles.notificationItem,
      !notification.read && styles.unreadNotification
    ]}
    onPress={() => onPress(notification)}
  >
    <NotificationIcon type={notification.type} read={notification.read} />
    <View style={styles.notificationContent}>
      <Text style={[
        styles.notificationTitle,
        !notification.read && styles.unreadText
      ]}>
        {notification.title}
      </Text>
      {notification.description && (
        <Text style={styles.notificationDescription}>
          {notification.description}
        </Text>
      )}
      <Text style={styles.timestamp}>
        {new Date(notification.created_at).toRelativeTime()}
      </Text>
    </View>
  </TouchableOpacity>
);

const EmptyState = () => (
  <View style={styles.emptyState}>
    <MaterialCommunityIcons name="bell-off-outline" size={48} color="#657786" />
    <Text style={styles.emptyStateTitle}>No notifications yet</Text>
    <Text style={styles.emptyStateDescription}>
      When you get notifications, they'll show up here
    </Text>
  </View>
);

const Header = ({ onBack, onMarkAllRead, hasUnread }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']}
        style={styles.headerGradient}
      >
        <TouchableOpacity onPress={onBack} style={styles.headerIcon}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1DA1F2" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Notifications</Text>
        
        {hasUnread && (
          <TouchableOpacity onPress={onMarkAllRead} style={styles.markReadButton}>
            <Text style={styles.markReadText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );
};

const NotificationsScreen = ({ navigation }) => {
  const { notifications, loading, error, refetch } = useNotifications();
  const hasUnread = notifications.some(notification => !notification.read);

  const handleMarkAllRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', supabase.auth.user()?.id);

      if (error) throw error;
      await refetch();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleNotificationPress = async (notification) => {
    if (!notification.read) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notification.id);

        if (error) throw error;
        await refetch();
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }

    // Handle navigation based on notification type
    switch (notification.type) {
      case 'like':
      case 'comment':
        navigation.navigate('Post', { id: notification.post_id });
        break;
      case 'follow':
        navigation.navigate('Profile', { userId: notification.actor_id });
        break;
      case 'mention':
        navigation.navigate('Post', { id: notification.post_id });
        break;
    }
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
      <Header
        onBack={() => navigation.goBack()}
        onMarkAllRead={handleMarkAllRead}
        hasUnread={hasUnread}
      />

      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={handleNotificationPress}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.notificationsList}
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
    zIndex: 1000,
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
  markReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#EDF8FF',
  },
  markReadText: {
    color: '#1DA1F2',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationsList: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unreadNotification: {
    backgroundColor: '#F5F8FA',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F8FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  unreadIconContainer: {
    backgroundColor: '#EDF8FF',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#14171A',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  notificationDescription: {
    fontSize: 14,
    color: '#657786',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#657786',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14171A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
  },
});

export default NotificationsScreen;
