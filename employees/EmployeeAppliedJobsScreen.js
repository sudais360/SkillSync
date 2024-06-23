import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const EmployeeAppliedJobsScreen = ({ route }) => {
  const { employeeId } = route.params;
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const response = await axios.get(`http://192.168.1.17:5000/applied_jobs?employee_id=${employeeId}`);
        setAppliedJobs(response.data);

        // Save the applied jobs locally
        await AsyncStorage.setItem('appliedJobs', JSON.stringify(response.data));
      } catch (error) {
        console.error('Error fetching applied jobs:', error);
      }
    };

    fetchAppliedJobs();
  }, [employeeId]);

  const handleRemoveJob = async (jobId) => {
    try {
      const updatedJobs = appliedJobs.filter(job => job.JobID !== jobId);
      await AsyncStorage.setItem('appliedJobs', JSON.stringify(updatedJobs));
      setAppliedJobs(updatedJobs);
      Alert.alert('Job removed successfully!');
    } catch (error) {
      console.error('Error removing job:', error);
      Alert.alert('Failed to remove job. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Applied Jobs</Text>
      <FlatList
        data={appliedJobs}
        keyExtractor={(item) => item.JobID.toString()}
        renderItem={({ item }) => (
          <View style={styles.jobCard}>
            <Text>Title: {item.Title}</Text>
            <Text>Company: {item.CompanyName}</Text>
            <Text>Status: {item.Status}</Text>
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

export default EmployeeAppliedJobsScreen;
