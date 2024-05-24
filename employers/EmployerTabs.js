import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Importing Screens
import EmployerDashboardScreen from '../employers/EmployerDashboardScreen';
import EmployerJobPostingScreen from '../employers/EmployerJobPostingScreen';
import EmployerCandidatesScreen from '../employers/EmployerCandidatesScreen';
import EmployerMeetingsScreen from '../employers/EmployerMeetingsScreen';
import EmployerSettingsScreen from '../employers/EmployerSettingsScreen';

const Tab = createBottomTabNavigator();

const EmployerTabs = ({ route }) => {
  const { employerId } = route.params;
  console.log("EmployerTabs - employerId:", employerId); // Add logging

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'EmployerDashboard') {
            iconName = 'view-dashboard';
          } else if (route.name === 'EmployerJobPosting') {
            iconName = 'file-document';
          } else if (route.name === 'EmployerCandidates') {
            iconName = 'account-group';
          } else if (route.name === 'EmployerMeetings') {
            iconName = 'calendar';
          } else if (route.name === 'EmployerSettings') {
            iconName = 'cog';
          }

          return <MaterialCommunityIcons name={iconName} color={color} size={size} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="EmployerDashboard" component={EmployerDashboardScreen} initialParams={{ employerId }} />
      <Tab.Screen name="EmployerJobPosting" component={EmployerJobPostingScreen} initialParams={{ employerId }} />
      <Tab.Screen name="EmployerCandidates" component={EmployerCandidatesScreen} initialParams={{ employerId }} />
      <Tab.Screen name="EmployerMeetings" component={EmployerMeetingsScreen} initialParams={{ employerId }} />
      <Tab.Screen name="EmployerSettings" component={EmployerSettingsScreen} initialParams={{ employerId }} />
    </Tab.Navigator>
  );
};

export default EmployerTabs;
