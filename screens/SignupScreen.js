import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { API_BASE_URL } from '../config'; // Import the API base URL from the config file


// SignupScreen Component
const SignupScreen = ({ navigation, route }) => {
  const { role } = route.params; // Get the role parameter from the navigation route
  const [name, setName] = useState(''); // State for the user's name
  const [email, setEmail] = useState(''); // State for the user's email
  const [password, setPassword] = useState(''); // State for the user's password

// useEffect hook to check if the role parameter is provided
useEffect(() => {
  if (!role) {
    console.error('Role parameter is missing.'); // Log an error if the role is missing
    // Handle the error, for example, by navigating to a default screen
    navigation.navigate('RoleSelection'); // Adjust the route name as per your setup
  }
}, [role]);

// Function to handle signup
const handleSignup = () => {
  // Include role in the signup data
  fetch(`${API_BASE_URL}/signup`, { // Send a POST request to the signup endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Set the content type to JSON
    },
    body: JSON.stringify({
      name,
      email,
      password,
      role, // Include the role in the signup data
    }),
  })
    .then(response => response.json()) // Convert the response to JSON
    .then(data => {
      if (data.message === "User created successfully") { // Check if the signup was successful
        navigation.navigate('Login', { role }); // Navigate to the Login screen with the role parameter
      } else {
        throw new Error(data.message || 'Failed to sign up'); // Throw an error if signup failed
      }
    })
    .catch(error => {
      console.error('Error signing up:', error); // Log the error
      Alert.alert('Error', error.message); // Show an alert with the error message
    });
};

// Render UI
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.bannerText}>Welcome to SkillSync</Text>
      <View style={styles.cutoutContainer}>
        <Image source={require('../Images/Logo/skillSyncLogo.png')} style={styles.logo} />
        <Text style={styles.userTypeText}>Sign up as {role || 'Unknown'}</Text>
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};


// Styles for the component
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  bannerText: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  cutoutContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logo: {
    width: 400,
    height: 250,
    marginBottom: 20,
  },
  userTypeText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 10,
  },
  signUpButton: {
    width: '100%',
    height: 50,
    backgroundColor: 'tomato',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SignupScreen;
