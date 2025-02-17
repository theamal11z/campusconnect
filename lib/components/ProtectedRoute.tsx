
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const navigation = useNavigation();

  React.useEffect(() => {
    if (!loading && !session) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [session, loading, navigation]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  return session ? <>{children}</> : null;
}
