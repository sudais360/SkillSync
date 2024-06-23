import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importing Tab Navigator
import EmployeeTabs from '../employees/EmployeeTabs';
import EmployeeJobDetailsScreen from '../employees/EmployeeJobDetailsScreen';

const Stack = createNativeStackNavigator();

const EmployeeStack = ({ route }) => {
  const { employeeId } = route.params;
  
  return (
    <Stack.Navigator>
      <Stack.Screen name="EmployeeTabs" component={EmployeeTabs} initialParams={{ employeeId }} options={{ headerShown: false }} />
      <Stack.Screen name="EmployeeJobDetails" component={EmployeeJobDetailsScreen}initialParams={{ employeeId }} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default EmployeeStack;
