import { StyleSheet } from "react-native";

export const COLORS = {
  primary: "#e41f07",
  secondary: "#ffa201",
  bgBody: "#f7f8f9",
  border: "#e8e8e8",
  white: "#fff",
  text: "#1f2020",
  textGray: "#707070",
  danger: "#ef1e1e",
  success: "#28a745",
  inputBg: "#fff",
  inputDisabled: "#f3f4f6",
  bgBackdrop: "rgba(0,0,0,0.5)",
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

  cellUserContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  cellTextBold: {
    fontWeight: "700",
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 2,
  },
  cellText: {
    fontSize: 12,
    color: COLORS.textGray,
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bgBackdrop,
  },
  keyboardView: {
    width: "100%",
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
  },
  modalView: {
    width: "95%",
    maxHeight: "92%",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    flex: 0,
  },
  closeIcon: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },

  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  inputDisabled: {
    backgroundColor: COLORS.inputDisabled,
    color: COLORS.textGray,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 10,
    backgroundColor: COLORS.inputBg,
  },

  deleteContainer: {
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
  },
  confirmText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
    color: COLORS.text,
  },
  subText: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: "center",
  },

  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  button: {
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonClose: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonSave: {
    backgroundColor: COLORS.primary,
  },
  buttonDelete: {
    backgroundColor: COLORS.danger,
  },
  textStyle: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
