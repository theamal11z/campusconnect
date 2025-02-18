
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useColleges } from '../lib/hooks/useData';
import { TagService } from '../lib/services/TagService';
import { Tag } from '../lib/components/Tag';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'private', label: 'Private' },
  { id: 'public', label: 'Public' },
  { id: 'top10', label: 'Top 10' },
  { id: 'top50', label: 'Top 50' },
];

const CollegeCard = ({ college }) => (
  <View style={styles.card}>
    <Image source={{ uri: college.image }} style={styles.collegeImage} />
    <View style={styles.cardContent}>
      <Text style={styles.collegeName}>{college.name}</Text>
      <Text style={styles.collegeLocation}>
        <MaterialCommunityIcons name="map-marker" size={16} color="#657786" />
        {' '}{college.location}
      </Text>
      <Text style={styles.collegeDescription}>{college.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.collegeType}>{college.type}</Text>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const ExploreScreen = () => {
  const { colleges, loading, error, refetch } = useColleges();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const tags = await TagService.getAllTags();
      setTags(tags);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(current =>
      current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag]
    );
  };

  const filteredColleges = useMemo(() => {
    if (!colleges) return [];
    
    return colleges.filter(college => {
      const matchesSearch = !searchQuery || 
        college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        college.location.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesFilter = activeFilter === 'all' || 
        (activeFilter === 'private' && college.type === 'Private') ||
        (activeFilter === 'public' && college.type === 'Public') ||
        (activeFilter === 'top10' && college.ranking <= 10) ||
        (activeFilter === 'top50' && college.ranking <= 50);
        
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => college.tags?.includes(tag));
        
      return matchesSearch && matchesFilter && matchesTags;
    });
  }, [colleges, searchQuery, activeFilter, selectedTags]);

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color="#657786" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search colleges..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {FILTERS.map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              activeFilter === filter.id && styles.activeFilterChip
            ]}
            onPress={() => setActiveFilter(filter.id)}
          >
            <Text style={[
              styles.filterText,
              activeFilter === filter.id && styles.activeFilterText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagsContainer}
      >
        {tags.map(tag => (
          <Tag
            key={tag.id}
            label={tag.tag}
            active={selectedTags.includes(tag.tag)}
            onPress={() => toggleTag(tag.tag)}
          />
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DA1F2" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredColleges}
          renderItem={({ item }) => <CollegeCard college={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.collegesList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refetch} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#14171A',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  tagsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F8FA',
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#1DA1F2',
  },
  filterText: {
    color: '#657786',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#fff',
  },
  collegesList: {
    padding: 16,
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
    padding: 16,
  },
  errorText: {
    color: '#E0245E',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  collegeImage: {
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  collegeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14171A',
    marginBottom: 4,
  },
  collegeLocation: {
    fontSize: 14,
    color: '#657786',
    marginBottom: 8,
  },
  collegeDescription: {
    fontSize: 14,
    color: '#14171A',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collegeType: {
    fontSize: 14,
    color: '#657786',
  },
  viewButton: {
    backgroundColor: '#1DA1F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ExploreScreen;
