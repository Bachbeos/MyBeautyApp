import { StyleSheet, Platform } from 'react-native';

const COLORS = {
  primary: '#e41f07',
  text: '#1f2020',
  textLight: '#9ca3af',
  border: '#f3f4f6',
  bg: '#ffffff',
  activeShadow: '#e41f07',
};

export default StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center', // Căn giữa toàn bộ nội dung
    gap: 16, // Khoảng cách giữa hàng nút và hàng chọn limit
  },

  // --- Controls Row (Nút trang) ---
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  pageBtn: {
    width: 40,
    height: 40,
    borderRadius: 20, // Hình tròn
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1 },
      android: { elevation: 1 },
    }),
  },

  activeBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...Platform.select({
      ios: { shadowColor: COLORS.activeShadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },

  disabledBtn: {
    backgroundColor: '#f9fafb',
    borderColor: '#f3f4f6',
    opacity: 0.5,
    elevation: 0,
  },

  pageText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },

  activeText: {
    color: '#ffffff',
    fontWeight: '700',
  },

  ellipsisText: {
    color: COLORS.textLight,
    fontSize: 14,
    paddingBottom: 8,
  },

  // --- Limit Selector (Chips) ---
  limitContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },

  limitBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  limitBtnActive: {
    backgroundColor: '#fff5f5',
    borderColor: 'rgba(228, 31, 7, 0.3)',
  },

  limitText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },

  limitTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
