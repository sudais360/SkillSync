import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmployeeDashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Employee Dashboard</Text>
      {/* Add your dashboard content here */}
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

export default EmployeeDashboardScreen;
