import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, LayoutAnimation, Platform, UIManager, StyleSheet, ImageSourcePropType } from 'react-native';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import styles, { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './Sidebar.styles';

/**
 * Sidebar component (React Native)
 *
 * Ghi chú:
 * - Component này chuyển thể từ Sidebar web sang React Native.
 * - Dùng `useRoute()` để lấy route hiện tại và highlight item tương ứng.
 * - Dùng LayoutAnimation để animate việc mở/đóng submenu.
 * - Không giả định tồn tại thư viện icon cụ thể; bạn có thể thay bằng react-native-vector-icons nếu muốn.
 *
 * Props:
 * - logos?: { logo?: ImageSourcePropType; logoSmall?: ImageSourcePropType; logoWhite?: ImageSourcePropType }
 *
 * Sau khi thêm file, hãy:
 * - Cập nhật tên màn hình trong `routeNameToTabKey` hoặc đặt đúng screen name trong menuItems để navigation hoạt động.
 * - Đưa ảnh logo vào project và truyền vào props `logos` hoặc sửa trực tiếp require paths.
 */

type Logos = {
  logo?: ImageSourcePropType;
  logoSmall?: ImageSourcePropType;
  logoWhite?: ImageSourcePropType;
};

type Props = {
  logos?: Logos;
  /**
   * Nếu bạn muốn sidebar có thể collapse (rút gọn),
   * có thể điều khiển collapsed từ parent bằng prop này.
   */
  initialCollapsed?: boolean;
};

export default function Sidebar({ logos, initialCollapsed = false }: Props) {
  // enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();
  const route = useRoute();

  const [activeTab, setActiveTab] = useState<string>('');
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    settings_general: false,
    system_settings: false,
  });
  const [collapsed, setCollapsed] = useState<boolean>(initialCollapsed);

  // Ánh xạ route.name => tabKey (tùy bạn đặt tên màn hình trong navigator)
  const routeNameToTabKey: Record<string, string> = {
    CustomersScreen: 'customers',
    BranchScreen: 'branch',
    ResourcesScreen: 'resources',
    ManagerUsersScreen: 'manager-users',
    RolesPermissionsScreen: 'roles-permissions',
    ProfileSettingsScreen: 'profile-settings',
    CustomerSettingsScreen: 'customer-settings',
    // sửa/extend nếu cần
  };

  // Nếu tab là con của submenu, ánh xạ đến parent submenu key
  const submenuParent: Record<string, string | undefined> = {
    'profile-settings': 'settings_general',
    'customer-settings': 'system_settings',
  };

  // Menu definition (dùng để render)
  const menuItems: Array<any> = [
    { type: 'title', label: 'Menu chính' },
    // CRM
    { type: 'title', label: 'CRM' },
    { key: 'customers', label: 'Khách hàng', screen: 'CustomersScreen' },
    { key: 'branch', label: 'Chi nhánh', screen: 'BranchScreen' },
    // CRM Settings
    { type: 'title', label: 'Cài đặt CRM' },
    { key: 'resources', label: 'Tài nguyên', screen: 'ResourcesScreen' },
    // User Management
    { type: 'title', label: 'Quản lý người dùng' },
    { key: 'manager-users', label: 'Danh sách người dùng', screen: 'ManagerUsersScreen' },
    { key: 'roles-permissions', label: 'Vai trò & Phân quyền', screen: 'RolesPermissionsScreen' },
    // Settings (submenu)
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

  // Khi route thay đổi, cập nhật activeTab và mở parent submenu nếu cần
  useEffect(() => {
    const currentRouteName = (route && (route as any).name) || '';
    const currentTab = routeNameToTabKey[currentRouteName];
    if (currentTab) {
      setActiveTab(currentTab);
      const parent = submenuParent[currentTab];
      if (parent) {
        setOpenSubmenus((prev) => ({ ...prev, [parent]: true }));
      }
    } else {
      // nếu không khớp map, clear active
      setActiveTab('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.name]);

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
      // navigate to screen (nếu screen tồn tại trong navigator)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      navigation.navigate(screen);
    }
  };

  const handleToggleCollapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed((c) => !c);
  };

  // Helper renderers
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

        <TouchableOpacity onPress={handleToggleCollapse} style={styles.toggleBtn} accessibilityLabel="Toggle sidebar">
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

          // normal menu item
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
