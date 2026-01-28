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
  bgBackdrop: "rgba(0,0,0,0.5)",
  success: "#28a745",
  inputBg: "#f7f8f9",
  inputDisabled: "#f3f4f6",
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

  roleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
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
    maxHeight: "85%",
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
    flex: 1,
  },

  closeIcon: {
    padding: 4,
  },

  modalBody: {
    padding: 20,
  },

  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  permissionLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },

  allOption: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderBottomWidth: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    paddingHorizontal: 20,
    elevation: 0,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonClose: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  textStyle: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
  },
});
