// In SignupScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet,Text } from 'react-native';

const SignupScreen = ({ navigation, route }) => {
  const { role } = route.params; // Get the role parameter from the navigation route
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => {
    // Make API call to sign up the user
    const role = route.params?.role;
    if (!role) {
      console.error('Role parameter is missing.');
      // Handle the error, for example, by navigating to a default screen
      return;
    }


    // Include role in the signup data
    fetch('http://192.168.1.17:5000/signup', {
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
    .then(response => {
      if (response.ok) {
        navigation.navigate('Login');
      } else {
        throw new Error('Failed to sign up');
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
});

export default SignupScreen;
