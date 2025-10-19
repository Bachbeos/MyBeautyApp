import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './navigation/MainNavigator';
import { ToastProvider } from 'expo-toast';

export default function App() {
  return (
    <ToastProvider>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </ToastProvider>
  );
}
