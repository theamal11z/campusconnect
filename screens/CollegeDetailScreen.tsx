
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { ActivityIndicator } from 'react-native';

const { width } = Dimensions.get('window');

const CollegeDetailScreen = ({ route, navigation }) => {
  const { collegeId } = route.params;
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCollegeDetails();
  }, [collegeId]);

  const fetchCollegeDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select(`
          *,
          reviews: college_reviews (
            rating,
            comment,
            user: profiles (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('id', collegeId)
        .single();

      if (error) throw error;
      setCollege(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  if (error || !college) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading college details</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <ScrollView>
        <Image 
          source={{ uri: college.image_url }} 
          style={styles.coverImage}
        />
        
        <View style={styles.contentContainer}>
          <Text style={styles.collegeName}>{college.name}</Text>
          <Text style={styles.location}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#657786" />
            {' '}{college.location}
          </Text>

          <View style={styles.statsContainer}>
            <StatItem icon="school" label="Type" value={college.type} />
            <StatItem icon="trophy" label="Ranking" value={`#${college.ranking}`} />
            <StatItem icon="account-group" label="Students" value={college.student_count} />
          </View>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{college.description}</Text>

          <Text style={styles.sectionTitle}>Location</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: college.latitude,
              longitude: college.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            <Marker
              coordinate={{
                latitude: college.latitude,
                longitude: college.longitude,
              }}
              title={college.name}
            />
          </MapView>

          <Text style={styles.sectionTitle}>Reviews</Text>
          {college.reviews?.map((review, index) => (
            <View key={index} style={styles.reviewCard}>
              <Image 
                source={{ uri: review.user.avatar_url }} 
                style={styles.reviewerAvatar}
              />
              <View style={styles.reviewContent}>
                <Text style={styles.reviewerName}>{review.user.full_name}</Text>
                <Text style={styles.rating}>{'★'.repeat(review.rating)}</Text>
                <Text style={styles.reviewText}>{review.comment}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatItem = ({ icon, label, value }) => (
  <View style={styles.statItem}>
    <MaterialCommunityIcons name={icon} size={24} color="#1DA1F2" />
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  contentContainer: {
    padding: 16,
  },
  collegeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14171A',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#657786',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#657786',
    fontSize: 12,
    marginTop: 4,
  },
  statValue: {
    color: '#14171A',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#14171A',
    marginBottom: 12,
    marginTop: 24,
  },
  description: {
    fontSize: 16,
    color: '#657786',
    lineHeight: 24,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  reviewCard: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewContent: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14171A',
  },
  rating: {
    color: '#FFD700',
    marginVertical: 4,
  },
  reviewText: {
    color: '#657786',
    fontSize: 14,
  },
});

export default CollegeDetailScreen;
