import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Linking, Button, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';

const EmployeeSettingsScreen = ({ route }) => {
  const { employeeId } = route.params;
  const [resume, setResume] = useState(null);
  const [resumeURL, setResumeURL] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    currentJobTitle: '',
    skills: '',
    experience: '',
  });

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
        // await extractResumeData(file.uri);
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to upload resume. Please try again.');
    }
  };

  // const extractResumeData = async (fileUri) => {
  //   try {
  //     const response = await axios.post('http://192.168.1.17:5000/extract_resume_data', { uri: fileUri });
  //     if (response.data) {
  //       setFormData(response.data);
  //     }
  //   } catch (error) {
  //     console.error('Error extracting resume data:', error);
  //   }
  // };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const saveSettings = async () => {
    try {
      await axios.post('http://192.168.1.17:5000/update_employee_settings', {
        employeeId,
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
      {resume && <Text>{resume.name}</Text>}
      {resumeURL ? (
        <TouchableOpacity onPress={() => Linking.openURL(resumeURL)} style={styles.linkButton}>
          <Text style={styles.linkButtonText}>View Uploaded Resume</Text>
        </TouchableOpacity>
      ) : (
        <Text>No resume uploaded</Text>
      )}
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
        placeholder="Address"
        value={formData.address}
        onChangeText={(value) => handleInputChange('address', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Current Job Title"
        value={formData.currentJobTitle}
        onChangeText={(value) => handleInputChange('currentJobTitle', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Skills"
        value={formData.skills}
        onChangeText={(value) => handleInputChange('skills', value)}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Experience"
        value={formData.experience}
        onChangeText={(value) => handleInputChange('experience', value)}
        multiline
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});

export default EmployeeSettingsScreen;













// import React, { useState } from 'react';
// import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
// import * as DocumentPicker from 'expo-document-picker';
// import axios from 'axios';

// const EmployeeSettingsScreen = ({ route }) => {
//   const { employeeId } = route.params;
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [address, setAddress] = useState('');
//   const [currentJobTitle, setCurrentJobTitle] = useState('');
//   const [skills, setSkills] = useState('');
//   const [experience, setExperience] = useState('');
//   const [resumeUri, setResumeUri] = useState('');

//   const handleDocumentPick = async () => {
//     try {
//       let result = await DocumentPicker.getDocumentAsync({});
//       if (result.type === 'success') {
//         console.log('Document selected:', result);
//         setResumeUri(result.uri);
//         const formData = new FormData();
//         formData.append('resume', {
//           uri: result.uri,
//           name: result.name,
//           type: result.mimeType,
//         });
//         formData.append('user_id', employeeId);
//         try {
//           const uploadResponse = await axios.post('http://192.168.1.17:5000/upload_resume', formData, {
//             headers: {
//               'Content-Type': 'multipart/form-data',
//             },
//           });
//           console.log('Resume uploaded:', uploadResponse.data);
//         } catch (error) {
//           console.error('Error uploading resume:', error);
//         }
//       } else {
//         console.log('Document selection was cancelled.');
//       }
//     } catch (error) {
//       console.error('Error picking document:', error);
//     }
//   };

//   /*
//   const handleExtractDetails = async () => {
//     if (!resumeUri) {
//       console.error('No resume URI available. Please select a resume first.');
//       return;
//     }
//     try {
//       const extractResponse = await axios.post('http://192.168.1.17:5000/extract_resume_data', { uri: resumeUri });
//       const data = extractResponse.data;
//       setName(data.name);
//       setEmail(data.email);
//       setPhone(data.phone);
//       setAddress(data.address);
//       setCurrentJobTitle(data.currentJobTitle);
//       setSkills(data.skills);
//       setExperience(data.experience);
//     } catch (error) {
//       console.error('Error extracting resume data:', error);
//     }
//   };
//   */

//   const handleSaveSettings = async () => {
//     try {
//       const response = await axios.post('http://192.168.1.17:5000/update_employee_settings', {
//         employeeId,
//         name,
//         email,
//         phone,
//         address,
//         currentJobTitle,
//         skills,
//         experience,
//       });
//       console.log('Settings updated:', response.data);
//     } catch (error) {
//       console.error('Error updating settings:', error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" />
//       <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" />
//       <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" />
//       <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Address" />
//       <TextInput style={styles.input} value={currentJobTitle} onChangeText={setCurrentJobTitle} placeholder="Current Job Title" />
//       <TextInput style={styles.input} value={skills} onChangeText={setSkills} placeholder="Skills" />
//       <TextInput style={styles.input} value={experience} onChangeText={setExperience} placeholder="Experience" />
//       <Button title="Select Resume" onPress={handleDocumentPick} />
//       {/* <Button title="Extract Details from Resume" onPress={handleExtractDetails} /> */}
//       <Button title="Save Settings" onPress={handleSaveSettings} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 10,
//   },
// });

// export default EmployeeSettingsScreen;
