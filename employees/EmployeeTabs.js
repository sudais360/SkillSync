import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Importing Screens
import EmployeeDashboardScreen from '../employees/EmployeeDashboardScreen';
import EmployeeAppliedJobsScreen from '../employees/EmployeeAppliedJobsScreen';
import EmployeeSavedJobsScreen from '../employees/EmployeeSavedJobsScreen';
import EmployeeSkillAssessmentScreen from '../employees/EmployeeSkillAssessmentScreen';
import EmployeeSettingsScreen from '../employees/EmployeeSettingsScreen';

const Tab = createBottomTabNavigator();

const EmployeeTabs = ({ route }) => {
  const { employeeId } = route.params;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'EmployeeDashboard') {
            iconName = 'view-dashboard';
          } else if (route.name === 'EmployeeAppliedJobs') {
            iconName = 'file-document';
          } else if (route.name === 'EmployeeSavedJobs') {
            iconName = 'bookmark';
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
      <Tab.Screen name="EmployeeDashboard" component={EmployeeDashboardScreen} initialParams={{ employeeId }} />
      <Tab.Screen name="EmployeeAppliedJobs" component={EmployeeAppliedJobsScreen} initialParams={{ employeeId }} />
      <Tab.Screen name="EmployeeSavedJobs" component={EmployeeSavedJobsScreen} />
      <Tab.Screen name="EmployeeSkillAssessment" component={EmployeeSkillAssessmentScreen} initialParams={{ employeeId }} />
      <Tab.Screen name="EmployeeSettings" component={EmployeeSettingsScreen} initialParams={{ employeeId }} />
    </Tab.Navigator>
  );
};

export default EmployeeTabs;
