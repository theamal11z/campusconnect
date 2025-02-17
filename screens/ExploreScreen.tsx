import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useColleges } from '../lib/hooks/useData';

const ExploreScreen = () => {
  const { colleges, loading, error } = useColleges();
  {
    id: '2',
    name: 'Stanford University',
    location: 'Stanford, CA',
    type: 'Private',
    ranking: 2,
    description: 'Leading research institution in the heart of Silicon Valley.',
    image: 'https://api.a0.dev/assets/image?text=Stanford%20University%20Campus&aspect=16:9&seed=2',
  },
  {
    id: '3',
    name: 'MIT',
    location: 'Cambridge, MA',
    type: 'Private',
    ranking: 3,
    description: 'Premier institution for science, technology, and engineering.',
    image: 'https://api.a0.dev/assets/image?text=MIT%20Campus&aspect=16:9&seed=3',
  },
];

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

  const filteredColleges = MOCK_COLLEGES.filter(college => 
    college.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          data={colleges}
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