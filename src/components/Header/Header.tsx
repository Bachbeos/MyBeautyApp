import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, TextInput, Alert, Image } from 'react-native';
import { createStyles, Theme } from './Header.styles';
import Ionicons from 'react-native-vector-icons/Ionicons';

const mockUser = {
  name: 'Installer (Mock)',
  avatar: 'https://placehold.co/42x42/e41f07/fff.png?text=U',
  role: 'Installer',
};

export default function Header({ onMenuPress }: { onMenuPress: () => void }) {
  const [theme, setTheme] = useState<Theme>('light');

  const toggleDarkMode = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    // Trong môi trường React Native thực tế, sẽ dùng:
    // const colorScheme = useColorScheme();
    // Color scheme này được lấy từ cài đặt hệ thống.
  };

  const handleSearch = () => {
    Alert.alert('Tìm kiếm', 'Chuyển đến màn hình tìm kiếm toàn cục.');
  };

  const handleUserDropdown = () => {
    Alert.alert('Menu Người dùng', 'Các tùy chọn như: Cài đặt hồ sơ, Trợ giúp, Cài đặt ứng dụng, Đăng xuất.');
  };

  const styles = createStyles(theme);

  const isTablet = Dimensions.get('window').width >= 768;

  const ICONS = {
    MENU: 'menu-outline',
    SEARCH: 'search-outline',
    SUN: 'sunny-outline',
    MOON: 'moon-outline',
    MESSAGES: 'chatbox-ellipses-outline',
    NOTIFICATIONS: 'notifications-outline',
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
          <Ionicons name={ICONS.MENU} style={styles.headerIcon} />
        </TouchableOpacity>

        {/* Thanh Tìm kiếm (Chỉ hiện trên Tablet/Desktop) */}
        {isTablet && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm"
              placeholderTextColor={styles.headerIcon.color}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchIcon}>
              <Ionicons name={ICONS.SEARCH} style={styles.headerIcon} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.rightContainer}>
        {!isTablet && (
          <TouchableOpacity style={styles.headerItemButton} onPress={handleSearch}>
            <Ionicons name={ICONS.SEARCH} style={styles.headerIcon} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.headerItemButton} onPress={toggleDarkMode}>
          <Ionicons name={theme === 'dark' ? ICONS.SUN : ICONS.MOON} style={styles.headerIcon} />
        </TouchableOpacity>

        <View style={styles.headerLine} />

        <TouchableOpacity style={styles.headerItemButton} onPress={() => Alert.alert('Messages', 'Mở hộp thư/chat.')}>
          <Ionicons name={ICONS.MESSAGES} style={styles.headerIcon} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>14</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerItemButton} onPress={() => Alert.alert('Notifications', 'Mở danh sách thông báo.')}>
          <Ionicons name={ICONS.NOTIFICATIONS} style={styles.headerIcon} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>10</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={{ marginLeft: 8 }} onPress={handleUserDropdown}>
          <Image source={{ uri: mockUser.avatar }} style={styles.userAvatar} />
          <View style={styles.onlineStatus} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
