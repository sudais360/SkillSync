import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import axios from 'axios';

const EmployeeDashboardScreen = ({ navigation }) => {
  const [jobPostings, setJobPostings] = useState([]);

  useEffect(() => {
    const fetchJobPostings = async () => {
      try {
        const response = await axios.get('http://192.168.1.17:5000/employee_jobpostings');
        setJobPostings(response.data);
      } catch (error) {
        console.error('Error fetching job postings:', error);
      }
    };
    fetchJobPostings();
  }, []);

  const handlePressJobCard = (jobDetails) => {
    navigation.navigate('EmployeeJobDetails', { jobDetails });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={jobPostings}
        keyExtractor={(item) => item.JobID.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.jobCard} onPress={() => handlePressJobCard(item)}>
            <Text>Company Name: {item.CompanyName}</Text>
            <Text>Title: {item.Title}</Text>
            <Text>Salary: {item.Salary}</Text>
            <Text>Description: {item.Description}</Text>
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

export default EmployeeDashboardScreen;
