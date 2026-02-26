import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Input, Button, CheckBox, Icon } from "@rneui/themed";
import { registerStyles as styles } from "./registerScreen.styles";
import { RootStackParamList } from "../../types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import { useToast } from "expo-toast";

import LogoApp from "../../../assets/splash/logoApp.svg";
import LogoGoogle from "../../../assets/images/logo_google.svg";
import { Divider } from "react-native-elements";
import { IUserRegisterRequest } from "../../model/user/UserRequestModel";
import UserService from "../../services/UserService";

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, "Register">;

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agree, setAgree] = useState(true);
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleRegisterSuccess = () => {
    toast.show("Đăng ký tài khoản thành công!");
    navigation.navigate("Login");
  };

  const handleSubmit = async () => {
    // 1. Kiểm tra các trường trống
    if (!name || !phone || !password || !confirmPassword) {
      toast.show("Vui lòng điền đầy đủ các trường thông tin!");
      return;
    }

    // 2. Kiểm tra số điện thoại (Bắt đầu bằng 0, tổng 10 số)
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      toast.show("Số điện thoại phải bắt đầu bằng số 0 và có đúng 9 chữ số!");
      return;
    }

    // 3. Kiểm tra mật khẩu (Ít nhất 8 ký tự và có ký tự đặc biệt)
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.show("Mật khẩu phải có ít nhất 8 ký tự và bao gồm ít nhất 1 ký tự đặc biệt!");
      return;
    }

    // 4. Kiểm tra mật khẩu nhập lại có khớp không
    if (password !== confirmPassword) {
      toast.show("Mật khẩu nhập lại không khớp!");
      return;
    }

    // 5. Kiểm tra đồng ý điều khoản
    if (!agree) {
      toast.show("Bạn cần đồng ý với các điều khoản của chúng tôi!");
      return;
    }

    const body: IUserRegisterRequest = {
      phone: phone,
      plainPassword: password,
      name: name,
    };

    setIsLoading(true);
    try {
      const response = await UserService.register(body);
      if (response?.result) {
        handleRegisterSuccess();
      } else {
        toast.show(response?.message || "Đăng ký thất bại, vui lòng thử lại!");
      }
    } catch (error) {
      toast.show("Có lỗi xảy ra, vui lòng liên hệ quản trị viên!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Logo */}
        <LogoApp width={140} height={24} style={styles.logo} />

        {/* Title & Subtitle */}
        <View style={styles.header}>
          <Text style={styles.title}>Đăng ký</Text>
          <Text style={styles.subtitle}>Tham gia hệ thống My Beauty ngay hôm nay.</Text>
        </View>

        {/* Name */}
        <Input
          placeholder="Họ và tên"
          value={name}
          onChangeText={setName}
          disabled={isLoading}
          inputStyle={styles.inputText}
          containerStyle={styles.inputContainer}
        />

        {/* Phone */}
        <Input
          placeholder="Số điện thoại"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          disabled={isLoading}
          inputStyle={styles.inputText}
          containerStyle={styles.inputContainer}
        />

        {/* Password - Toggle Icon Tabler style */}
        <Input
          placeholder="Mật khẩu"
          secureTextEntry={!showPassword}
          rightIcon={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? "eye" : "eye-slash"} type="font-awesome" color="#888" />
            </TouchableOpacity>
          }
          value={password}
          onChangeText={setPassword}
          disabled={isLoading}
          inputStyle={styles.inputText}
          containerStyle={styles.inputContainer}
        />

        {/* Confirm Password - Toggle Icon */}
        <Input
          placeholder="Nhập lại mật khẩu"
          secureTextEntry={!showConfirmPassword}
          rightIcon={
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Icon name={showConfirmPassword ? "eye" : "eye-slash"} type="font-awesome" color="#888" />
            </TouchableOpacity>
          }
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          disabled={isLoading}
          inputStyle={styles.inputText}
          containerStyle={styles.inputContainer}
        />

        {/* Terms and Policy */}
        <CheckBox
          title={
            <Text style={styles.checkboxLabel}>
              Tôi đồng ý với <Text style={styles.linkPrimary}>Điều khoản & Chính sách</Text>
            </Text>
          }
          checked={agree}
          onPress={() => setAgree(!agree)}
          containerStyle={styles.checkbox}
          disabled={isLoading}
        />

        {/* Register Button */}
        <Button
          title={isLoading ? "Đang xử lý..." : "Đăng ký"}
          buttonStyle={styles.primaryBtn}
          containerStyle={{ width: "100%", marginVertical: 10 }}
          loading={isLoading}
          disabled={isLoading}
          onPress={handleSubmit}
        />

        {/* Login Link */}
        <Text style={styles.signInText}>
          Đã có tài khoản?{" "}
          <Text style={styles.linkPrimary} onPress={() => navigation.navigate("Login")}>
            Đăng nhập ngay
          </Text>
        </Text>

        {/* OR separator */}
        <View style={styles.orContainer}>
          <Divider style={styles.line} />
          <Text style={styles.orText}>HOẶC</Text>
          <Divider style={styles.line} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialRow}>
          <Button
            icon={<Icon name="facebook" type="font-awesome" color="white" />}
            buttonStyle={[styles.socialBtn, { backgroundColor: "#1877F2" }]}
          />
          <Button
            icon={<LogoGoogle width={24} height={24} />}
            buttonStyle={[styles.socialBtn, { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E8E8E8" }]}
          />
          <Button icon={<Icon name="apple" type="font-awesome" color="white" />} buttonStyle={[styles.socialBtn, { backgroundColor: "#000" }]} />
        </View>
      </ScrollView>

      {/* Footer updated to My Beauty */}
      <Text style={styles.footer}>© {new Date().getFullYear()} - My Beauty</Text>
    </View>
  );
};

export default RegisterScreen;
