import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button, Alert } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const JobApplicantsScreen = ({ route, navigation }) => {
  const { jobId } = route.params;
  const [applicants, setApplicants] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/job/${jobId}/applicants`);
        const sortedApplicants = response.data.sort((a, b) => b.score - a.score);
        setApplicants(sortedApplicants);
      } catch (error) {
        console.error('Error fetching applicants:', error);
        setError(error);
      }
    };

    fetchApplicants();
  }, [jobId]);

  const handlePressApplicant = (applicant) => {
    navigation.navigate('ApplicantDetails', { applicant });
  };

  const updateApplicantStatus = async (applicantId, status) => {
    try {
      await axios.put(`${API_BASE_URL}/applicants/${applicantId}/status`, { status });
      setApplicants((prevApplicants) =>
        prevApplicants.map((applicant) =>
          applicant.id === applicantId ? { ...applicant, status } : applicant
        )
      );
      Alert.alert('Success', `Applicant status updated to ${status}.`);
    } catch (error) {
      console.error('Error updating applicant status:', error);
      Alert.alert('Error', 'Failed to update applicant status. Please try again.');
    }
  };

  const renderApplicant = ({ item }) => (
    <View style={styles.applicantCard}>
      <Text>Name: {item.name}</Text>
      <Text>Phone: {item.phone}</Text>
      <Text>Score: {Math.round(item.score).toString()}</Text>
      <Text>Status: {item.status || 'Pending'}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Accept" onPress={() => updateApplicantStatus(item.id, 'Accepted')} />
        <Button title="Reject" onPress={() => updateApplicantStatus(item.id, 'Rejected')} />
      </View>
    </View>
  );

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Applicants</Text>
        <Text style={styles.errorText}>Error fetching applicants: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Applicants</Text>
      <FlatList
        data={applicants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderApplicant}
      />
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
  applicantCard: {
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
  },
});

export default JobApplicantsScreen;
