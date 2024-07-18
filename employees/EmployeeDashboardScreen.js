import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, RefreshControl } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const EmployeeDashboardScreen = ({ route, navigation }) => {
  const { employeeId } = route.params;
  const [jobPostings, setJobPostings] = useState([]);
  const [filteredJobPostings, setFilteredJobPostings] = useState([]);
  const [suggestedJobs, setSuggestedJobs] = useState([]);
  const [preferredJobTitle, setPreferredJobTitle] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobPostings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employee_jobpostings`);
      setJobPostings(response.data);
      setFilteredJobPostings(response.data);
      console.log('Job postings fetched:', response.data);
    } catch (error) {
      console.error('Error fetching job postings:', error);
    }
  };

  const fetchSuggestedJobs = async () => {
    if (employeeId) {
      try {
        const response = await axios.post(`${API_BASE_URL}/suggest_jobs`, { user_id: employeeId, preferred_job_title: preferredJobTitle });
        setSuggestedJobs(response.data);
        console.log('Suggested jobs fetched:', response.data);
      } catch (error) {
        console.error('Error fetching suggested jobs:', error);
      }
    }
  };

  useEffect(() => {
    fetchJobPostings();
    fetchSuggestedJobs();
  }, [employeeId]);

  const handlePressJobCard = (jobDetails) => {
    navigation.navigate('EmployeeJobDetails', { jobDetails });
  };

  const handleSearch = () => {
    const filtered = jobPostings.filter(job => job.Title.toLowerCase().includes(preferredJobTitle.toLowerCase()));
    setFilteredJobPostings(filtered);
    fetchSuggestedJobs();
    if (employeeId) {
      axios.post(`${API_BASE_URL}/update_keyword_frequency`, { employee_id: employeeId, keyword: preferredJobTitle })
        .then(response => {
          console.log('Keyword frequency updated:', response.data);
        })
        .catch(error => {
          console.error('Error updating keyword frequency:', error);
        });
    }
  };

  const handleReset = () => {
    setPreferredJobTitle('');
    setFilteredJobPostings(jobPostings);
    fetchSuggestedJobs();
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobPostings().then(() => setRefreshing(false));
    fetchSuggestedJobs().then(() => setRefreshing(false));
  };

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchBar}
              placeholder="Preferred job title"
              value={preferredJobTitle}
              onChangeText={setPreferredJobTitle}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Suggested Jobs</Text>
          <FlatList
            horizontal
            data={suggestedJobs}
            keyExtractor={(item) => item.JobID.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.suggestedJobCard} onPress={() => handlePressJobCard(item)}>
                <View style={styles.cardContent}>
                  <Text style={styles.companyName}>{item.CompanyName || 'Company Name Not Provided'}</Text>
                  <Text style={styles.jobTitle}>{item.Title || 'Title Not Provided'}</Text>
                  <Text style={styles.salary}>{item.Salary || 'Salary Not Provided'}</Text>
                  <Text style={styles.location}>{item.Location || 'Location Not Provided'}</Text>
                  <Text style={styles.description}>{item.Description || 'Description Not Provided'}</Text>
                  <Text style={styles.skills}>{item.SkillsRequired ? item.SkillsRequired.split(',').join(', ') : 'Skills Not Provided'}</Text>
                  <Text style={styles.relevanceScore}>Relevance Score: {item.RelevanceScore ? `${item.RelevanceScore.toFixed(2)}%` : 'N/A'}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.noJobsText}>No suggested jobs found</Text>}
            contentContainerStyle={styles.horizontalListContent}
            showsHorizontalScrollIndicator={false}
          />

          <View style={styles.spacing}></View>
          <Text style={styles.sectionTitle}>All Job Postings</Text>
        </View>
      }
      data={filteredJobPostings}
      keyExtractor={(item) => item.JobID.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.jobCard} onPress={() => handlePressJobCard(item)}>
          <View style={styles.cardContent}>
            <Text style={styles.companyName}>{item.CompanyName || 'Company Name Not Provided'}</Text>
            <Text style={styles.jobTitle}>{item.Title || 'Title Not Provided'}</Text>
            <Text style={styles.salary}>{item.Salary || 'Salary Not Provided'}</Text>
            <Text style={styles.location}>{item.Location || 'Location Not Provided'}</Text>
            <Text style={styles.description}>{item.Description || 'Description Not Provided'}</Text>
            <Text style={styles.skills}>{item.SkillsRequired ? item.SkillsRequired.split(',').join(', ') : 'Skills Not Provided'}</Text>
          </View>
        </TouchableOpacity>
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    paddingRight: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  searchButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  horizontalListContent: {
    paddingVertical: 10,
  },
  suggestedJobCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'lightgray',
    marginBottom: 15,
    marginRight: 10,
    width: 300,
    height: 250,  // Increase the height to fit more details
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 10,  // Added padding for better spacing
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'lightgray',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 10,  // Added padding for better spacing
  },
  cardContent: {
    flex: 1,
  },
  spacing: {
    height: 30,
  },
  companyName: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 5,
  },
  salary: {
    marginTop: 5,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  location: {
    marginTop: 5,
    marginBottom: 5,
    fontSize: 14,
    color: '#555',
  },
  description: {
    marginTop: 5,
    marginBottom: 10,
    fontSize: 14,
    color: '#555',
  },
  skills: {
    marginTop: 5,
    marginBottom: 10,
    fontSize: 14,
    color: '#555',
  },
  relevanceScore: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  noJobsText: {
    fontSize: 16,
    color: 'gray',
  },
  listContent: {
    paddingBottom: 20,  // Ensure there's space at the bottom
  },
});

export default EmployeeDashboardScreen;
