import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importing Tab Navigator
import EmployeeTabs from '../employees/EmployeeTabs';

const Stack = createNativeStackNavigator();

const EmployeeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="EmployeeTabs" component={EmployeeTabs} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default EmployeeStack;
