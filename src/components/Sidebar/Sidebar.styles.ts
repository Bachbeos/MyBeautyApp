import { StyleSheet } from 'react-native';

export const SIDEBAR_WIDTH = 280;
export const SIDEBAR_COLLAPSED_WIDTH = 80;

export default StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e6e6e6',
    height: '100%',
  },
  containerCollapsed: {
    width: SIDEBAR_COLLAPSED_WIDTH,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    justifyContent: 'space-between',
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 36,
  },
  logoSmall: {
    width: 36,
    height: 36,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  logoTextSmall: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  toggleBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  toggleBtnText: {
    fontSize: 14,
    color: '#6b7280',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 10,
  },
  menuTitle: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  menuTitleText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '700',
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 15,
    color: '#111827',
  },
  menuItemActive: {
    backgroundColor: '#eef2ff',
  },
  submenuContainer: {
    // wrapper for submenu
  },
  submenuHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  submenuLabel: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  submenuContent: {
    paddingLeft: 8,
    backgroundColor: 'transparent',
  },
  arrow: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 10,
  },
  arrowOpen: {
    transform: [{ rotate: '0deg' }],
  },
  itemCollapsed: {
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  labelCollapsed: {
    // hide label when collapsed if desired, or reduce opacity/size
    fontSize: 0,
    height: 0,
    opacity: 0,
  },
});
