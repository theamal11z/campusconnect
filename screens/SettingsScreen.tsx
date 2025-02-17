import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

const SETTINGS_CATEGORIES = [
  {
    id: 'account',
    title: 'Account',
    icon: 'account-circle',
    settings: [
      { id: 'email', title: 'Email Notifications', type: 'toggle', value: true },
      { id: 'privacy', title: 'Private Account', type: 'toggle', value: false },
      { 
        id: 'verify', 
        title: 'Verify Identity', 
        type: 'button',
        description: 'Verify your identity to unlock all features',
        action: (navigation) => navigation.navigate('Verify'),
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: 'bell',
    settings: [
      { id: 'push', title: 'Push Notifications', type: 'toggle', value: true },
      { id: 'mentions', title: 'Mentions', type: 'toggle', value: true },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    icon: 'shield-check',
    settings: [
      { id: 'tfa', title: 'Two-Factor Authentication', type: 'toggle', value: false },
      { id: 'location', title: 'Location Services', type: 'toggle', value: true },
    ],
  },
  {
    id: 'display',
    title: 'Display',
    icon: 'palette',
    settings: [
      { id: 'darkMode', title: 'Dark Mode', type: 'toggle', value: false },
      { id: 'fontSize', title: 'Large Text', type: 'toggle', value: false },
    ],
  },
];

const Header = ({ onBack, title }) => {
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
        
        <Text style={styles.headerTitle}>{title}</Text>
        
        <View style={styles.headerIcon} />
      </LinearGradient>
    </View>
  );
};

const SettingItem = ({ setting, onToggle }) => (
  <View style={styles.settingItem}>
    <Text style={styles.settingTitle}>{setting.title}</Text>
    <Switch
      value={setting.value}
      onValueChange={(value) => onToggle(setting.id, value)}
      trackColor={{ false: '#767577', true: '#1DA1F2' }}
      thumbColor="#fff"
    />
  </View>
);

const SettingsCategory = ({ category, onToggleSetting }) => (
  <View style={styles.category}>
    <View style={styles.categoryHeader}>
      <MaterialCommunityIcons name={category.icon} size={24} color="#1DA1F2" />
      <Text style={styles.categoryTitle}>{category.title}</Text>
    </View>
    {category.settings.map((setting) => (
      <SettingItem
        key={setting.id}
        setting={setting}
        onToggle={onToggleSetting}
      />
    ))}
  </View>
);

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState(SETTINGS_CATEGORIES);

  const handleToggleSetting = (settingId, value) => {
    const newSettings = settings.map(category => ({
      ...category,
      settings: category.settings.map(setting =>
        setting.id === settingId ? { ...setting, value } : setting
      ),
    }));
    setSettings(newSettings);
    toast.success(`Setting updated successfully!`);
  };

  const handleSaveChanges = () => {
    toast.success('All changes saved successfully!');
  };

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
    toast.success('Logged out successfully!');
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <Header onBack={() => navigation.goBack()} title="Settings" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settings.map((category) => (
          <SettingsCategory
            key={category.id}
            category={category}
            onToggleSetting={handleToggleSetting}
          />
        ))}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveChanges}
        >
          <LinearGradient
            colors={['#1DA1F2', '#0D8ED9']}
            style={styles.saveButtonGradient}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14171A',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  category: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14171A',
    marginLeft: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  settingTitle: {
    fontSize: 16,
    color: '#14171A',
  },
  saveButton: {
    marginVertical: 24,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0245E',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#E0245E',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;