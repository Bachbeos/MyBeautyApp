import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions, TextInput, Modal, Image, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { useSelector, useDispatch } from "react-redux"; // Giả định bạn đang dùng react-redux
import Ionicons from "react-native-vector-icons/Ionicons";
import { createStyles, Theme } from "./Header.styles";

export default function Header({ onMenuPress }: { onMenuPress: () => void }) {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  // 1. Lấy thông tin user từ Redux (Giống bản Web)
  // Tùy theo cấu trúc rootReducer của bạn mà state.user có thể chứa userInfo
  const user = useSelector((state: any) => state.user?.userInfo || state.user || {});

  const [theme, setTheme] = useState<Theme>("light");
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDarkMode = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    // TODO: Cập nhật state theme vào Redux hoặc Async Storage nếu cần
  };

  const handleSearch = () => {
    // Chuyển hướng đến màn hình tìm kiếm
  };

  // 2. Logic Đăng Xuất
  const handleLogout = async () => {
    setShowDropdown(false);
    try {
      // Xóa token khỏi thiết bị
      await SecureStore.deleteItemAsync("token");

      // (Tùy chọn) Gọi action reset state của Redux nếu có
      // dispatch({ type: 'USER_LOGOUT' });

      // Reset luồng màn hình và điều hướng về trang Đăng nhập
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  const styles = createStyles(theme);
  const isTablet = Dimensions.get("window").width >= 768;

  const ICONS = {
    MENU: "menu-outline",
    SEARCH: "search-outline",
    SUN: "sunny-outline",
    MOON: "moon-outline",
    MESSAGES: "chatbox-ellipses-outline",
    NOTIFICATIONS: "notifications-outline",
  };

  // Xử lý avatar: Nếu không có avatar thì dùng UI-Avatars để tạo ảnh từ tên
  const avatarUrl =
    user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.name || "U")}&background=e41f07&color=fff`;

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

        {/* <TouchableOpacity style={styles.headerItemButton} onPress={toggleDarkMode}>
          <Ionicons name={theme === "dark" ? ICONS.SUN : ICONS.MOON} style={styles.headerIcon} />
        </TouchableOpacity> */}

        <View style={styles.headerLine} />

        <TouchableOpacity style={styles.headerItemButton}>
          <Ionicons name={ICONS.MESSAGES} style={styles.headerIcon} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>14</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerItemButton}>
          <Ionicons name={ICONS.NOTIFICATIONS} style={styles.headerIcon} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>10</Text>
          </View>
        </TouchableOpacity>

        {/* User Avatar - Bấm để mở Dropdown */}
        <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => setShowDropdown(true)}>
          <Image source={{ uri: avatarUrl }} style={styles.userAvatar} />
          <View style={styles.onlineStatus} />
        </TouchableOpacity>
      </View>

      {/* 3. DROPDOWN MENU (Giả lập giống Web) */}
      <Modal visible={showDropdown} transparent={true} animationType="fade" onRequestClose={() => setShowDropdown(false)}>
        {/* Lớp nền trong suốt: Bấm vào đây để đóng menu */}
        <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
          <View style={dropdownStyles.overlay}>
            <TouchableWithoutFeedback>
              <View style={dropdownStyles.dropdown}>
                {/* Thông tin User */}
                <View style={dropdownStyles.userInfo}>
                  <Text style={dropdownStyles.userName}>{user.fullName || user.name || "Người dùng"}</Text>
                  <Text style={dropdownStyles.userRole}>{user.roleName || user.role || "Nhân viên"}</Text>
                </View>

                <View style={dropdownStyles.divider} />

                <TouchableOpacity
                  style={dropdownStyles.menuItem}
                  onPress={() => {
                    setShowDropdown(false);
                    navigation.navigate("ProfileSettingsScreen");
                  }}
                >
                  <Ionicons name="person-outline" size={18} color="#4b5563" />
                  <Text style={dropdownStyles.menuText}>Hồ sơ của tôi</Text>
                </TouchableOpacity>

                {/* <TouchableOpacity style={dropdownStyles.menuItem}>
                  <Ionicons name="settings-outline" size={18} color="#4b5563" />
                  <Text style={dropdownStyles.menuText}>Cài đặt</Text>
                </TouchableOpacity> */}

                <View style={dropdownStyles.divider} />

                {/* Nút Đăng xuất */}
                <TouchableOpacity style={dropdownStyles.menuItem} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={18} color="#e41f07" />
                  <Text style={[dropdownStyles.menuText, { color: "#e41f07" }]}>Đăng xuất</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// Bổ sung các style cục bộ cho Dropdown (Không cần sửa file Header.styles.ts)
const dropdownStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)", // Có thể để trong suốt 'transparent'
  },
  dropdown: {
    position: "absolute",
    top: 60, // Vị trí nằm ngay dưới Header
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5, // Dành cho Android
    paddingVertical: 8,
  },
  userInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#1f2937",
  },
  userRole: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },
});
