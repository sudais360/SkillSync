import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmployerDashboardScreen from '../employers/EmployerDashboardScreen';
import JobDetailsScreen from '../employers/JobDetailsScreen';

const Stack = createNativeStackNavigator();

function JobDetailsNavigator() {
  return (
    <Stack.Navigator initialRouteName="EmployerDashboard">
      <Stack.Screen name="EmployerDashboard" component={EmployerDashboardScreen} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
    </Stack.Navigator>
  );
}

export default JobDetailsNavigator;
