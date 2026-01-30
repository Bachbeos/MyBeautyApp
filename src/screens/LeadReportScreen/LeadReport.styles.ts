import { StyleSheet, Dimensions } from "react-native";

export const COLORS = {
  primary: "#e41f07",
  secondary: "#ffa201",
  bgBody: "#f5f6fa",
  white: "#fff",
  text: "#1f2020",
  textGray: "#707070",
  border: "#e8e8e8",
  success: "#28a745",
  info: "#17a2b8",
  chart1: "#E41F07",
  chart2: "#FFA201",
  chart3: "#1ABE17",
  chart4: "#2F80ED",
  chart5: "#6c757d",
};

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgBody,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },

  chartWrapper: {
    alignItems: "center",
    marginVertical: 8,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.textGray,
    fontStyle: "italic",
    padding: 20,
  },

  listItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    paddingBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  itemBody: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCol: {
    alignItems: "flex-start",
  },
  statColCenter: {
    alignItems: "center",
  },
  statColEnd: {
    alignItems: "flex-end",
  },
  label: {
    fontSize: 12,
    color: COLORS.textGray,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },
  money: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.success,
  },
});
