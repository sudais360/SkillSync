import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmployerMeetingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Meetings Screen</Text>
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

export default EmployerMeetingsScreen;
