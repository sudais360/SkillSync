import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';

// RoleSelectionScreen Component
const RoleSelectionScreen = ({ navigation }) => {

  // Function to navigate to the Login screen with the selected role
  const navigateToLogin = (role) => {
    navigation.navigate('Login', { role });  // Navigate to the Login screen, passing the role parameter
  };

  // Render UI
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cutoutContainer}>
        {/* Ensure the image path is correct */}
        <Image source={require('../Images/Logo/skillSyncLogo.png')} style={styles.logo} />
        
        {/* Correctly render all text within <Text> components */}
        <Text style={styles.title}>Select Your Role</Text>
        
        {/* Button for selecting 'employee' role */}
        <TouchableOpacity style={styles.button} onPress={() => navigateToLogin('employee')}>
          <Text style={styles.buttonText}>Sign up/Login as Employee</Text>
        </TouchableOpacity>
        
        {/* Button for selecting 'employer' role */}
        <TouchableOpacity style={styles.button} onPress={() => navigateToLogin('employer')}>
          <Text style={styles.buttonText}>Sign up/Login as Employer</Text>
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
  cutoutContainer: {
    width: '90%',
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
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    width: '80%',
    padding: 15,
    backgroundColor: 'tomato',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RoleSelectionScreen;
