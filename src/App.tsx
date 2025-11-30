import React, { useState } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import MainNavigator from './navigation/MainNavigator';
import { ToastProvider } from 'expo-toast';
import { SidebarProvider } from './components/Sidebar/SidebarContext';
import SidebarDrawer from './components/Sidebar/SidebarDrawer';

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const [currentRouteName, setCurrentRouteName] = useState<string | undefined>();

  const updateRouteName = () => {
    const route = navigationRef.getCurrentRoute();
    setCurrentRouteName(route?.name);
  };

  return (
    <ToastProvider>
      <SidebarProvider>
        <NavigationContainer ref={navigationRef} onReady={updateRouteName} onStateChange={updateRouteName}>
          <MainNavigator />
          <SidebarDrawer currentRouteName={currentRouteName} />
        </NavigationContainer>
      </SidebarProvider>
    </ToastProvider>
  );
}
