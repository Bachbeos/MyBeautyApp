import { StyleSheet } from "react-native";

export const COLORS = {
  primary: "#e41f07",
  secondary: "#ffa201",
  bgBody: "#f5f6fa",
  border: "#e8e8e8",
  white: "#fff",
  text: "#1f2020",
  textGray: "#707070",
  textLight: "#9ca3af",
  danger: "#ff3b30",
  success: "#34c759",
  info: "#007aff",
  warning: "#ffcc00",
  inputBg: "#fff",
  inputDisabled: "#f9f9f9",
  bgBackdrop: "rgba(0,0,0,0.6)",
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgBody,
  },
  toolbar: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: "center",
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bgBackdrop,
  },

  keyboardView: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  modalView: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 5,
    overflow: "hidden",
    maxHeight: "84%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  modalTitle: { fontSize: 17, fontWeight: "700", color: COLORS.text, flex: 1 },
  closeIcon: { padding: 4 },
  modalBody: { padding: 20 },

  formGroup: { marginBottom: 16 },
  row: { flexDirection: "row", gap: 12 },
  col: { flex: 1 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, color: COLORS.text },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  inputDisabled: { backgroundColor: COLORS.inputDisabled, color: COLORS.textGray },
  textArea: { height: 80, textAlignVertical: "top" },

  radioGroup: { flexDirection: "row", gap: 16, marginTop: 4 },
  radioItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  radioLabel: { fontSize: 14, color: COLORS.text },

  ratingContainer: { flexDirection: "row", gap: 4, marginTop: 4 },
  ratingText: { fontSize: 13, color: COLORS.textGray, marginLeft: 8, alignSelf: "center" },

  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
    backgroundColor: COLORS.white,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonClose: { backgroundColor: "#f1f3f5" },
  buttonSave: { backgroundColor: COLORS.primary },
  buttonDelete: { backgroundColor: COLORS.danger },

  textStyle: { fontWeight: "600", fontSize: 14 },

  deleteContainer: { alignItems: "center", padding: 24, paddingTop: 40 },
  confirmText: { fontSize: 16, textAlign: "center", marginTop: 16, marginBottom: 8, fontWeight: "600", color: COLORS.text },
  subText: { fontSize: 14, color: COLORS.textGray, textAlign: "center", marginBottom: 20 },

  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: "flex-start" },
  badgeSuccess: { backgroundColor: "#e8f5e9" },
  badgeDanger: { backgroundColor: "#ffebee" },
  badgeInfo: { backgroundColor: "#e3f2fd" },
  badgeTextSuccess: { color: "#2e7d32", fontSize: 11, fontWeight: "600" },
  badgeTextDanger: { color: "#c62828", fontSize: 11, fontWeight: "600" },
  badgeTextInfo: { color: "#1565c0", fontSize: 11, fontWeight: "600" },
  cellUser: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  cellTextMain: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  cellTextSub: { fontSize: 12, color: COLORS.textGray },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { color: COLORS.textGray, marginTop: 8, fontSize: 14 },
});
