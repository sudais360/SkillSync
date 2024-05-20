import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SkillAssessmentScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Skill Assessment/Career Resources</Text>
      {/* Add your skill assessment content here */}
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

export default SkillAssessmentScreen;
