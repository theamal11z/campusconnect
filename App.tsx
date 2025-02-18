import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from 'sonner-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from "./screens/HomeScreen"
import ProfileScreen from "./screens/ProfileScreen"
import SettingsScreen from "./screens/SettingsScreen"
import LoginScreen from "./screens/LoginScreen"
import RegisterScreen from "./screens/RegisterScreen"
import ExploreScreen from "./screens/ExploreScreen"
import ChatScreen from "./screens/ChatScreen"
import NotificationsScreen from "./screens/NotificationsScreen"
import VerifyScreen from "./screens/VerifyScreen"
import React, { useState, createContext, useContext, useEffect } from 'react';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// AuthContext
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const login = (userData) => {
    // Simulate login - replace with actual authentication logic
    setUser(userData);
    setIsAuthenticated(true);
    // Store token in AsyncStorage or similar
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Clear token from AsyncStorage or similar
  };

  useEffect(() => {
    // Check for existing token on app start
    const checkToken = async () => {
       //Replace with actual token retrieval
      const token = await AsyncStorage.getItem('token');
      if(token){
        setIsAuthenticated(true);
      }
    };
    checkToken();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


const useAuth = () => {
  return useContext(AuthContext);
};

//ProtectedRoute Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Stack.Screen name="Login" component={LoginScreen} />;
  }

  return children;
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ExploreTab') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'ChatTab') {
            iconName = focused ? 'chat' : 'chat-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1DA1F2',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E1E8ED',
          paddingTop: 5,
          paddingBottom: 5,
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="ExploreTab" 
        component={ExploreScreen}
        options={{ title: 'Explore' }}
      />
      <Tab.Screen 
        name="ChatTab" 
        component={ChatScreen}
        options={{ title: 'Chats' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function RootStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen
        name="Main"
        component={MainTabs}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Verify" component={VerifyScreen} />
      {/* Added Forums Screen here */}
      {/* Assuming these screens exist */}
      {/* <Stack.Screen name="Forums" component={ForumsScreen} /> */}
      {/* <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} /> */}
      {/* <Stack.Screen name="EditProfile" component={EditProfileScreen} /> */}
    </Stack.Navigator>
  );
}

import { ErrorBoundary } from './lib/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider style={styles.container}>
        <AuthProvider>
          <Toaster />
          <NavigationContainer>
            <RootStack />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});