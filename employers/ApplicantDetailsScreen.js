import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ApplicantDetailsScreen = ({ route }) => {
  const { applicant } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Applicant Details</Text>
      <Text>Name: {applicant.name}</Text>
      <Text>Email: {applicant.email}</Text>
      <Text>Phone: {applicant.phone}</Text>
      <Text>Current Job Title: {applicant.currentJobTitle}</Text>
      <Text>Skills: {applicant.skills}</Text>
      <Text>Experience: {applicant.experience}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default ApplicantDetailsScreen;
