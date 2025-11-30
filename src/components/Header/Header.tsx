import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, TextInput, Platform, Linking, Alert, Image } from 'react-native';
import { createStyles, Theme } from './Header.styles';
// Giả lập thư viện icons (thay thế ti ti-*)
import Ionicons from 'react-native-vector-icons/Ionicons';
// Giả lập store và user object
const mockUser = {
  name: 'Installer (Mock)',
  avatar: 'https://placehold.co/42x42/e41f07/fff?text=U', // Placeholder image
  role: 'Installer',
};

// Component Header cho React Native
export default function Header({ onMenuPress }: { onMenuPress: () => void }) {
  // 1. Logic Dark Mode (Đơn giản hóa cho React Native)
  const [theme, setTheme] = useState<Theme>('light');

  // Giả lập logic Dark Mode toggle
  const toggleDarkMode = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    // Trong môi trường React Native thực tế, sẽ dùng:
    // const colorScheme = useColorScheme();
    // Color scheme này được lấy từ cài đặt hệ thống.
  };

  // 2. Logic Fullscreen (Thay thế bằng một hành động khác cho Mobile)
  const toggleAction = () => {
    Alert.alert(
      'Chức năng Fullscreen',
      "Trên ứng dụng di động, nút này có thể dùng cho các hành động khác như 'Cài đặt nhanh' hoặc 'Cập nhật giao diện'.",
    );
  };

  // 3. Logic Tìm kiếm (Chỉ là UI cho mobile)
  const handleSearch = () => {
    Alert.alert('Tìm kiếm', 'Chuyển đến màn hình tìm kiếm toàn cục.');
  };

  // 4. Mở Dropdown người dùng (Mô phỏng)
  const handleUserDropdown = () => {
    Alert.alert('Menu Người dùng', 'Các tùy chọn như: Cài đặt hồ sơ, Trợ giúp, Cài đặt ứng dụng, Đăng xuất.');
  };

  const styles = createStyles(theme);

  // Giả lập cho thanh tìm kiếm chỉ hiển thị trên màn hình lớn (tablet)
  const isTablet = Dimensions.get('window').width >= 768;

  // Biểu tượng (Map từ ti ti-* sang Ionicons)
  const ICONS = {
    MENU: 'menu-outline',
    SEARCH: 'search-outline',
    MAXIMIZE: 'resize-outline',
    SUN: 'sunny-outline',
    MOON: 'moon-outline',
    PAGES: 'grid-outline',
    FAQ: 'help-circle-outline',
    REPORT: 'stats-chart-outline',
    MESSAGES: 'chatbox-ellipses-outline',
    NOTIFICATIONS: 'notifications-outline',
  };

  return (
    <View style={styles.header}>
      {/* Container Bên Trái: Logo & Menu Mobile */}
      <View style={styles.leftContainer}>
        {/* Nút Menu Mobile (Giả lập onMenuPress) */}
        <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
          <Ionicons name={ICONS.MENU} style={styles.headerIcon} size={24} />
        </TouchableOpacity>

        {/* Logo */}
        {/* <Text style={styles.logoText}>CRMS</Text> */}

        {/* Thanh Tìm kiếm (Chỉ hiện trên Tablet/Desktop) */}
        {isTablet && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Keyword"
              placeholderTextColor={styles.headerIcon.color}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchIcon}>
              <Ionicons name={ICONS.SEARCH} style={styles.headerIcon} size={18} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Container Bên Phải: Các chức năng */}
      <View style={styles.rightContainer}>
        {/* Tìm kiếm cho Mobile (Chỉ hiện trên Mobile) */}
        {!isTablet && (
          <TouchableOpacity style={styles.headerItemButton} onPress={handleSearch}>
            <Ionicons name={ICONS.SEARCH} style={styles.headerIcon} />
          </TouchableOpacity>
        )}

        {/* Minimize / Chức năng khác */}
        <TouchableOpacity style={styles.headerItemButton} onPress={toggleAction}>
          <Ionicons name={ICONS.MAXIMIZE} style={styles.headerIcon} />
        </TouchableOpacity>

        {/* Light/Dark Mode */}
        <TouchableOpacity style={styles.headerItemButton} onPress={toggleDarkMode}>
          <Ionicons name={theme === 'dark' ? ICONS.SUN : ICONS.MOON} style={styles.headerIcon} />
        </TouchableOpacity>

        {/* Line divider (chuyển thành một View nhỏ) */}
        <View style={styles.headerLine} />

        {/* Messages */}
        <TouchableOpacity style={styles.headerItemButton} onPress={() => Alert.alert('Messages', 'Mở hộp thư/chat.')}>
          <Ionicons name={ICONS.MESSAGES} style={styles.headerIcon} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>14</Text>
          </View>
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity style={styles.headerItemButton} onPress={() => Alert.alert('Notifications', 'Mở danh sách thông báo.')}>
          <Ionicons name={ICONS.NOTIFICATIONS} style={styles.headerIcon} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>10</Text>
          </View>
        </TouchableOpacity>

        {/* User Dropdown */}
        <TouchableOpacity style={{ marginLeft: 8 }} onPress={handleUserDropdown}>
          {/* Giả lập Image và trạng thái online */}
          <Image source={{ uri: mockUser.avatar }} style={styles.userAvatar} />
          <View style={styles.onlineStatus} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
