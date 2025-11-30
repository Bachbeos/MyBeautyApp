import { StyleSheet } from 'react-native';

const COLORS = {
  primary: '#e41f07',
  border: '#e5e7eb', // Gray 200
  headerBg: '#f9fafb', // Gray 50
  text: '#374151', // Gray 700
  textLight: '#6b7280', // Gray 500
  white: '#ffffff',
  rowHover: '#fef2f2', // Primary subtle
};

export default StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  // --- HEADER ---
  headerRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 12,
  },
  headerCell: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    textTransform: 'uppercase',
  },
  // --- ROW ---
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  rowSelected: {
    backgroundColor: '#fff1f2', // Nền hồng nhạt khi chọn
  },
  cell: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 14,
    color: COLORS.text,
  },
  // --- ACTIONS & CHECKBOX ---
  checkboxContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContainer: {
    width: 120, // Đủ rộng cho các nút
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  // --- EMPTY STATE ---
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.textLight,
    fontSize: 14,
    marginTop: 8,
  },
});
