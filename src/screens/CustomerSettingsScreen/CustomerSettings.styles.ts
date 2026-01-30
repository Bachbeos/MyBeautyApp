import { StyleSheet, Platform } from "react-native";

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

  centeredView: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.bgBackdrop },

  keyboardView: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  modalView: { width: "95%", maxHeight: "84%", backgroundColor: "white", borderRadius: 12, overflow: "hidden", shadowColor: "#000", elevation: 5 },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: COLORS.text },
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
    fontSize: 15,
    color: COLORS.text,
  },
  inputDisabled: { backgroundColor: COLORS.inputDisabled, color: COLORS.textGray },
  textArea: { height: 80, textAlignVertical: "top" },

  optionListContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  deleteOptionBtn: {
    padding: 8,
    backgroundColor: "#ffebee",
    borderRadius: 6,
  },
  addOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: 6,
    marginTop: 4,
    backgroundColor: "rgba(228, 31, 7, 0.05)",
  },
  addOptionText: { color: COLORS.primary, fontWeight: "600", fontSize: 14 },

  radioGroup: { flexDirection: "row", gap: 16, marginTop: 4 },
  radioItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  radioLabel: { fontSize: 14, color: COLORS.text },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  switchLabel: { fontSize: 14, fontWeight: "500", color: COLORS.text },

  modalFooter: { flexDirection: "row", justifyContent: "flex-end", padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 12 },
  button: { borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, minWidth: 90, alignItems: "center", justifyContent: "center" },
  buttonClose: { backgroundColor: "#f1f3f5" },
  buttonSave: { backgroundColor: COLORS.primary },
  buttonDelete: { backgroundColor: COLORS.danger },
  textStyle: { fontWeight: "600", fontSize: 14 },

  deleteContainer: { alignItems: "center", padding: 24, paddingTop: 40 },
  confirmText: { fontSize: 16, textAlign: "center", marginTop: 16, marginBottom: 8, color: COLORS.text, fontWeight: "600" },
  subText: { fontSize: 14, color: COLORS.textGray, textAlign: "center", marginBottom: 20 },
});
