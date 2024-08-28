import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import MultiSelect from 'react-native-multiple-select'; // Correct import
import { API_BASE_URL } from '../config';

const EmployerJobPostingScreen = ({ route, navigation }) => {
  const { employerId } = route.params;
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [scope, setScope] = useState('');
  const [expectations, setExpectations] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skills] = useState([
    { id: 'Python', name: 'Python' },
    { id: 'SQL', name: 'SQL' },
    { id: 'Data Visualization', name: 'Data Visualization' },
    { id: 'R', name: 'R' },
    { id: 'Microsoft', name: 'Microsoft' },
    { id: 'Data Cleaning', name: 'Data Cleaning' },
    { id: 'Java', name: 'Java' },
    { id: 'JavaScript', name: 'JavaScript' },
    { id: 'C#', name: 'C#' },
    { id: 'C++', name: 'C++' },
    // Add more skills here or load them from a CSV
  ]);

  const handlePostJob = async () => {
    try {
      const jobDetails = {
        employer_id: employerId,
        position,
        salary,
        scope,
        expectations,
        skills: selectedSkills,
        timestamp: new Date().toISOString(),
      };

      // Check if any required field is empty
      for (const key in jobDetails) {
        if (!jobDetails[key] || (Array.isArray(jobDetails[key]) && jobDetails[key].length === 0)) {
          console.error('Missing required fields.');
          return;
        }
      }

      // Make a POST request to your backend API to save the job details
      const response = await axios.post(`${API_BASE_URL}/jobpostings`, jobDetails);

      console.log('Job posted successfully:', response.data);

      // Navigate to the employer dashboard after posting the job
      navigation.navigate('EmployerDashboard', { recentlyAddedJob: jobDetails });
    } catch (error) {
      console.error('Error posting job:', error);
      // Handle error appropriately, such as showing an error message to the user
    }
  };

  const handleRemoveSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const renderSelectedSkill = ({ item }) => (
    <View style={styles.selectedSkill}>
      <Text>{item}</Text>
      <TouchableOpacity onPress={() => handleRemoveSkill(item)}>
        <Text style={styles.removeSkillText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={[]}
      ListHeaderComponent={
        <View style={styles.container}>
          <Text>Employer ID: {employerId}</Text>
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
          <Text style={styles.skillLabel}>Skills:</Text>
          <MultiSelect
            items={skills}
            uniqueKey="id"
            onSelectedItemsChange={setSelectedSkills}
            selectedItems={selectedSkills}
            selectText="Select skills"
            searchInputPlaceholderText="Search skills..."
            onChangeInput={(text) => console.log(text)}
            tagRemoveIconColor="#CCC"
            tagBorderColor="#CCC"
            tagTextColor="#CCC"
            selectedItemTextColor="#CCC"
            selectedItemIconColor="#CCC"
            itemTextColor="#000"
            displayKey="name"
            searchInputStyle={{ color: '#CCC' }}
            submitButtonColor="#48d22b"
            submitButtonText="Submit"
            styleDropdownMenuSubsection={styles.dropdown}
          />
          <FlatList
            data={selectedSkills}
            keyExtractor={(item) => item}
            renderItem={renderSelectedSkill}
            horizontal={true}
            style={styles.selectedSkillsContainer}
          />
          <Button title="Post Job" onPress={handlePostJob} />
        </View>
      }
      keyExtractor={(item, index) => index.toString()}
      renderItem={null}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  skillLabel: {
    marginVertical: 10,
    fontWeight: 'bold',
  },
  dropdown: {
    borderColor: '#ccc',
    borderRadius: 5,
  },
  selectedSkillsContainer: {
    marginBottom: 20,
  },
  selectedSkill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  removeSkillText: {
    color: 'red',
    marginLeft: 10,
  },
});

export default EmployerJobPostingScreen;
