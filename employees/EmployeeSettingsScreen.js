import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';

const EmployeeSettingsScreen = ({ route }) => {
  const { employeeId } = route.params;
  const [resume, setResume] = useState(null);
  const [resumeURL, setResumeURL] = useState('');

  useEffect(() => {
    const fetchResumeURL = async () => {
      try {
        const response = await axios.get(`http://192.168.1.17:5000/get_resume_url?user_id=${employeeId}`);
        if (response.data.resume_url) {
          setResumeURL(response.data.resume_url);
        }
      } catch (error) {
        console.error('Error fetching resume URL:', error);
      }
    };

    fetchResumeURL();
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
      const response = await axios.post('http://192.168.1.17:5000/upload_resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Resume upload response:", response.data);
      alert('Resume uploaded successfully!');
      const sas_response = await axios.get(`http://192.168.1.17:5000/get_resume_url?user_id=${employeeId}`);
      if (sas_response.data.resume_url) {
        setResumeURL(sas_response.data.resume_url);
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to upload resume. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <TouchableOpacity onPress={pickAndUploadDocument} style={styles.button}>
        <Text style={styles.buttonText}>Select and Upload Resume</Text>
      </TouchableOpacity>
      {resume && <Text>{resume.name}</Text>}
      {resumeURL ? (
        <TouchableOpacity onPress={() => Linking.openURL(resumeURL)} style={styles.linkButton}>
          <Text style={styles.linkButtonText}>View Uploaded Resume</Text>
        </TouchableOpacity>
      ) : (
        <Text>No resume uploaded</Text>
      )}
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
  button: {
    backgroundColor: 'tomato',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
  linkButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'lightblue',
    alignItems: 'center',
  },
  linkButtonText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default EmployeeSettingsScreen;
