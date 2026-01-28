import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
const imageError = require("../../../assets/images/error-500.png");

const COLORS = {
  primary: "#e41f07",
  text: "#1f2020",
  textGray: "#707070",
  bgBody: "#f7f8f9",
  white: "#fff",
};

export default function ErrorPage505() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={imageError} style={styles.image} resizeMode="contain" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Không có quyền truy cập</Text>
          <Text style={styles.description}>Bạn không có quyền xem trang này.{"\n"}Vui lòng liên hệ quản trị viên.</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Home" as never)}>
          <Ionicons name="chevron-back" size={20} color={COLORS.white} />
          <Text style={styles.buttonText}>Trở về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgBody,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },
  imageContainer: {
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 250,
    height: 200,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: COLORS.textGray,
    textAlign: "center",
    lineHeight: 24,
  },
  button: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 4,
  },
});
