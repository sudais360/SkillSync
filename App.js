import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Importing Screens
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './employers/DashboardScreen';
import JobPostingScreen from './employers/JobPostingScreen';
import CandidatesScreen from './employers/CandidatesScreen';
import MeetingsScreen from './employers/MeetingsScreen';
import SettingsScreen from './employers/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'view-dashboard';
          } else if (route.name === 'JobPosting') {
            iconName = 'file-document';
          } else if (route.name === 'Candidates') {
            iconName = 'account-group';
          } else if (route.name === 'Meetings') {
            iconName = 'calendar';
          } else if (route.name === 'Settings') {
            iconName = 'cog';
          }

          return <MaterialCommunityIcons name={iconName} color={color} size={size} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="JobPosting" component={JobPostingScreen} />
      <Tab.Screen name="Candidates" component={CandidatesScreen} />
      <Tab.Screen name="Meetings" component={MeetingsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="RoleSelection">
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
