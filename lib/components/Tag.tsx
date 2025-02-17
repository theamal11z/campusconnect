
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TagProps {
  label: string;
  onPress?: () => void;
  active?: boolean;
}

export const Tag = ({ label, onPress, active = false }: TagProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <LinearGradient
        colors={active ? ['#1DA1F2', '#0D8ED9'] : ['#F5F8FA', '#F5F8FA']}
        style={styles.gradient}
      >
        <Text style={[styles.label, active && styles.activeLabel]}>
          {label}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
    marginBottom: 8,
  },
  gradient: {
    borderRadius: 16,
    padding: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  label: {
    fontSize: 14,
    color: '#657786',
  },
  activeLabel: {
    color: '#FFFFFF',
  },
});
