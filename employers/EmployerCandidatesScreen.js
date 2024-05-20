import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmployerCandidatesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Candidates</Text>
      {/* Add components to list and review candidates */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default EmployerCandidatesScreen;
