import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
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
      });
  };

  return (
    <View style={styles.container}>
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
      <Button title="Sign up" onPress={handleSignup} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  userTypeText: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default SignupScreen;
