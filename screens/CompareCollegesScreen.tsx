
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const CompareCollegesScreen = ({ route, navigation }) => {
  const { collegeId } = route.params;
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColleges();
  }, [collegeId]);

  const fetchColleges = async () => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .in('id', [collegeId]);

      if (error) throw error;
      setSelectedColleges(data || []);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    } finally {
      setLoading(false);
    }
  };

  const ComparisonRow = ({ label, value1, value2 }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.values}>
        <Text style={styles.value}>{value1}</Text>
        <Text style={styles.value}>{value2 || '---'}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>College Comparison</Text>
        </View>

        <View style={styles.collegeHeaders}>
          {selectedColleges.map((college, index) => (
            <Text key={index} style={styles.collegeName}>{college.name}</Text>
          ))}
          {selectedColleges.length === 1 && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('Explore')}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#1DA1F2" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.comparisonContainer}>
          {selectedColleges[0] && (
            <>
              <ComparisonRow 
                label="Location" 
                value1={selectedColleges[0].location}
                value2={selectedColleges[1]?.location}
              />
              <ComparisonRow 
                label="Type" 
                value1={selectedColleges[0].type}
                value2={selectedColleges[1]?.type}
              />
              <ComparisonRow 
                label="Ranking" 
                value1={`#${selectedColleges[0].ranking}`}
                value2={selectedColleges[1] ? `#${selectedColleges[1].ranking}` : null}
              />
              <ComparisonRow 
                label="Student Count" 
                value1={selectedColleges[0].student_count}
                value2={selectedColleges[1]?.student_count}
              />
            </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171A',
  },
  collegeHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  collegeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14171A',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5FE',
    borderRadius: 20,
  },
  comparisonContainer: {
    padding: 16,
  },
  row: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#657786',
    marginBottom: 8,
  },
  values: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: '#14171A',
    textAlign: 'center',
  },
});

export default CompareCollegesScreen;
