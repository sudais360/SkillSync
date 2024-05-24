import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import axios from 'axios';

const EmployerJobPostingScreen = ({ route, navigation }) => {
  const { employerId } = route.params; // Receive employerId from route params
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [scope, setScope] = useState('');
  const [expectations, setExpectations] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skills] = useState(['Python', 'SQL', 'Data Visualization', 'R', 'Microsoft', 'Data Cleaning', 'Java', 'JavaScript', 'C#', 'C++']);

  const scrollViewRef = useRef();

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
      const response = await axios.post('http://192.168.1.17:5000/jobpostings', jobDetails);

      console.log('Job posted successfully:', response.data);

      // Navigate to the employer dashboard after posting the job
      navigation.navigate('EmployerDashboard', { recentlyAddedJob: jobDetails });
    } catch (error) {
      console.error('Error posting job:', error);
      // Handle error appropriately, such as showing an error message to the user
    }
  };

  const toggleSkillSelection = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const renderSkillItem = ({ item }) => (
    <TouchableOpacity style={styles.skillItem} onPress={() => toggleSkillSelection(item)}>
      <View style={styles.checkbox}>
        {selectedSkills.includes(item) && <View style={styles.checkboxInner} />}
      </View>
      <Text>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container} ref={scrollViewRef}>
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
      <FlatList
        data={skills}
        keyExtractor={(item) => item}
        renderItem={renderSkillItem}
        scrollEnabled={false}
      />
      <Button title="Post Job" onPress={handlePostJob} />
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
  skillLabel: {
    marginVertical: 10,
    fontWeight: 'bold',
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 14,
    height: 14,
    backgroundColor: '#000',
  },
});

export default EmployerJobPostingScreen;
