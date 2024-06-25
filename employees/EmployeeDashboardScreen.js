import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import axios from 'axios';

const EmployeeDashboardScreen = ({ navigation }) => {
  const [jobPostings, setJobPostings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredJobPostings, setFilteredJobPostings] = useState([]);

  useEffect(() => {
    const fetchJobPostings = async () => {
      try {
        const response = await axios.get('http://192.168.1.17:5000/employee_jobpostings');
        setJobPostings(response.data);
        setFilteredJobPostings(response.data);
      } catch (error) {
        console.error('Error fetching job postings:', error);
      }
    };
    fetchJobPostings();
  }, []);

  useEffect(() => {
    const filtered = jobPostings.filter(job =>
      job.Title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredJobPostings(filtered);
  }, [searchQuery, jobPostings]);

  const handlePressJobCard = (jobDetails) => {
    navigation.navigate('EmployeeJobDetails', { jobDetails });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by job title"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredJobPostings}
        keyExtractor={(item) => item.JobID.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.jobCard} onPress={() => handlePressJobCard(item)}>
            <Text style={styles.companyName}>Company Name: {item.CompanyName}</Text>
            <Text style={styles.jobTitle}>Title: {item.Title}</Text>
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
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
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
  companyName: {
    fontWeight: 'bold',
  },
  jobTitle: {
    fontSize: 16,
    marginTop: 5,
  },
});

export default EmployeeDashboardScreen;
