import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importing Tab Navigator
import EmployerTabs from '../employers/EmployerTabs';
import JobDetailsScreen from '../employers/JobDetailsScreen';

const Stack = createNativeStackNavigator();

const EmployerStack = ({ route }) => {
  const { employerId } = route.params;
  
  return (
    <Stack.Navigator>
      <Stack.Screen name="EmployerTabs" component={EmployerTabs} initialParams={{ employerId }} options={{ headerShown: false }} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
    </Stack.Navigator>
  );
};

export default EmployerStack;
