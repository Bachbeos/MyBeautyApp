import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, LayoutAnimation, Platform, UIManager, StyleSheet, ImageSourcePropType } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import styles, { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './Sidebar.styles';

type Logos = {
  logo?: ImageSourcePropType;
  logoSmall?: ImageSourcePropType;
  logoWhite?: ImageSourcePropType;
};

// [QUAN TRỌNG] Thêm currentRouteName vào định nghĩa Props
type Props = {
  logos?: Logos;
  initialCollapsed?: boolean;
  currentRouteName?: string; // <--- Dòng này sửa lỗi IntrinsicAttributes
};

export default function Sidebar({ logos, initialCollapsed = false, currentRouteName }: Props) {
  // enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();

  const [activeTab, setActiveTab] = useState<string>('');
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    settings_general: false,
    system_settings: false,
  });
  const [collapsed, setCollapsed] = useState<boolean>(initialCollapsed);

  // Map tên màn hình (Screen Name) sang key của Sidebar
  const routeNameToTabKey: Record<string, string> = {
    CustomersScreen: 'customers',
    BranchScreen: 'branch',
    ResourcesScreen: 'resources',
    ManagerUsersScreen: 'manager-users',
    RolesPermissionsScreen: 'roles-permissions',
    ProfileSettingsScreen: 'profile-settings',
    CustomerSettingsScreen: 'customer-settings',
    Home: '',
  };

  const submenuParent: Record<string, string | undefined> = {
    'profile-settings': 'settings_general',
    'customer-settings': 'system_settings',
  };

  const menuItems: Array<any> = [
    { type: 'title', label: 'Menu chính' },
    { type: 'title', label: 'CRM' },
    { key: 'customers', label: 'Khách hàng', screen: 'CustomersScreen' },
    { key: 'branch', label: 'Chi nhánh', screen: 'BranchScreen' },
    { type: 'title', label: 'Cài đặt CRM' },
    { key: 'resources', label: 'Tài nguyên', screen: 'ResourcesScreen' },
    { type: 'title', label: 'Quản lý người dùng' },
    { key: 'manager-users', label: 'Danh sách người dùng', screen: 'ManagerUsersScreen' },
    { key: 'roles-permissions', label: 'Vai trò & Phân quyền', screen: 'RolesPermissionsScreen' },
    { type: 'title', label: 'Cài đặt' },
    {
      type: 'submenu',
      key: 'settings_general',
      label: 'Cài đặt chung',
      children: [{ key: 'profile-settings', label: 'Hồ sơ', screen: 'ProfileSettingsScreen' }],
    },
    {
      type: 'submenu',
      key: 'system_settings',
      label: 'Cài đặt hệ thống',
      children: [{ key: 'customer-settings', label: 'Cài đặt khách hàng', screen: 'CustomerSettingsScreen' }],
    },
  ];

  useEffect(() => {
    const routeName = currentRouteName || '';

    const currentTab = routeNameToTabKey[routeName];
    if (currentTab) {
      setActiveTab(currentTab);
      const parent = submenuParent[currentTab];
      if (parent) {
        setOpenSubmenus((prev) => ({ ...prev, [parent]: true }));
      }
    } else {
      setActiveTab('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRouteName]);

  const toggleSubmenu = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTabPress = (tabKey: string, screen?: string) => {
    setActiveTab(tabKey);
    const parent = submenuParent[tabKey];
    if (parent) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setOpenSubmenus((prev) => ({ ...prev, [parent]: true }));
    }
    if (screen) {
      // @ts-ignore
      navigation.navigate(screen);
    }
  };

  const handleToggleCollapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed((c) => !c);
  };

  const renderLogo = () => {
    if (collapsed) {
      if (logos?.logoSmall) {
        return <Image source={logos.logoSmall} style={styles.logoSmall} resizeMode="contain" />;
      }
      return <Text style={styles.logoTextSmall}>App</Text>;
    } else {
      if (logos?.logo) {
        return <Image source={logos.logo} style={styles.logo} resizeMode="contain" />;
      }
      return <Text style={styles.logoText}>My Application</Text>;
    }
  };

  return (
    <View style={[styles.container, collapsed ? styles.containerCollapsed : null]}>
      <View style={styles.logoContainer}>
        <View style={styles.logoWrap}>{renderLogo()}</View>

        <TouchableOpacity onPress={handleToggleCollapse} style={styles.toggleBtn}>
          <Text style={styles.toggleBtnText}>{collapsed ? '»' : '«'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {menuItems.map((item, index) => {
          if (item.type === 'title') {
            return (
              <View key={`title-${index}`} style={styles.menuTitle}>
                <Text style={styles.menuTitleText}>{item.label}</Text>
              </View>
            );
          }

          if (item.type === 'submenu') {
            const isOpen = !!openSubmenus[item.key];
            return (
              <View key={`submenu-${item.key}`} style={styles.submenuContainer}>
                <TouchableOpacity onPress={() => toggleSubmenu(item.key)} style={[styles.submenuHeader, collapsed && styles.itemCollapsed]}>
                  <Text style={[styles.submenuLabel, collapsed && styles.labelCollapsed]}>{item.label}</Text>
                  <Text style={[styles.arrow, isOpen ? styles.arrowOpen : null]}>{isOpen ? '▾' : '▸'}</Text>
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.submenuContent}>
                    {item.children.map((child: any) => (
                      <TouchableOpacity
                        key={child.key}
                        onPress={() => handleTabPress(child.key, child.screen)}
                        style={[styles.menuItem, activeTab === child.key ? styles.menuItemActive : null, collapsed && styles.itemCollapsed]}
                      >
                        <Text style={[styles.menuItemText, collapsed && styles.labelCollapsed]}>{child.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={`item-${item.key}`}
              onPress={() => handleTabPress(item.key, item.screen)}
              style={[styles.menuItem, activeTab === item.key ? styles.menuItemActive : null, collapsed && styles.itemCollapsed]}
            >
              <Text style={[styles.menuItemText, collapsed && styles.labelCollapsed]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
