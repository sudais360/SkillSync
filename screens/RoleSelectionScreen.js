import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

const RoleSelectionScreen = ({ navigation }) => {
  console.log("Navigating to RoleSelectionScreen"); // Example log statement

  const navigateToLogin = (role) => {
    console.log("Navigating to Login screen with role:", role);
    navigation.navigate('Login', { role });
  };

  return (
    <View style={styles.container}>
      <Button title="Sign up/Login as Employee" onPress={() => navigateToLogin('employee')} />
      <Button title="Sign up/Login as Employer" onPress={() => navigateToLogin('employer')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RoleSelectionScreen;
