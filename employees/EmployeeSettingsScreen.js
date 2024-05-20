import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmployeeSettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Employee Settings</Text>
      {/* Add your settings content here */}
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

export default EmployeeSettingsScreen;
