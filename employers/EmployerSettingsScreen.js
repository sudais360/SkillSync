import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Button, ScrollView } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const EmployerSettingsScreen = ({ route }) => {
  const { employerId } = route.params;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    companyAddress: '',
  });

  useEffect(() => {
    const fetchEmployerData = async () => {
      try {
        console.log(`Fetching data from: ${API_BASE_URL}/get_employer_data?employer_id=${employerId}`);
        const response = await axios.get(`${API_BASE_URL}/get_employer_data?employer_id=${employerId}`);
        if (response.data) {
          setFormData(response.data);
        }
      } catch (error) {
        console.error('Error fetching employer data:', error);
      }
    };

    fetchEmployerData();
  }, [employerId]);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const saveSettings = async () => {
    try {
      console.log(`Saving data to: ${API_BASE_URL}/update_employer_settings with data:`, formData);
      await axios.post(`${API_BASE_URL}/update_employer_settings`, {
        employer_id: employerId,
        ...formData,
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={formData.name}
        onChangeText={(value) => handleInputChange('name', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(value) => handleInputChange('email', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={formData.phone}
        onChangeText={(value) => handleInputChange('phone', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Company Name"
        value={formData.companyName}
        onChangeText={(value) => handleInputChange('companyName', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Company Address"
        value={formData.companyAddress}
        onChangeText={(value) => handleInputChange('companyAddress', value)}
      />
      <Button title="Save Settings" onPress={saveSettings} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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

export default EmployerSettingsScreen;
