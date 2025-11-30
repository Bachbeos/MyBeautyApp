import { StyleSheet, ViewStyle } from 'react-native';

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
    primary: '#e41f07',
    textDark: '#d9dcff',
    textMedium: '#828997',
    bgLight: '#11112f',
  },
};

export type Theme = keyof typeof THEME_COLORS;

export const createStyles = (theme: Theme) => {
  const colors = THEME_COLORS[theme];
  const baseButton: ViewStyle = {
    width: 38,
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 56,
      backgroundColor: colors.headerBg,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
      paddingHorizontal: 16,
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

    menuButton: {
      ...baseButton,
      padding: 8,
    },

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
      paddingVertical: 0,
    },

    searchIcon: {
      marginLeft: 5,
    },

    headerItemButton: {
      ...baseButton,
      marginHorizontal: 4,
    },

    headerIcon: {
      fontSize: 18,
      color: colors.iconColor,
    },

    headerLine: {
      width: 1,
      height: 20,
      backgroundColor: colors.borderColor,
      marginHorizontal: 12,
    },

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
      backgroundColor: 'green',
      borderWidth: 2,
      borderColor: colors.headerBg,
    },
  });
};
