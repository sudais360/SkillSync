import React, { useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { API_BASE_URL } from '../config';

const SharedJobDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { job_id, employee_id } = route.params; // Ensure these are passed correctly

  const [jobDetails, setJobDetails] = React.useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/job_details?job_id=${job_id}`);
        setJobDetails(response.data);
      } catch (error) {
        console.error('Error fetching job details:', error);
        Alert.alert('Failed to fetch job details. Please try again.');
      }
    };

    fetchJobDetails();
  }, [job_id]);

  const handleApply = async () => {
    try {
      if (!employee_id) {
        Alert.alert("Error", "Employee ID is missing.");
        return;
      }

      // Check if the job is already applied
      const appliedJobs = await AsyncStorage.getItem('appliedJobs');
      const parsedAppliedJobs = appliedJobs ? JSON.parse(appliedJobs) : [];
      const jobExists = parsedAppliedJobs.some(job => job.JobID === jobDetails.JobID);
      if (jobExists) {
        Alert.alert('Job already applied!');
        return;
      }

      const applicationData = {
        applicant_id: employee_id, // Ensure the key matches what the backend expects
        job_id: jobDetails.JobID,
      };
      const response = await axios.post(`${API_BASE_URL}/apply`, applicationData);

      // Save to local storage
      parsedAppliedJobs.push(jobDetails);
      await AsyncStorage.setItem('appliedJobs', JSON.stringify(parsedAppliedJobs));

      Alert.alert('Application submitted successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error applying for job:', error);
      Alert.alert('Failed to apply for job. Please try again.');
    }
  };

  if (!jobDetails) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job Details</Text>
      <Text>Company Name: {jobDetails.CompanyName}</Text>
      <Text>Title: {jobDetails.Title}</Text>
      <Text>Salary: {jobDetails.Salary}</Text>
      <Text>Scope: {jobDetails.Scope}</Text>
      <Text>Expectations: {jobDetails.Description}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Apply" onPress={handleApply} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default SharedJobDetailsScreen;
