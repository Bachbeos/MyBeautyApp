import { StyleSheet, Platform } from 'react-native';

export const SIDEBAR_WIDTH = 280;
export const SIDEBAR_COLLAPSED_WIDTH = 70;

const COLORS = {
  primary: '#e41f07',
  primaryBgSubtle: '#fdeeee',
  menuBg: '#ffffff',
  borderColor: '#e8e8e8',
  menuTitleColor: '#9ca3af',
  menuItemColor: '#4b5563',
  iconColor: '#6b7280',
};

export default StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    backgroundColor: COLORS.menuBg,
    borderRightWidth: 1,
    borderRightColor: COLORS.borderColor,
    height: '100%',
    flexDirection: 'column',
  },
  containerCollapsed: {
    width: SIDEBAR_COLLAPSED_WIDTH,
  },
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // --- HEADER LOGO ---
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    justifyContent: 'space-between',
  },
  logoContainerCollapsed: {
    paddingHorizontal: 0,
    justifyContent: 'center',
  },
  logoWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 140,
    height: 36,
  },
  logoSmall: {
    width: 32,
    height: 32,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  logoTextSmall: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  toggleBtn: {
    padding: 4,
  },

  // --- SCROLL AREA ---
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 12,
    paddingBottom: 40,
  },

  // --- SECTION TITLE ---
  menuTitle: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  menuTitleText: {
    fontSize: 11,
    color: COLORS.menuTitleColor,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 12,
    marginHorizontal: 16,
  },

  // --- MENU ITEM (Dùng chung cho cả Cha và Con) ---
  submenuContainer: {
    marginBottom: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 16,
    marginHorizontal: 10,
    borderRadius: 8,
    marginBottom: 2,
  },

  // [QUAN TRỌNG] Style Active (Nền hồng)
  menuItemActive: {
    backgroundColor: COLORS.primaryBgSubtle,
  },

  itemCollapsed: {
    paddingHorizontal: 0,
    marginHorizontal: 0,
    justifyContent: 'center',
    borderRadius: 0,
  },

  // Nội dung bên trong Item
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconCollapsed: {
    marginRight: 0,
  },

  menuItemText: {
    fontSize: 14.5,
    color: COLORS.menuItemColor,
    fontWeight: '500',
    flex: 1,
  },

  textActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // --- SUBMENU CONTENT ---
  submenuContent: {
    overflow: 'hidden',
    marginTop: 2,
  },
  submenuItem: {
    paddingVertical: 10,
    paddingLeft: 52,
    paddingRight: 16,
    marginHorizontal: 10,
    borderRadius: 8,
    marginBottom: 2,
  },

  submenuItemActive: {
    backgroundColor: COLORS.primaryBgSubtle,
  },
  submenuItemText: {
    fontSize: 14,
    color: COLORS.menuItemColor,
  },

  arrowIcon: {
    marginLeft: 4,
  },
});
