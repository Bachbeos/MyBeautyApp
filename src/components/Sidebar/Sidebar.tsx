import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, LayoutAnimation, Platform, UIManager, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSidebar } from './SidebarContext';
import styles from './Sidebar.styles';

type Logos = {
  logo?: ImageSourcePropType;
  logoSmall?: ImageSourcePropType;
  logoWhite?: ImageSourcePropType;
};

type Props = {
  logos?: Logos;
  initialCollapsed?: boolean;
  currentRouteName?: string;
};

type MenuItem = {
  type?: 'title' | 'submenu' | 'item';
  key?: string;
  label: string;
  screen?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  children?: MenuItem[];
};

export default function Sidebar({ logos, initialCollapsed = false, currentRouteName }: Props) {
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();
  const [activeTab, setActiveTab] = useState<string>('');
  const [collapsed, setCollapsed] = useState<boolean>(initialCollapsed);
  const { close } = useSidebar();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    report: false,
    membership: false,
    settings_general: false,
    system_settings: false,
  });

  const routeNameToTabKey: Record<string, string> = {
    CustomersScreen: 'customers',
    BranchScreen: 'branch',
    PaymentScreen: 'payment',
    InvoiceScreen: 'invoice',
    DealScreen: 'deal',
    ActivitiesScreen: 'activities',
    TaskScreen: 'task',
    CampaignScreen: 'campaign',
    ContractScreen: 'contract',
    EstimationScreen: 'estimation',
    LeadScreen: 'lead',
    PipelineScreen: 'pipeline',
    ProjectScreen: 'project',
    ProposalScreen: 'proposal',
    LeadReportScreen: 'lead-reports',
    DealReportScreen: 'deal-reports',
    ContactReportScreen: 'contact-reports',
    CompanyReportScreen: 'company-reports',
    ProjectReportScreen: 'project-reports',
    TaskReportScreen: 'task-reports',
    ResourcesScreen: 'resources',
    LostReasonScreen: 'lost-reason',
    ContactStageScreen: 'contact-stage',
    IndustryScreen: 'industry',
    ManagerUsersScreen: 'manager-users',
    RolesPermissionsScreen: 'roles-permissions',
    MembershipPlansScreen: 'membership-plans',
    MembershipAddonsScreen: 'membership-addons',
    MembershipTransactionsScreen: 'membership-transactions',
    ProfileSettingsScreen: 'profile-settings',
    SecuritySettingsScreen: 'security-settings',
    NotificationsSettingsScreen: 'notifications-settings',
    CustomerSettingsScreen: 'customer-settings',
    Home: 'home',
  };

  const submenuParent: Record<string, string | undefined> = {
    'lead-reports': 'report',
    'deal-reports': 'report',
    'contact-reports': 'report',
    'company-reports': 'report',
    'project-reports': 'report',
    'task-reports': 'report',
    'membership-plans': 'membership',
    'membership-addons': 'membership',
    'membership-transactions': 'membership',
    'profile-settings': 'settings_general',
    'security-settings': 'settings_general',
    'notifications-settings': 'settings_general',
    'customer-settings': 'system_settings',
  };

  const menuItems: MenuItem[] = [
    { type: 'title', label: 'Menu chính' },
    { type: 'title', label: 'CRM' },
    { key: 'customers', label: 'Khách hàng', screen: 'CustomersScreen', icon: 'account-group' },
    { key: 'branch', label: 'Chi nhánh', screen: 'BranchScreen', icon: 'office-building' },
    { key: 'payment', label: 'Thanh toán', screen: 'PaymentScreen', icon: 'cash-multiple' },
    { key: 'invoice', label: 'Hóa đơn', screen: 'InvoiceScreen', icon: 'file-document-outline' },
    { key: 'deal', label: 'Giao dịch', screen: 'DealScreen', icon: 'medal' },
    { key: 'activities', label: 'Hoạt động', screen: 'ActivitiesScreen', icon: 'run' },
    { key: 'task', label: 'Công việc', screen: 'TaskScreen', icon: 'format-list-checks' },
    { key: 'campaign', label: 'Chiến dịch', screen: 'CampaignScreen', icon: 'bullhorn' },
    { key: 'contract', label: 'Hợp đồng', screen: 'ContractScreen', icon: 'file-check-outline' },
    { key: 'estimation', label: 'Báo giá', screen: 'EstimationScreen', icon: 'file-chart-outline' },
    { key: 'lead', label: 'KH Tiềm năng', screen: 'LeadScreen', icon: 'chart-arc' },
    { key: 'pipeline', label: 'Quy trình bán', screen: 'PipelineScreen', icon: 'timeline-clock-outline' },
    { key: 'project', label: 'Dự án', screen: 'ProjectScreen', icon: 'atom' },
    { key: 'proposal', label: 'Đề xuất', screen: 'ProposalScreen', icon: 'file-star-outline' },

    { type: 'title', label: 'Báo cáo' },
    {
      type: 'submenu',
      key: 'report',
      label: 'Báo cáo',
      icon: 'chart-bar',
      children: [
        { key: 'lead-reports', label: 'BC Khách tiềm năng', screen: 'LeadReportScreen' },
        { key: 'deal-reports', label: 'BC Giao dịch', screen: 'DealReportScreen' },
        { key: 'contact-reports', label: 'BC Khách hàng', screen: 'ContactReportScreen' },
        { key: 'company-reports', label: 'BC Chi nhánh', screen: 'CompanyReportScreen' },
        { key: 'project-reports', label: 'BC Dự án', screen: 'ProjectReportScreen' },
        { key: 'task-reports', label: 'BC Công việc', screen: 'TaskReportScreen' },
      ],
    },

    { type: 'title', label: 'Cài đặt CRM' },
    { key: 'resources', label: 'Tài nguyên', screen: 'ResourcesScreen', icon: 'palette' },
    { key: 'lost-reason', label: 'Lý do mất khách', screen: 'LostReasonScreen', icon: 'message-alert-outline' },
    { key: 'contact-stage', label: 'Giai đoạn liên hệ', screen: 'ContactStageScreen', icon: 'stairs' },
    { key: 'industry', label: 'Ngành nghề', screen: 'IndustryScreen', icon: 'factory' },

    { type: 'title', label: 'Quản lý người dùng' },
    { key: 'manager-users', label: 'DS Người dùng', screen: 'ManagerUsersScreen', icon: 'account-multiple' },
    { key: 'roles-permissions', label: 'Vai trò & Quyền', screen: 'RolesPermissionsScreen', icon: 'shield-account' },

    { type: 'title', label: 'Thành viên' },
    {
      type: 'submenu',
      key: 'membership',
      label: 'Thành viên',
      icon: 'card-account-details-outline',
      children: [
        { key: 'membership-plans', label: 'Gói thành viên', screen: 'MembershipPlansScreen' },
        { key: 'membership-addons', label: 'Gói bổ sung', screen: 'MembershipAddonsScreen' },
        { key: 'membership-transactions', label: 'Giao dịch', screen: 'MembershipTransactionsScreen' },
      ],
    },

    { type: 'title', label: 'Cài đặt' },
    {
      type: 'submenu',
      key: 'settings_general',
      label: 'Cài đặt chung',
      icon: 'cog',
      children: [
        { key: 'profile-settings', label: 'Hồ sơ', screen: 'ProfileSettingsScreen' },
        { key: 'security-settings', label: 'Bảo mật', screen: 'SecuritySettingsScreen' },
        { key: 'notifications-settings', label: 'Thông báo', screen: 'NotificationsSettingsScreen' },
      ],
    },
    {
      type: 'submenu',
      key: 'system_settings',
      label: 'Cài đặt hệ thống',
      icon: 'laptop',
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
    if (collapsed) {
      setCollapsed(false);
      setTimeout(() => {
        setOpenSubmenus((prev) => ({ ...prev, [key]: true }));
      }, 100);
    } else {
      setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleTabPress = (tabKey: string, screen?: string) => {
    setActiveTab(tabKey);
    const parent = submenuParent[tabKey];
    if (parent && !collapsed) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setOpenSubmenus((prev) => ({ ...prev, [parent]: true }));
    }
    if (screen && navigation?.navigate) {
      // @ts-ignore
      navigation.navigate(screen);
      // close();
    }
  };

  const renderLogo = () => {
    if (collapsed) {
      if (logos?.logoSmall) return <Image source={logos.logoSmall} style={styles.logoSmall} resizeMode="contain" />;
      return <Text style={styles.logoTextSmall}>App</Text>;
    }
    if (logos?.logo) return <Image source={logos.logo} style={styles.logo} resizeMode="contain" />;
    return <Text style={styles.logoText}>My Beauty App</Text>;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, collapsed && styles.containerCollapsed]}>
        <View style={[styles.logoContainer, collapsed && styles.logoContainerCollapsed]}>
          <View style={styles.logoWrap}>{renderLogo()}</View>
          <TouchableOpacity onPress={close} style={styles.toggleBtn}>
            <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {menuItems.map((item, index) => {
            if (item.type === 'title') {
              if (collapsed) return <View key={`sep-${index}`} style={styles.separator} />;
              return (
                <View key={`title-${index}`} style={styles.menuTitle}>
                  <Text style={styles.menuTitleText}>{item.label}</Text>
                </View>
              );
            }

            const itemKey = item.key || '';

            if (item.type === 'submenu') {
              const isOpen = !!openSubmenus[itemKey];
              const hasActiveChild = item.children?.some((child: any) => child.key === activeTab);
              const isParentActive = (hasActiveChild || isOpen) && !collapsed;

              return (
                <View key={`submenu-${itemKey}`} style={styles.submenuContainer}>
                  <TouchableOpacity
                    onPress={() => toggleSubmenu(itemKey)}
                    style={[styles.menuItem, isParentActive && styles.menuItemActive, collapsed && styles.itemCollapsed]}
                  >
                    <View style={styles.row}>
                      {item.icon && (
                        <View style={styles.iconBox}>
                          <MaterialCommunityIcons name={item.icon} size={20} color={isParentActive ? '#e41f07' : '#6b7280'} />
                        </View>
                      )}
                      {!collapsed && <Text style={[styles.menuItemText, isParentActive && styles.textActive]}>{item.label}</Text>}
                    </View>
                    {!collapsed && (
                      <MaterialCommunityIcons
                        name={isOpen ? 'chevron-down' : 'chevron-right'}
                        size={18}
                        color={isParentActive ? '#e41f07' : '#9ca3af'}
                        style={styles.arrowIcon}
                      />
                    )}
                  </TouchableOpacity>

                  {isOpen && !collapsed && (
                    <View style={styles.submenuContent}>
                      {item.children?.map((child: MenuItem) => {
                        const isChildActive = activeTab === child.key;
                        return (
                          <TouchableOpacity
                            key={child.key}
                            onPress={() => child.key && handleTabPress(child.key, child.screen)}
                            style={[styles.submenuItem, isChildActive && styles.submenuItemActive]}
                          >
                            <Text style={[styles.submenuItemText, isChildActive && styles.textActive]}>{child.label}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            }

            const isActive = activeTab === itemKey;
            return (
              <TouchableOpacity
                key={`item-${itemKey}`}
                onPress={() => itemKey && handleTabPress(itemKey, item.screen)}
                style={[styles.menuItem, isActive && styles.menuItemActive, collapsed && styles.itemCollapsed]}
              >
                <View style={styles.row}>
                  {item.icon && (
                    <View style={[styles.iconBox, collapsed && styles.iconCollapsed]}>
                      <MaterialCommunityIcons name={item.icon} size={20} color={isActive ? '#e41f07' : '#6b7280'} />
                    </View>
                  )}
                  {!collapsed && <Text style={[styles.menuItemText, isActive && styles.textActive]}>{item.label}</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
