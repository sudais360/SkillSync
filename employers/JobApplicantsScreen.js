import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';

const JobApplicantsScreen = ({ route, navigation }) => {
  const { jobId } = route.params;
  const [applicants, setApplicants] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await axios.get(`http://192.168.1.17:5000/job/${jobId}/applicants`);
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

  const renderApplicant = ({ item }) => (
    <TouchableOpacity onPress={() => handlePressApplicant(item)} style={styles.applicantCard}>
      <Text>Name: {item.name}</Text>
      <Text>Phone: {item.phone}</Text>
      <Text>Score: {Math.round(item.score).toString()}</Text>
    </TouchableOpacity>
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
        keyExtractor={(item) => item.id.toString()} // Ensure each key is unique
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
  errorText: {
    color: 'red',
    marginBottom: 20,
  },
});

export default JobApplicantsScreen;
