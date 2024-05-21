import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';

const JobDetailsScreen = ({ route }) => {
  // Retrieve job details from navigation params
  const { jobDetails } = route.params;
  
  // State variables for editable job details
  const [position, setPosition] = useState(jobDetails.position);
  const [salary, setSalary] = useState(jobDetails.salary);
  const [scope, setScope] = useState(jobDetails.scope);
  const [expectations, setExpectations] = useState(jobDetails.expectations);

  // Function to save edited job details
  const saveJobDetails = () => {
    // Implement code to save edited job details
    // For demonstration purposes, just log the updated details
    console.log("Updated Job Details:", { position, salary, scope, expectations });
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
