import { StyleSheet, Dimensions } from "react-native";

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
  inputBg: "#fff",
  inputDisabled: "#f9f9f9",
};

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgBody,
  },

  headerBackground: {
    backgroundColor: COLORS.white,
    alignItems: "center",
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#f0f0f0",
    backgroundColor: "#eee",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textGray,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 8,
  },

  formGroup: {
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flex: 1,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textGray,
    marginBottom: 6,
  },
  required: {
    color: COLORS.danger,
  },
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

  btnContainer: {
    marginTop: 8,
    gap: 12,
  },
  btnSave: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnSaveText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
  },
  btnCancel: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnCancelText: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 16,
  },
});
