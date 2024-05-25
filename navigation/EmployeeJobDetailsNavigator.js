import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmployeeDashboardScreen from '../employees/EmployeeDashboardScreen';
import EmployeeJobDetailsScreen from '../employees/EmployeeJobDetailsScreen';

const Stack = createNativeStackNavigator();

function EmployeeJobDetailsNavigator() {
  return (
    <Stack.Navigator initialRouteName="EmployeeDashboard">
      <Stack.Screen name="EmployeeDashboard" component={EmployeeDashboardScreen} />
      <Stack.Screen name="EmployeeJobDetails" component={EmployeeJobDetailsScreen} />
    </Stack.Navigator>
  );
}

export default EmployeeJobDetailsNavigator;
