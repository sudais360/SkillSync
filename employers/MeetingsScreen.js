import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MeetingsScreen = () => {
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

export default MeetingsScreen;
