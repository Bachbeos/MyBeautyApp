import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import SplashScreen from "../screens/SplashScreen/splashScreen";
import LoginScreen from "../screens/LoginScreen/loginScreen";
import RegisterScreen from "../screens/RegisterScreen/registerScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen/ForgotPasswordScreen";
import Home from "../screens/Home/home";
import RoleScreen from "../screens/Role/Role";
import ResourcesScreen from "../screens/Resources/Resource";
import PermissionScreen from "../screens/Permission/Permission";
import BranchScreen from "../screens/BranchScreen/Branch";
import UserScreen from "../screens/UserScreen/User";
import CustomerSourceScreen from "../screens/CustomerSource/CustomerSource";
import VoucherScreen from "../screens/Voucher/Voucher";
import UnitScreen from "../screens/Unit/Unit";
import CategoryScreen from "../screens/CategoryScreen/Category";
import ProductScreen from "../screens/ProductScreen/Product";
import ServiceScreen from "../screens/ServiceScreen/Service";
import InvoiceScreen from "../screens/InvoiceScreen/Invoice";
import CustomerSettingsScreen from "../screens/CustomerSettingsScreen/CustomerSettings";
import CustomerScreen from "../screens/CustomerScreen/Customer";
import CallHistoryScreen from "../screens/CallHistoryScreen/HistoryCall";
import ProfileScreen from "../screens/ProfileScreen/Profile";
import CalendarScreen from "../screens/CalendarScreen/Calendar";
import LeadReportScreen from "../screens/LeadReportScreen/LeadReport";

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
      <Stack.Screen name="ResourcesScreen" component={ResourcesScreen} />
      <Stack.Screen name="Permission" component={PermissionScreen} />
      <Stack.Screen name="BranchScreen" component={BranchScreen} />
      <Stack.Screen name="ManagerUsersScreen" component={UserScreen} />
      <Stack.Screen name="CustomerSourceScreen" component={CustomerSourceScreen} />
      <Stack.Screen name="VoucherScreen" component={VoucherScreen} />
      <Stack.Screen name="UnitScreen" component={UnitScreen} />
      <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
      <Stack.Screen name="ProductScreen" component={ProductScreen} />
      <Stack.Screen name="ServiceScreen" component={ServiceScreen} />
      <Stack.Screen name="InvoiceScreen" component={InvoiceScreen} />
      <Stack.Screen name="CustomerSettingsScreen" component={CustomerSettingsScreen} />
      <Stack.Screen name="CustomersScreen" component={CustomerScreen} />
      <Stack.Screen name="CallHistoryScreen" component={CallHistoryScreen} />
      <Stack.Screen name="ProfileSettingsScreen" component={ProfileScreen} />
      <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
      <Stack.Screen name="LeadReportScreen" component={LeadReportScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
