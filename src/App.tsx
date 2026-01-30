import React, { useState } from "react";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ToastProvider } from "expo-toast";
import { Provider } from "react-redux";
import MainNavigator from "./navigation/MainNavigator";
import { SidebarProvider } from "./components/Sidebar/SidebarContext";
import SidebarDrawer from "./components/Sidebar/SidebarDrawer";
import { store } from "./store";

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const [currentRouteName, setCurrentRouteName] = useState<string | undefined>();

  const updateRouteName = () => {
    const route = navigationRef.getCurrentRoute();
    setCurrentRouteName(route?.name);
  };

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <ToastProvider>
          <SidebarProvider>
            <NavigationContainer ref={navigationRef} onReady={updateRouteName} onStateChange={updateRouteName}>
              <MainNavigator />
              <SidebarDrawer currentRouteName={currentRouteName} />
            </NavigationContainer>
          </SidebarProvider>
        </ToastProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
