import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AppliedJobsScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Applied Jobs/Positions</Text>
      {/* Add your applied jobs content here */}
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

export default AppliedJobsScreen;
