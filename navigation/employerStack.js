import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importing Tab Navigator
import EmployerTabs from '../employers/EmployerTabs';

const Stack = createNativeStackNavigator();

const EmployerStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="EmployerTabs" component={EmployerTabs} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default EmployerStack;
