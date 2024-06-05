import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import axios from 'axios';

const EmployeeJobDetailsScreen = ({ route, navigation }) => {
  const { jobDetails, employeeId } = route.params;

  const handleApply = async () => {
    try {
      const applicationData = {
        employee_id: employeeId,
        job_id: jobDetails.JobID,
      };
      await axios.post('http://192.168.1.17:5000/apply', applicationData);
      alert('Application submitted successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Failed to apply for job. Please try again.');
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
      <Button title="Apply" onPress={handleApply} />
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
});

export default EmployeeJobDetailsScreen;
