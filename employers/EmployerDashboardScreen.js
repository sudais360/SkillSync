import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmployerDashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Dashboard Screen</Text>
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

export default EmployerDashboardScreen;
