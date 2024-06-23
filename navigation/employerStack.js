import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import EmployerTabs from '../employers/EmployerTabs';
import JobDetailsNavigator from './jobdetailsnavigator'; 

const Stack = createNativeStackNavigator();

const EmployerStack = ({ route }) => {
  const { employerId } = route.params;

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="EmployerTabs" 
        component={EmployerTabs} 
        initialParams={{ employerId }} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="JobDetailsNavigator" 
        component={JobDetailsNavigator} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
};

export default EmployerStack;
