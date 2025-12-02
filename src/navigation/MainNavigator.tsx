import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import SplashScreen from '../screens/SplashScreen/splashScreen';
import LoginScreen from '../screens/LoginScreen/loginScreen';
import RegisterScreen from '../screens/RegisterScreen/registerScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen/ForgotPasswordScreen';
import Home from '../screens/Home/home';
import RoleScreen from '../screens/Role/Role';
// import ResourcesScreen from '../screens/Resources/Resource';

const Stack = createStackNavigator<RootStackParamList>();

const MainNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="RolesPermissionsScreen" component={RoleScreen} />
      {/* <Stack.Screen name="ResourcesScreen" component={ResourcesScreen} /> */}
    </Stack.Navigator>
  );
};

export default MainNavigator;
