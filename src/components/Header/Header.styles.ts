import { StyleSheet } from 'react-native';

// Định nghĩa các hằng số màu sắc và kích thước cơ bản dựa trên file style.css
// (Sử dụng các giá trị cố định vì không có biến CSS gốc)
const THEME_COLORS = {
  light: {
    headerBg: '#fff',
    borderColor: '#e8e8e8',
    iconColor: '#1f2020',
    primary: '#e41f07',
    textDark: '#1f2020',
    textMedium: '#707070',
    bgLight: '#f7f8f9',
  },
  dark: {
    headerBg: '#030318',
    borderColor: '#161641',
    iconColor: '#dbe0e6',
    primary: '#e41f07', // Giữ nguyên màu primary
    textDark: '#d9dcff',
    textMedium: '#828997',
    bgLight: '#11112f',
  },
};

// Kiểu dữ liệu cho theme
export type Theme = keyof typeof THEME_COLORS;

export const createStyles = (theme: Theme) => {
  const colors = THEME_COLORS[theme];

  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 56, // Dựa trên --crms-topbar-height: 56px
      backgroundColor: colors.headerBg,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
      paddingHorizontal: 16, // padding mặc định
    },
    leftContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexGrow: 1,
    },
    rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    // Logo (Giả sử React Native có thể hiển thị SVG hoặc Image)
    logoText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
      marginRight: 10,
    },
    // Nút Menu (Sidebar Toggle)
    menuButton: {
      padding: 8,
    },
    // Thanh tìm kiếm (Chỉ hiển thị trên tablet/desktop, nhưng ở đây tối ưu cho mobile)
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginHorizontal: 10,
      backgroundColor: colors.bgLight,
      borderRadius: 8,
      height: 38,
      paddingHorizontal: 10,
    },
    searchInput: {
      flex: 1,
      color: colors.iconColor,
      fontSize: 14,
      paddingVertical: 0, // Cần thiết cho TextInput
    },
    searchIcon: {
      marginLeft: 5,
    },
    // Các nút chức năng header (Minimize, Dark Mode, etc.)
    headerItemButton: {
      width: 38,
      height: 38,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.borderColor,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 4,
    },
    headerIcon: {
      fontSize: 16,
      color: colors.iconColor,
    },
    // Màu primary cho nút Pages (topbar-teal-link) - Giả lập
    primaryItemButton: {
      backgroundColor: 'rgba(14, 147, 132, 0.1)', // Dựa trên một màu Teal
      borderColor: 'transparent',
      marginHorizontal: 4,
    },
    primaryItemIcon: {
      color: '#0e9384',
    },
    // Dòng kẻ ngăn cách
    headerLine: {
      width: 1,
      height: 20,
      backgroundColor: colors.borderColor,
      marginHorizontal: 12,
    },
    // Notification Badge
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    badgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '600',
    },
    // User Dropdown (Mô phỏng phần hiển thị avatar và trạng thái online)
    userAvatar: {
      width: 38,
      height: 38,
      borderRadius: 6,
    },
    onlineStatus: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: 'green', // Màu online
      borderWidth: 2,
      borderColor: colors.headerBg,
    },
  });
};
