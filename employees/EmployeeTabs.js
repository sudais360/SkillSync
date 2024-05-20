import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Importing Screens
import EmployeeDashboardScreen from '../employees/EmployeeDashboardScreen';
import EmployeeAppliedJobsScreen from '../employees/EmployeeAppliedJobsScreen';
import EmployeeSkillAssessmentScreen from '../employees/EmployeeSkillAssessmentScreen';
import EmployeeSettingsScreen from '../employees/EmployeeSettingsScreen';

const Tab = createBottomTabNavigator();

const EmployeeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'EmployeeDashboard') {
            iconName = 'view-dashboard';
          } else if (route.name === 'EmployeeAppliedJobs') {
            iconName = 'file-document';
          } else if (route.name === 'EmployeeSkillAssessment') {
            iconName = 'pencil';
          } else if (route.name === 'EmployeeSettings') {
            iconName = 'cog';
          }

          return <MaterialCommunityIcons name={iconName} color={color} size={size} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="EmployeeDashboard" component={EmployeeDashboardScreen} />
      <Tab.Screen name="EmployeeAppliedJobs" component={EmployeeAppliedJobsScreen} />
      <Tab.Screen name="EmployeeSkillAssessment" component={EmployeeSkillAssessmentScreen} />
      <Tab.Screen name="EmployeeSettings" component={EmployeeSettingsScreen} />
    </Tab.Navigator>
  );
};

export default EmployeeTabs;
