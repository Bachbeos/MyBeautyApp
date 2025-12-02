import { StyleSheet, Platform } from 'react-native';

const COLORS = {
  primary: '#e41f07',
  secondary: '#ffa201',
  bgBody: '#f7f8f9',
  white: '#ffffff',
  text: '#1f2020',
  textGray: '#707070',
  border: '#e8e8e8',
};

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgBody,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Chừa chỗ cho FAB hoặc footer
  },
  // --- CARD STYLE (Thay vì Table Row) ---
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    // Shadow giống style.css: --crms-box-shadow-sm
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardId: {
    fontSize: 12,
    color: COLORS.textGray,
  },
  // --- ROW INSIDE CARD ---
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 14,
    color: COLORS.textGray,
    fontWeight: '500',
    flex: 1,
  },
  cardValue: {
    flex: 1,
    alignItems: 'flex-end',
  },
  cardValueText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    textAlign: 'right',
  },
  // --- ACTIONS ---
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  // --- EMPTY STATE ---
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: COLORS.textGray,
    marginTop: 10,
    fontSize: 16,
  },
  loader: {
    marginVertical: 20,
  },
});
