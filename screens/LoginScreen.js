// import React, { useState } from 'react';
// import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
// import axios from 'axios';
// const LoginScreen = ({ route, navigation }) => {
//   const { role } = route.params;
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleLogin = () => {
//     fetch('http://192.168.1.17:5000/login', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email, password, role }), // Make sure 'role' is correctly passed
//     })
//     .then(response => response.json())
//     .then(data => {
//       if (data.message === 'Invalid email or password') {
//         alert(data.message);
//       } else {
//         if (role === 'employer') {
//           navigation.navigate('EmployerStack'); // Navigate to employer dashboard
//         } else {
//           navigation.navigate('EmployeeStack'); // Navigate to employee dashboard
//         }
//       }
//     })
//     .catch(error => {
//       console.error('Error:', error);
//       alert('Network request failed');
//     });
//   };
  

//   const handleSignUp = () => {
//     navigation.navigate('Signup', { role });
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.roleText}>Role: {role}</Text>
//       <TextInput
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         style={styles.input}
//       />
//       <TextInput
//         placeholder="Password"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//         style={styles.input}
//       />
//       <Button title="Login" onPress={handleLogin} />
//       <Button title="Sign Up" onPress={handleSignUp} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   roleText: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   input: {
//     width: 200,
//     height: 40,
//     borderWidth: 1,
//     marginBottom: 10,
//     padding: 5,
//   },
// });

// export default LoginScreen;

import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import axios from 'axios';

const LoginScreen = ({ route, navigation }) => {
  const { role } = route.params;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    fetch('http://192.168.1.17:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role }), // Make sure 'role' is correctly passed
    })
    .then(response => response.json())
    .then(data => {
      if (data.message === 'Invalid email or password') {
        alert(data.message);
      } else {
        if (role === 'employer') {
          navigation.navigate('EmployerStack', { screen: 'EmployerJobPostingScreen', params: { employerId: data.user_id }});
        } else {
          navigation.navigate('EmployeeStack'); // Navigate to employee dashboard
        }
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Network request failed');
    });
  };
  
  

  const handleSignUp = () => {
    navigation.navigate('Signup', { role });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.roleText}>Role: {role}</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: 200,
    height: 40,
    borderWidth: 1,
    marginBottom: 10,
    padding: 5,
  },
});

export default LoginScreen;
