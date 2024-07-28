import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Button, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const EmployeeSettingsScreen = ({ route }) => {
  const { employeeId } = route.params;
  const [resume, setResume] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    currentJobTitle: '',
    skills: '',
    experience: '',
    location: '',
  });

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/get_employee_data?user_id=${employeeId}`);
        if (response.data) {
          setFormData(response.data);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeData();
  }, [employeeId]);

  const pickAndUploadDocument = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({});
      console.log("Document selected:", result); // Logging the selected document

      if (!result.canceled) {
        const selectedFile = result.assets[0];
        setResume(selectedFile);
        await uploadResume(selectedFile);
      } else {
        console.log("Document selection was cancelled");
      }
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };

  const uploadResume = async (file) => {
    const formData = new FormData();
    formData.append('resume', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/pdf', // Default to 'application/pdf' if mimeType is undefined
    });
    formData.append('user_id', employeeId);

    try {
      console.log("Uploading resume with data:", formData);
      const response = await axios.post(`${API_BASE_URL}/upload_resume`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Resume upload response:", response.data);
      alert('Resume uploaded successfully!');
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to upload resume. Please try again.');
    }
  };

  const extractResumeData = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/extract_resume_data`, { user_id: employeeId });
      if (response.data) {
        setFormData(response.data);
      }
    } catch (error) {
      console.error('Error extracting resume data:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const saveSettings = async () => {
    try {
      await axios.post(`${API_BASE_URL}/update_employee_settings`, {
        user_id: employeeId,
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
      <TouchableOpacity onPress={pickAndUploadDocument} style={styles.button}>
        <Text style={styles.buttonText}>Select and Upload Resume</Text>
      </TouchableOpacity>
      {resume && <Text style={styles.resumeText}>{resume.name}</Text>}
      <TouchableOpacity onPress={extractResumeData} style={styles.button}>
        <Text style={styles.buttonText}>Extract Resume Data</Text>
      </TouchableOpacity>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone:</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={formData.phone}
          onChangeText={(value) => handleInputChange('phone', value)}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={formData.address}
          onChangeText={(value) => handleInputChange('address', value)}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Current Job Title:</Text>
        <TextInput
          style={styles.input}
          placeholder="Current Job Title"
          value={formData.currentJobTitle}
          onChangeText={(value) => handleInputChange('currentJobTitle', value)}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Skills:</Text>
        <TextInput
          style={styles.input}
          placeholder="Skills"
          value={formData.skills}
          onChangeText={(value) => handleInputChange('skills', value)}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Experience:</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Experience"
          value={formData.experience}
          onChangeText={(value) => handleInputChange('experience', value)}
          multiline
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Location:</Text>
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={formData.location}
          onChangeText={(value) => handleInputChange('location', value)}
        />
      </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'tomato',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  resumeText: {
    fontSize: 16,
    marginVertical: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
});

export default EmployeeSettingsScreen;
