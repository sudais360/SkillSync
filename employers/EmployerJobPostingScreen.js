import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

const EmployerJobPostingScreen = ({ navigation }) => {
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [scope, setScope] = useState('');
  const [expectations, setExpectations] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  const scrollViewRef = useRef();

  const handlePostJob = async () => {
    try {
      const jobDetails = {
        // employerId,
        position,
        salary,
        scope,
        expectations,
        skills: selectedSkills,
        timestamp: new Date().toISOString(),
      };

      // Make a POST request to your backend API to save the job details
      const response = await axios.post('http://192.168.1.17:5000/jobpostings', jobDetails);

      console.log('Job posted successfully:', response.data);

      // Navigate to the employer dashboard after posting the job
      navigation.navigate('EmployerDashboard', { recentlyAddedJob: jobDetails });
    } catch (error) {
      console.error('Error posting job:', error);
      // Handle error appropriately, such as showing an error message to the user
    }
  };

  const handleSelectSkill = (index, value) => {
    if (!selectedSkills.includes(value)) {
      setSelectedSkills([...selectedSkills, value]);
      // Scroll to top when a skill is selected
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const handleRemoveSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  return (
    <ScrollView contentContainerStyle={styles.container} ref={scrollViewRef}>
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
      <View style={styles.skillContainer}>
        <Text style={styles.skillLabel}>Skills:</Text>
        <ModalDropdown
          style={styles.skillPicker}
          options={['Python', 'SQL', 'Data Visualization', 'R', 'Microsoft', 'Data Cleaning']}
          defaultValue="Select skills"
          onSelect={handleSelectSkill}
        />
      </View>
      <View style={styles.selectedSkillsContainer}>
        {selectedSkills.map((skill, index) => (
          <View key={index} style={styles.selectedSkillItem}>
            <Text>{skill}</Text>
            <TouchableOpacity onPress={() => handleRemoveSkill(skill)}>
              <MaterialIcons name="close" size={16} color="#FF5733" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <Button title="Post Job" onPress={handlePostJob} />
      {/* Saved jobs */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  skillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillLabel: {
    marginRight: 10,
  },
  skillPicker: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  selectedSkillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  selectedSkillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
});

export default EmployerJobPostingScreen;
