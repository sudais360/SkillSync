import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { API_BASE_URL } from '../config';

const SignupScreen = ({ navigation, route }) => {
  const { role } = route.params; // Get the role parameter from the navigation route
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!role) {
      console.error('Role parameter is missing.');
      // Handle the error, for example, by navigating to a default screen
      navigation.navigate('RoleSelection'); // Adjust the route name as per your setup
    }
  }, [role]);

  const handleSignup = () => {
    // Include role in the signup data
    fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role, // Include the role in the signup data
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === "User created successfully") {
          navigation.navigate('Login', { role });
        } else {
          throw new Error(data.message || 'Failed to sign up');
        }
      })
      .catch(error => {
        console.error('Error signing up:', error);
        Alert.alert('Error', error.message);
      });
  };

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
