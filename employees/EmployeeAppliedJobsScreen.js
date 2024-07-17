import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const EmployeeDashboardScreen = ({ navigation }) => {
  const [jobPostings, setJobPostings] = useState([]);
  const [filteredJobPostings, setFilteredJobPostings] = useState([]);
  const [suggestedJobs, setSuggestedJobs] = useState([]);
  const [preferredJobTitle, setPreferredJobTitle] = useState('');
  const [employeeId, setEmployeeId] = useState(1); // Assuming you have a way to get the logged-in employee's ID

  useEffect(() => {
    const fetchJobPostings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/employee_jobpostings`);
        setJobPostings(response.data);
        setFilteredJobPostings(response.data);
      } catch (error) {
        console.error('Error fetching job postings:', error);
      }
    };

    const fetchSuggestedJobs = async () => {
      if (employeeId) {
        try {
          const response = await axios.post(`${API_BASE_URL}/suggest_jobs`, { employee_id: employeeId, preferred_job_title: preferredJobTitle });
          setSuggestedJobs(response.data);
        } catch (error) {
          console.error('Error fetching suggested jobs:', error);
        }
      }
    };

    fetchJobPostings();
    fetchSuggestedJobs();
  }, [preferredJobTitle, employeeId]);

  useEffect(() => {
    const filtered = jobPostings.filter(job => job.Title.toLowerCase().includes(preferredJobTitle.toLowerCase()));
    setFilteredJobPostings(filtered);
  }, [preferredJobTitle, jobPostings]);

  const handlePressJobCard = (jobDetails) => {
    navigation.navigate('EmployeeJobDetails', { jobDetails });
  };

  const handlePreferredJobTitleChange = async (title) => {
    setPreferredJobTitle(title);
    if (employeeId) {
      try {
        await axios.post(`${API_BASE_URL}/update_keyword_frequency`, { employee_id: employeeId, keyword: title });
      } catch (error) {
        console.error('Error updating keyword frequency:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Preferred job title"
        value={preferredJobTitle}
        onChangeText={handlePreferredJobTitleChange}
      />
      <Text style={styles.sectionTitle}>Suggested Jobs</Text>
      <FlatList
        data={suggestedJobs}
        keyExtractor={(item) => item.JobID.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.jobCard} onPress={() => handlePressJobCard(item)}>
            <Text style={styles.companyName}>Company Name: {item.CompanyName}</Text>
            <Text style={styles.jobTitle}>Title: {item.Title}</Text>
            <Text>Salary: {item.Salary}</Text>
            <Text>Description: {item.Description}</Text>
            <Text>Relevance Score: {item.RelevanceScore.toFixed(2)}%</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No suggested jobs found</Text>}
      />
      <Text style={styles.sectionTitle}>All Job Postings</Text>
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

export default EmployeeDashboardScreen;
