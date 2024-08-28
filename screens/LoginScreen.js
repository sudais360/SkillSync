import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

// Define the LoginScreen component
const LoginScreen = ({ route, navigation }) => {
  // Extract the 'role' parameter from the route params
  const { role } = route.params;

  // Initialize state variables for email and password with preset values for demonstration
  const [email, setEmail] = useState('Test@gmail.com');
  const [password, setPassword] = useState('Test');

  // Function to handle the login process
  const handleLogin = () => {
    // Check if both email and password are provided
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    // Make a POST request to the login API endpoint
    fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role }), // Send email, password, and role in the request body
    })
    .then(response => response.json())
    .then(data => {
      // Check the response from the server
      if (data.message === 'Invalid email or password') {
        // Show an alert if the login credentials are incorrect
        Alert.alert('Error', data.message);
      } else {
        // Navigate to different screens based on the user role
        if (role === 'employer') {
          navigation.navigate('EmployerStack', { employerId: data.user_id });
        } else {
          navigation.navigate('EmployeeStack', { employeeId: data.user_id });
        }
      }
    })
    .catch(error => {
      // Log the error and show an alert in case of a network failure
      console.error('Error:', error);
      Alert.alert('Error', 'Network request failed');
    });
  };

  // Function to navigate to the Signup screen
  const handleSignUp = () => {
    navigation.navigate('Signup', { role });
  };

  // Render the LoginScreen component
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.bannerText}>Welcome to SkillSync</Text>
      <View style={styles.cutoutContainer}>
        <Image source={require('../Images/Logo/skillSyncLogo.png')} style={styles.logo} />
        <Text style={styles.roleText}>Role: {role}</Text>
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
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Define styles for the component
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
  roleText: {
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
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: 'tomato',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
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

export default LoginScreen;
