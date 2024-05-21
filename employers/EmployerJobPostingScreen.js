import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';

const EmployerJobPostingScreen = ({ navigation }) => {
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [scope, setScope] = useState('');
  const [expectations, setExpectations] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  const saveJob = () => {
    const jobDetails = {
      position,
      salary,
      scope,
      expectations,
      skills: selectedSkills,
      timestamp: new Date().toISOString(),
    };
    setSavedJobs([...savedJobs, jobDetails]);
    // Code to save job details to the database
    // You can send a request to your backend API here
  };

  const handleSelectSkill = (index, value) => {
    if (!selectedSkills.includes(value)) {
      setSelectedSkills([...selectedSkills, value]);
    }
  };

  const handlePostJob = () => {
    const jobDetails = {
      position,
      salary,
      scope,
      expectations,
      skills: selectedSkills,
      timestamp: new Date().toISOString(),
    };
    console.log(jobDetails); // Log job details before posting
    navigation.navigate('EmployerDashboard', { recentlyAddedJob: jobDetails });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
          options={['Python', 'SQL', 'Data Visualization']}
          defaultValue="Select skills"
          onSelect={handleSelectSkill}
        />
      </View>
      <View style={styles.selectedSkillsContainer}>
        {selectedSkills.map((skill, index) => (
          <View key={index} style={styles.selectedSkillItem}>
            <Text>{skill}</Text>
            <Button title="Remove" onPress={() => setSelectedSkills(selectedSkills.filter((s) => s !== skill))} />
          </View>
        ))}
      </View>
      <Button title="Save Job" onPress={saveJob} />
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
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
});

export default EmployerJobPostingScreen;
