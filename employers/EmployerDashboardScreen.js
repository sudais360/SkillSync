import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';


const EmployerDashboardScreen = ({ navigation, route }) => {
  // Get recently added job details from navigation params
  const recentlyAddedJob = route.params?.recentlyAddedJob;

  // Function to navigate to JobDetailsScreen
  const handlePressJobCard = () => {
    navigation.navigate('JobDetails', { jobDetails: recentlyAddedJob });
  };

  return (
    <View style={styles.container}>
      <Text>Dashboard Screen</Text>
      {/* Display recently added job details */}
      {recentlyAddedJob && (
        <TouchableOpacity style={styles.recentJobContainer} onPress={handlePressJobCard}>
          <Text style={styles.recentJobTitle}>Recently Added:</Text>
          {/* Render each recently added job as a card */}
          <View style={styles.jobCard}>
            <Text>Title: {recentlyAddedJob.position}</Text>
            <Text>Salary: {recentlyAddedJob.salary}</Text>
            <Text>Posted Date: {recentlyAddedJob.timestamp}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentJobContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
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
});

export default EmployerDashboardScreen;
