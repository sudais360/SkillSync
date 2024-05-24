import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const EmployerDashboardScreen = ({ navigation, route }) => {
  const [jobPostings, setJobPostings] = useState([]);
  const recentlyAddedJob = route.params?.recentlyAddedJob;
  const { employerId } = route.params; // Receive employerId from route params

  // Function to fetch job postings from the backend
  const fetchJobPostings = async () => {
    try {
      const response = await axios.get(`http://192.168.1.17:5000/jobpostings?employer_id=${employerId}`);
      setJobPostings(response.data);
    } catch (error) {
      console.error('Error fetching job postings:', error);
    }
  };

  // Refresh job postings when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchJobPostings();
    }, [route])
  );

  const handlePressJobCard = (jobDetails) => {
    navigation.navigate('JobDetails', { jobDetails });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard Screen</Text>
      <Text style={styles.text}>Employer ID: {employerId}</Text>

      {/* Display recently added job details */}
      {recentlyAddedJob && (
        <TouchableOpacity style={styles.recentJobContainer} onPress={() => handlePressJobCard(recentlyAddedJob)}>
          <Text style={styles.recentJobTitle}>Recently Added:</Text>
          <View style={styles.jobCard}>
            <Text>Title: {recentlyAddedJob.position}</Text>
            <Text>Salary: {recentlyAddedJob.salary}</Text>
            <Text>Posted Date: {recentlyAddedJob.timestamp}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Display all job postings */}
      <FlatList
        data={jobPostings}
        keyExtractor={(item) => item.JobID.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.jobCard} onPress={() => handlePressJobCard(item)}>
            <Text>Title: {item.Title}</Text>
            <Text>Salary: {item.Salary}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  recentJobContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  recentJobTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  jobCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'lightgray',
    marginBottom: 15,
    elevation: 3, // Add elevation for shadow (Android)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default EmployerDashboardScreen;
