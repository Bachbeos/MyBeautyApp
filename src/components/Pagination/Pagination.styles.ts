import { StyleSheet } from 'react-native';

const COLORS = {
  primary: '#e41f07',
  text: '#374151',
  textLight: '#6b7280',
  border: '#e5e7eb',
  bg: '#ffffff',
  bgGray: '#f9fafb',
};

export default StyleSheet.create({
  container: {
    paddingVertical: 10,
    gap: 12,
  },
  // --- Info Row (Showing X-Y of Z) ---
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  bold: {
    fontWeight: '600',
    color: COLORS.text,
  },

  // --- Pagination Controls ---
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  pageBtn: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  disabledBtn: {
    backgroundColor: COLORS.bgGray,
    opacity: 0.5,
  },
  pageText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  activeText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  ellipsisText: {
    color: COLORS.textLight,
    paddingHorizontal: 4,
  },

  // --- Limit Selector ---
  limitContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  limitLabel: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  limitBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  limitBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#fff1f2', // Primary subtle
  },
  limitText: {
    fontSize: 12,
    color: COLORS.text,
  },
  limitTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
