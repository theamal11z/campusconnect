import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { toast } from 'sonner-native';

const MOCK_MESSAGES = [
  {
    id: '1',
    text: 'Hey! I saw you\'re also studying Computer Science at State University. How are you liking the AI course?',
    timestamp: '10:30 AM',
    sender: 'other',
    read: true,
    user: {
      name: 'Sarah Chen',
      avatar: 'https://api.a0.dev/assets/image?text=A%20professional%20headshot%20of%20a%20young%20woman%20student&aspect=1:1&seed=123',
      verified: true,
      status: 'CS Major • Class of 2025',
    }
  },
  {
    id: '2',
    text: 'It\'s challenging but really interesting! The professor\'s approach to neural networks is quite unique.',
    timestamp: '10:31 AM',
    sender: 'me',
    read: true,
  },
  {
    id: '3',
    text: 'Would you be interested in joining our study group? We meet every Wednesday at the campus library.',
    image: 'https://api.a0.dev/assets/image?text=A%20group%20of%20students%20studying%20together%20in%20a%20modern%20library&aspect=16:9&seed=456',
    timestamp: '10:32 AM',
    sender: 'other',
    read: true,
    user: {
      name: 'Sarah Chen',
      avatar: 'https://api.a0.dev/assets/image?text=A%20professional%20headshot%20of%20a%20young%20woman%20student&aspect=1:1&seed=123',
      verified: true,
    }
  },
];

const Message = ({ message, isLastMessage }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View style={[
      styles.messageContainer,
      message.sender === 'me' ? styles.myMessage : styles.otherMessage,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }
    ]}>
      {message.sender === 'other' && (
        <View style={styles.senderInfo}>
          <Image source={{ uri: message.user.avatar }} style={styles.messageAvatar} />
          <View style={styles.senderNameContainer}>
            <Text style={styles.senderName}>{message.user.name}</Text>
            {message.user.verified && (
              <MaterialCommunityIcons name="check-decagram" size={16} color="#1DA1F2" />
            )}
          </View>
          {message.user.status && (
            <Text style={styles.senderStatus}>{message.user.status}</Text>
          )}
        </View>
      )}
      
      <View style={[
        styles.messageBubble,
        message.sender === 'me' ? styles.myMessageBubble : styles.otherMessageBubble
      ]}>
        <Text style={[
          styles.messageText,
          message.sender === 'me' ? styles.myMessageText : styles.otherMessageText
        ]}>
          {message.text}
        </Text>
        
        {message.image && (
          <Image 
            source={{ uri: message.image }} 
            style={styles.messageImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.messageFooter}>
          <Text style={styles.timestamp}>{message.timestamp}</Text>
          {message.sender === 'me' && (
            <View style={styles.readStatus}>
              <MaterialCommunityIcons
                name={message.read ? "check-all" : "check"}
                size={16}
                color={message.read ? "#1DA1F2" : "#657786"}
              />
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const ChatScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  const handleImageUpload = async () => {
    try {
      const image = await MediaService.pickImage();
      if (image) {
        setSending(true);
        const imageUrl = await MediaService.uploadMedia(image.uri, 'chat');
        const newMessage = {
          id: Date.now().toString(),
          image: imageUrl,
          timestamp: new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          sender: 'me',
          read: false,
        };
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setSending(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newMessage = {
        id: Date.now().toString(),
        text: message,
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        sender: 'me',
        read: false,
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Simulate message being read after 2 seconds
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id ? { ...msg, read: true } : msg
          )
        );
      }, 2000);
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1DA1F2" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => {
            // Handle user profile view
          }}
        >
          <Image
            source={{ uri: MOCK_MESSAGES[0].user.avatar }}
            style={styles.avatar}
          />
          <View style={styles.headerTextContainer}>
            <View style={styles.nameContainer}>
              <Text style={styles.headerName}>{MOCK_MESSAGES[0].user.name}</Text>
              <MaterialCommunityIcons name="check-decagram" size={16} color="#1DA1F2" />
            </View>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.moreButton}
          accessibilityLabel="More options"
        >
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#1DA1F2" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item, index }) => (
          <Message 
            message={item} 
            isLastMessage={index === messages.length - 1}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            accessibilityLabel="Add attachment"
            onPress={handleImageUpload}
          >
            <MaterialCommunityIcons name="paperclip" size={24} color="#657786" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            accessibilityLabel="Message input"
          />

          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!message.trim() || sending}
            accessibilityLabel="Send message"
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#14171A',
    marginRight: 4,
  },
  headerStatus: {
    fontSize: 14,
    color: '#657786',
  },
  moreButton: {
    padding: 8,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  senderInfo: {
    flexDirection: 'column',
    marginBottom: 4,
  },
  messageAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  senderNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#657786',
    marginRight: 4,
  },
  senderStatus: {
    fontSize: 12,
    color: '#657786',
  },
  messageBubble: {
    borderRadius: 20,
    padding: 12,
    maxWidth: '100%',
  },
  myMessageBubble: {
    backgroundColor: '#1DA1F2',
  },
  otherMessageBubble: {
    backgroundColor: '#F5F8FA',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#14171A',
  },
  messageImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#657786',
    marginRight: 4,
  },
  readStatus: {
    flexDirection: 'row',
    alignItems: 'center',
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

export default ChatScreen;