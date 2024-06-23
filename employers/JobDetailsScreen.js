import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';

const JobDetailsScreen = ({ route, navigation }) => {
  // Retrieve job details from navigation params
  const { jobDetails } = route.params;

  // State variables for editable job details
  const [position, setPosition] = useState(jobDetails.Title);
  const [salary, setSalary] = useState(jobDetails.Salary);
  const [scope, setScope] = useState(jobDetails.Scope);
  const [expectations, setExpectations] = useState(jobDetails.Description);

  // Function to save edited job details
  const saveJobDetails = async () => {
    try {
      const updatedJobDetails = {
        position,
        salary,
        scope,
        expectations,
        skills: jobDetails.Skills,  // assuming skills are not being edited here
      };

      // Make a PUT request to update the job details
      const response = await axios.put(`http://192.168.1.17:5000/jobpostings/${jobDetails.JobID}`, updatedJobDetails);

      console.log("Updated Job Details:", response.data);
      
      // Show success alert
      Alert.alert("Success", "Job details updated successfully!");

      // Navigate back to the dashboard and refresh the data
      navigation.navigate('EmployerDashboard', { recentlyUpdatedJob: updatedJobDetails });
    } catch (error) {
      console.error('Error updating job details:', error);
      Alert.alert("Error", "Failed to update job details. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job Details</Text>
      <TextInput
        style={styles.input}
        value={position}
        onChangeText={setPosition}
        placeholder="Position"
      />
      <TextInput
        style={styles.input}
        value={salary}
        onChangeText={setSalary}
        placeholder="Salary"
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={scope}
        onChangeText={setScope}
        placeholder="Scope"
        multiline
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={expectations}
        onChangeText={setExpectations}
        placeholder="Expectations/Good to Have"
        multiline
      />
      <Button title="Save" onPress={saveJobDetails} />
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});

export default JobDetailsScreen;
