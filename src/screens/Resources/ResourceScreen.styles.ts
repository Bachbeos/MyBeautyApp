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

  toolbarExtra: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    maxHeight: "84%",
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 5,
    overflow: "hidden",
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
    marginBottom: 8,
    color: COLORS.text,
  },

  required: {
    color: COLORS.danger,
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

  textArea: {
    height: 80,
    textAlignVertical: "top",
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
    elevation: 0,
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
    textAlign: "center",
    fontSize: 14,
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

  checkboxContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
  },

  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: "40%",
    marginBottom: 8,
  },

  checkboxLabel: {
    marginLeft: 8,
    fontSize: 15,
    color: COLORS.text,
  },
});
