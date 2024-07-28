import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Button, Modal, Alert } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config';

const EmployerDashboardScreen = ({ navigation, route }) => {
  const [jobPostings, setJobPostings] = useState([]);
  const [suggestedEmployees, setSuggestedEmployees] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [shareableUrl, setShareableUrl] = useState(null); // State to hold the shareable URL
  const recentlyAddedJob = route.params?.recentlyAddedJob;
  const { employerId } = route.params; // Receive employerId from route params

  // Function to fetch job postings from the backend
  const fetchJobPostings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobpostings?employer_id=${employerId}`);
      setJobPostings(response.data);
    } catch (error) {
      console.error('Error fetching job postings:', error);
    }
  };

  // Function to fetch suggested employees based on job posting
  const fetchSuggestedEmployees = async (jobId, jobTitle, jobSkills) => {
    const requestData = {
      employer_id: employerId,
      job_id: jobId,
      job_title: jobTitle,
      job_skills: jobSkills,
    };
    console.log('Request data:', requestData); // Log the request data
    try {
      const response = await axios.post(`${API_BASE_URL}/suggest_employees`, requestData);
      setSuggestedEmployees(response.data);
      setModalVisible(true); // Show the modal with suggested employees
    } catch (error) {
      console.error('Error fetching suggested employees:', error);
      console.log('Error details:', error.response.data); // Log error details
    }
  };

  // Refresh job postings when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchJobPostings();
    }, [route])
  );

  const handlePressJobCard = (jobDetails) => {
    navigation.navigate('JobDetailsNavigator', { screen: 'JobDetails', params: { jobDetails } });
  };

  const handleEditJobPosting = (jobDetails) => {
    navigation.navigate('JobDetailsNavigator', { screen: 'JobDetails', params: { jobDetails } });
  };

  const handleViewApplicants = (jobId) => {
    navigation.navigate('JobDetailsNavigator', { screen: 'JobApplicants', params: { jobId } });
  };

  const handleSuggestEmployees = (job) => {
    setSelectedJob(job);
    console.log('Selected job:', job); // Log the selected job to verify job details
    console.log('Skills:', job.Skills); // Log the Skills to ensure it's fetched
    fetchSuggestedEmployees(job.JobID, job.Title, job.Skills);
  };

  const handleShareJob = async (job) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/generate_shareable_url`, {
        job_id: job.JobID,
        employee_id: 'some_employee_id', // Replace with actual employee ID or handle dynamically
      });

      const url = response.data.shareable_url;
      setShareableUrl(url); // Set the shareable URL to state
      Alert.alert('Shareable URL generated', url); // Show the URL in an alert
    } catch (error) {
      console.error('Error generating shareable URL:', error);
      Alert.alert('Failed to generate shareable URL. Please try again.');
    }
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
        keyExtractor={(item) => item.JobID.toString()} // Ensure each key is unique
        renderItem={({ item }) => (
          <View style={styles.jobCard}>
            <Text>Title: {item.Title}</Text>
            <Text>Salary: {item.Salary}</Text>
            <Text>Location: {item.Location}</Text>
            <Text>Skills: {item.Skills}</Text>
            <Button title="View Applicants" onPress={() => handleViewApplicants(item.JobID)} />
            <Button title="Edit Job Posting" onPress={() => handleEditJobPosting(item)} />
            <Button title="Suggest Employees" onPress={() => handleSuggestEmployees(item)} />
            <Button title="Share Job" onPress={() => handleShareJob(item)} />
          </View>
        )}
      />

      {/* Display the shareable URL if available */}
      {shareableUrl && (
        <View style={styles.shareableUrlContainer}>
          <Text style={styles.shareableUrlText}>Shareable URL:</Text>
          <Text style={styles.shareableUrl}>{shareableUrl}</Text>
        </View>
      )}

      {/* Modal for displaying suggested employees */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Suggested Employees for {selectedJob?.Title}</Text>
          <FlatList
            data={suggestedEmployees}
            keyExtractor={(item) => item.EmployeeID.toString()}
            renderItem={({ item }) => (
              <View style={styles.employeeCard}>
                <Text>Name: {item.Name}</Text>
                <Text>Email: {item.Email}</Text>
                <Text>Phone: {item.Phone}</Text>
                <Text>Location: {item.Location}</Text>
                <Text>Skills: {item.Skills}</Text>
                <Text>Experience: {item.Experience}</Text>
                <Text>Relevance Score: {item.RelevanceScore.toFixed(2)}%</Text>
              </View>
            )}
          />
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
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
  shareableUrlContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  shareableUrlText: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  shareableUrl: {
    color: 'blue',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  employeeCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'lightgray',
    marginBottom: 10,
    width: '100%',
  },
});

export default EmployerDashboardScreen;
