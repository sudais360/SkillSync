import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const EmployeeJobDetailsScreen = ({ route, navigation }) => {
  const { jobDetails, employeeId } = route.params;

  useEffect(() => {
    console.log("Employee ID:", employeeId);
  }, [employeeId]);

  const handleApply = async () => {
    try {
      if (!employeeId) {
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
        applicant_id: employeeId, // Ensure the key matches what the backend expects
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

  const handleSave = async () => {
    try {
      const savedJobs = await AsyncStorage.getItem('savedJobs');
      const parsedJobs = savedJobs ? JSON.parse(savedJobs) : [];
      
      // Check if the job is already saved
      const jobExists = parsedJobs.some(job => job.JobID === jobDetails.JobID);
      if (jobExists) {
        Alert.alert('Job already saved!');
        return;
      }

      parsedJobs.push(jobDetails);
      await AsyncStorage.setItem('savedJobs', JSON.stringify(parsedJobs));
      Alert.alert('Job saved successfully!');
    } catch (error) {
      console.error('Error saving job:', error);
      Alert.alert('Failed to save job. Please try again.');
    }
  };

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
        <Button title="Save" onPress={handleSave} />
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

export default EmployeeJobDetailsScreen;
