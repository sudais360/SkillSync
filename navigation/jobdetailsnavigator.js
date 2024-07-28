import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmployerDashboardScreen from '../employers/EmployerDashboardScreen';
import JobDetailsScreen from '../employers/JobDetailsScreen';
import JobApplicantsScreen from '../employers/JobApplicantsScreen'; 
import ApplicantDetailsScreen from '../employers/ApplicantDetailsScreen';
import SharedJobDetailsScreen from '../employers/SharedJobDetailsScreen'; // Ensure this is the correct path

const Stack = createNativeStackNavigator();

function JobDetailsNavigator() {
  return (
    <Stack.Navigator initialRouteName="EmployerDashboard">
      <Stack.Screen name="EmployerDashboard" component={EmployerDashboardScreen} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
      <Stack.Screen name="JobApplicants" component={JobApplicantsScreen} />
      <Stack.Screen name="ApplicantDetails" component={ApplicantDetailsScreen} />
      <Stack.Screen name="SharedJobDetails" component={SharedJobDetailsScreen} />
    </Stack.Navigator>
  );
}

export default JobDetailsNavigator;
