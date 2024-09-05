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
    <Stack.Navigator
      initialRouteName="EmployerDashboard"
      screenOptions={{
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="EmployerDashboard"
        component={EmployerDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name="JobDetails"
        component={JobDetailsScreen}
        options={({ route }) => ({
          title: `Job Details: ${route.params?.jobTitle || 'Job'}`, // Customize based on job title
        })}
      />
      <Stack.Screen
        name="JobApplicants"
        component={JobApplicantsScreen}
        options={({ route }) => ({
          title: `Applicants for: ${route.params?.jobTitle || 'Job'}`, // Display job title in the header
        })}
      />
      <Stack.Screen
        name="ApplicantDetails"
        component={ApplicantDetailsScreen}
        options={{ title: 'Applicant Details' }}
      />

      <Stack.Screen
        name="SharedJobDetails"
        component={SharedJobDetailsScreen}
        options={{ title: 'Shared Job Details' }}
      />
    </Stack.Navigator>
  );
}

export default JobDetailsNavigator;
