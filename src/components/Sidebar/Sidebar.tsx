import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
  ImageSourcePropType,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useSidebar } from "./SidebarContext";
import styles from "./Sidebar.styles";

// Kích hoạt LayoutAnimation trên Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  type?: "title" | "submenu" | "item";
  key?: string;
  label: string;
  screen?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  children?: MenuItem[];
  show?: boolean;
};

export default function Sidebar({ logos, initialCollapsed = false, currentRouteName }: Props) {
  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();
  const [activeTab, setActiveTab] = useState<string>("");
  const [collapsed, setCollapsed] = useState<boolean>(initialCollapsed);
  const { close } = useSidebar();

  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    application: false,
    report: false,
    settings_general: false,
    system_settings: false,
    membership: false,
  });

  // --- LOGIC PHÂN QUYỀN ---
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isPermissionsLoaded, setIsPermissionsLoaded] = useState(false);

  useEffect(() => {
    const loadPermissions = async () => {
      const modules = [
        "ROLE",
        "RESOURCE",
        "USER",
        "PERMISSION",
        "BRANCH",
        "CUSTOMER_ATTRIBUTE",
        "UNIT",
        "INVOICE",
        "PRODUCT",
        "SERVICE",
        "CUSTOMER_SOURCE",
        "BOUGHT_PRODUCT",
        "BOUGHT_SERVICE",
        "CALL_HISTORY",
        "CATEGORY_ITEM",
        "REPORT",
        "SCHEDULE",
        "VOUCHER",
        "CUSTOMER",
      ];

      const perms: Record<string, boolean> = {};

      // Dùng Promise.all để đọc đồng loạt tất cả các quyền
      const promises = modules.map(async (mod) => {
        try {
          const val = await SecureStore.getItemAsync(mod + "_VIEW");
          perms[mod + "_VIEW"] = val === "1";
        } catch (error) {
          perms[mod + "_VIEW"] = false;
        }
      });

      await Promise.all(promises);
      setPermissions(perms);
      setIsPermissionsLoaded(true);
    };

    loadPermissions();
  }, []);

  // --- MAP ROUTES & TABS ---
  const routeNameToTabKey: Record<string, string> = {
    CallHistoryScreen: "call-history",
    CalendarScreen: "calendar",
    CustomersScreen: "customers",
    CustomerSourceScreen: "customerSource",
    BranchScreen: "branch",
    InvoiceScreen: "invoice",
    VoucherScreen: "voucher",
    UnitScreen: "unit",
    CategoryScreen: "category",
    ProductScreen: "product",
    ServiceScreen: "service",
    LeadReportScreen: "lead-reports",
    ResourcesScreen: "resources",
    ManagerUsersScreen: "manager-users",
    RolesPermissionsScreen: "roles-permissions",
    ProfileSettingsScreen: "profile-settings",
    CustomerSettingsScreen: "customer-settings",
  };

  const submenuParent: Record<string, string | undefined> = {
    "call-history": "application",
    calendar: "application",
    "lead-reports": "report",
    "profile-settings": "settings_general",
    "customer-settings": "system_settings",
  };

  const appGroupVisible = permissions.CALL_HISTORY_VIEW || permissions.SCHEDULE_VIEW;
  const crmGroupVisible =
    permissions.CUSTOMER_VIEW ||
    permissions.CUSTOMER_SOURCE_VIEW ||
    permissions.BRANCH_VIEW ||
    permissions.INVOICE_VIEW ||
    permissions.VOUCHER_VIEW ||
    permissions.UNIT_VIEW ||
    permissions.CATEGORY_ITEM_VIEW ||
    permissions.PRODUCT_VIEW ||
    permissions.SERVICE_VIEW;
  const reportGroupVisible = permissions.REPORT_VIEW;
  const settingsCrmVisible = permissions.RESOURCE_VIEW;
  const userGroupVisible = permissions.USER_VIEW || permissions.ROLE_VIEW;
  const systemSettingsVisible = permissions.CUSTOMER_ATTRIBUTE_VIEW;

  const rawMenuItems: MenuItem[] = [
    { type: "title", label: "Menu chính", show: appGroupVisible },
    {
      type: "submenu",
      key: "application",
      label: "Ứng dụng",
      icon: "apps" as any,
      show: appGroupVisible,
      children: [
        { key: "call-history", label: "Lịch sử cuộc gọi", screen: "CallHistoryScreen", show: permissions.CALL_HISTORY_VIEW },
        { key: "calendar", label: "Lịch hẹn", screen: "CalendarScreen", show: permissions.SCHEDULE_VIEW },
      ].filter((c) => c.show !== false),
    },

    { type: "title", label: "CRM", show: crmGroupVisible },
    { key: "customers", label: "Khách hàng", screen: "CustomersScreen", icon: "account-arrow-up" as any, show: permissions.CUSTOMER_VIEW },
    {
      key: "customerSource",
      label: "Nguồn khách hàng",
      screen: "CustomerSourceScreen",
      icon: "chart-arc" as any,
      show: permissions.CUSTOMER_SOURCE_VIEW,
    },
    { key: "branch", label: "Chi nhánh", screen: "BranchScreen", icon: "office-building", show: permissions.BRANCH_VIEW },
    { key: "invoice", label: "Hóa đơn", screen: "InvoiceScreen", icon: "file-document-outline", show: permissions.INVOICE_VIEW },
    { key: "voucher", label: "Voucher", screen: "VoucherScreen", icon: "medal", show: permissions.VOUCHER_VIEW },
    { key: "unit", label: "Đơn vị", screen: "UnitScreen", icon: "arrow-right-circle" as any, show: permissions.UNIT_VIEW },
    { key: "category", label: "Danh mục", screen: "CategoryScreen", icon: "tag-multiple" as any, show: permissions.CATEGORY_ITEM_VIEW },
    { key: "product", label: "Sản phẩm", screen: "ProductScreen", icon: "package-variant", show: permissions.PRODUCT_VIEW },
    { key: "service", label: "Dịch vụ", screen: "ServiceScreen", icon: "briefcase", show: permissions.SERVICE_VIEW },

    { type: "title", label: "Báo cáo", show: reportGroupVisible },
    {
      type: "submenu",
      key: "report",
      label: "Báo cáo",
      icon: "chart-bar",
      show: reportGroupVisible,
      children: [{ key: "lead-reports", label: "Báo cáo & Thống kê", screen: "LeadReportScreen", show: permissions.REPORT_VIEW }].filter(
        (c) => c.show !== false
      ),
    },

    { type: "title", label: "Cài đặt CRM", show: settingsCrmVisible },
    { key: "resources", label: "Tài nguyên", screen: "ResourcesScreen", icon: "palette", show: permissions.RESOURCE_VIEW },

    { type: "title", label: "Quản lý người dùng", show: userGroupVisible },
    { key: "manager-users", label: "Tài khoản người dùng", screen: "ManagerUsersScreen", icon: "account-multiple", show: permissions.USER_VIEW },
    {
      key: "roles-permissions",
      label: "Chức vụ & Phân quyền",
      screen: "RolesPermissionsScreen",
      icon: "shield-account",
      show: permissions.ROLE_VIEW,
    },

    { type: "title", label: "Cài đặt", show: true },
    {
      type: "submenu",
      key: "settings_general",
      label: "Cài đặt chung",
      icon: "cog",
      show: true,
      children: [{ key: "profile-settings", label: "Hồ sơ", screen: "ProfileSettingsScreen", show: true }].filter((c) => c.show !== false),
    },
    {
      type: "submenu",
      key: "system_settings",
      label: "Cài đặt hệ thống",
      icon: "laptop",
      show: systemSettingsVisible,
      children: [
        { key: "customer-settings", label: "Cài đặt khách hàng", screen: "CustomerSettingsScreen", show: permissions.CUSTOMER_ATTRIBUTE_VIEW },
      ].filter((c) => c.show !== false),
    },
  ];

  // Lọc bỏ những item không có quyền, hoặc những submenu trống (không có con nào hiển thị)
  const menuItems = rawMenuItems.filter((item) => item.show !== false && (item.type !== "submenu" || (item.children && item.children.length > 0)));

  useEffect(() => {
    const routeName = currentRouteName || "";
    const currentTab = routeNameToTabKey[routeName];

    if (currentTab) {
      setActiveTab(currentTab);
      const parent = submenuParent[currentTab];
      if (parent) {
        setOpenSubmenus((prev) => ({ ...prev, [parent]: true }));
      }
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

    if (screen && navigation) {
      navigation.navigate(screen);
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

        {/* Chờ load quyền xong mới render Menu để tránh nháy giật */}
        {!isPermissionsLoaded ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#e41f07" />
          </View>
        ) : (
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {menuItems.map((item, index) => {
              if (item.type === "title") {
                if (collapsed) return <View key={`sep-${index}`} style={styles.separator} />;
                return (
                  <View key={`title-${index}`} style={styles.menuTitle}>
                    <Text style={styles.menuTitleText}>{item.label}</Text>
                  </View>
                );
              }

              const itemKey = item.key || "";

              if (item.type === "submenu") {
                const isOpen = !!openSubmenus[itemKey];
                const hasActiveChild = item.children?.some((child) => child.key === activeTab);
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
                            <MaterialCommunityIcons name={item.icon} size={20} color={isParentActive ? "#e41f07" : "#6b7280"} />
                          </View>
                        )}
                        {!collapsed && <Text style={[styles.menuItemText, isParentActive && styles.textActive]}>{item.label}</Text>}
                      </View>
                      {!collapsed && (
                        <MaterialCommunityIcons
                          name={isOpen ? "chevron-down" : "chevron-right"}
                          size={18}
                          color={isParentActive ? "#e41f07" : "#9ca3af"}
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
                              <View style={[styles.bullet, isChildActive && styles.bulletActive]} />
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
                        <MaterialCommunityIcons name={item.icon} size={20} color={isActive ? "#e41f07" : "#6b7280"} />
                      </View>
                    )}
                    {!collapsed && <Text style={[styles.menuItemText, isActive && styles.textActive]}>{item.label}</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
