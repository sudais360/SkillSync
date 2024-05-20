import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const JobPostingScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Job Posting Screen</Text>
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

export default JobPostingScreen;
