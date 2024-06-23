import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EmployeeSavedJobsScreen = () => {
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const savedJobs = await AsyncStorage.getItem('savedJobs');
        setSavedJobs(savedJobs ? JSON.parse(savedJobs) : []);
      } catch (error) {
        console.error('Error fetching saved jobs:', error);
      }
    };

    fetchSavedJobs();
  }, []);

  const handleRemoveJob = async (jobId) => {
    try {
      const updatedJobs = savedJobs.filter(job => job.JobID !== jobId);
      await AsyncStorage.setItem('savedJobs', JSON.stringify(updatedJobs));
      setSavedJobs(updatedJobs);
      Alert.alert('Job removed successfully!');
    } catch (error) {
      console.error('Error removing job:', error);
      Alert.alert('Failed to remove job. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Jobs</Text>
      <FlatList
        data={savedJobs}
        keyExtractor={(item) => item.JobID.toString()}
        renderItem={({ item }) => (
          <View style={styles.jobCard}>
            <Text>Title: {item.Title}</Text>
            <Text>Company: {item.CompanyName}</Text>
            <Button title="Remove" onPress={() => handleRemoveJob(item.JobID)} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  jobCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'lightgray',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default EmployeeSavedJobsScreen;
