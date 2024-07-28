import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const EmployeeAppliedJobsScreen = ({ navigation }) => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [employeeId, setEmployeeId] = useState(1); // Assuming you have a way to get the logged-in employee's ID

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (employeeId) {
        try {
          const response = await axios.get(`${API_BASE_URL}/applied_jobs`, { params: { employee_id: employeeId } });
          setAppliedJobs(response.data);
        } catch (error) {
          console.error('Error fetching applied jobs:', error);
        }
      }
    };

    fetchAppliedJobs();
  }, [employeeId]);

  const handlePressJobCard = (jobDetails) => {
    navigation.navigate('EmployeeJobDetails', { jobDetails });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Applied Jobs</Text>
      <FlatList
        data={appliedJobs}
        keyExtractor={(item) => item.JobID.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.jobCard} onPress={() => handlePressJobCard(item)}>
            <Text style={styles.companyName}>Company Name: {item.CompanyName}</Text>
            <Text style={styles.jobTitle}>Title: {item.Title}</Text>
            <Text>Status: {item.Status}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No applied jobs found</Text>}
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
  sectionTitle: {
    fontSize: 18,
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  companyName: {
    fontWeight: 'bold',
  },
  jobTitle: {
    fontSize: 16,
    marginTop: 5,
  },
});

export default EmployeeAppliedJobsScreen;
