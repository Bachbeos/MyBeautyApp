import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Input, Button, Icon } from "@rneui/themed";
import { forgotPasswordStyles as styles } from "./ForgotPasswordScreen.styles";
import { RootStackParamList } from "../../types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import { useToast } from "expo-toast";
import { Divider } from "react-native-elements";

import LogoApp from "../../../assets/splash/logoApp.svg";
import LogoGoogle from "../../../assets/images/logo_google.svg";
import ForgotPasswordService from "../../services/ForgotPasswordService";

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, "ForgotPassword">;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const toast = useToast();

  // State quản lý các bước và dữ liệu (Đồng bộ từ Web)
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State ẩn hiện mật khẩu (Giống cách làm ở RegisterScreen)
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (step === 1) {
        // Step 1: Gửi email để nhận OTP
        if (!email.includes("@")) {
          toast.show("Vui lòng nhập địa chỉ email hợp lệ!");
          setIsLoading(false);
          return;
        }

        const res = await ForgotPasswordService.forgot({ email });
        if (res && res.code === 200) {
          toast.show("Mã OTP đã được gửi đến email của bạn.");
          setStep(2);
        } else {
          toast.show(res?.message || "Gửi email thất bại.");
        }
      } else {
        // Step 2: Xác nhận OTP và đặt mật khẩu mới
        const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

        if (!otp) {
          toast.show("Vui lòng nhập mã OTP!");
          setIsLoading(false);
          return;
        }

        if (!passwordRegex.test(newPassword)) {
          toast.show("Mật khẩu phải từ 8 ký tự và có ít nhất 1 ký tự đặc biệt!");
          setIsLoading(false);
          return;
        }

        if (newPassword !== confirmPassword) {
          toast.show("Mật khẩu nhập lại không khớp!");
          setIsLoading(false);
          return;
        }

        const res = await ForgotPasswordService.reset({
          email,
          otp,
          newPassword,
        });

        if (res && res.code === 200) {
          toast.show("Đổi mật khẩu thành công!");
          navigation.navigate("Login");
        } else {
          toast.show(res?.message || "Đổi mật khẩu thất bại.");
        }
      }
    } catch (error) {
      console.error(error);
      toast.show("Đã có lỗi xảy ra!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <LogoApp width={140} height={24} style={styles.logo} />

        <View style={styles.header}>
          <Text style={styles.title}>{step === 1 ? "Quên mật khẩu?" : "Đặt lại mật khẩu"}</Text>
          <Text style={styles.subtitle}>
            {step === 1 ? "Nếu bạn quên mật khẩu, chúng tôi sẽ gửi mã OTP qua email cho bạn." : `Vui lòng nhập mã OTP đã được gửi đến ${email}`}
          </Text>
        </View>

        {step === 1 ? (
          <Input
            placeholder="Địa chỉ email"
            keyboardType="email-address"
            rightIcon={{ type: "font-awesome", name: "envelope", color: "#888", size: 20 }}
            value={email}
            onChangeText={setEmail}
            disabled={isLoading}
            inputStyle={styles.inputText}
            containerStyle={styles.inputContainer}
          />
        ) : (
          <>
            <Input
              placeholder="Mã OTP"
              value={otp}
              onChangeText={setOtp}
              disabled={isLoading}
              rightIcon={{ type: "font-awesome", name: "key", color: "#888", size: 20 }}
              inputStyle={styles.inputText}
              containerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Mật khẩu mới"
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              disabled={isLoading}
              rightIcon={
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Icon name={showNewPassword ? "eye" : "eye-slash"} type="font-awesome" color="#888" size={20} />
                </TouchableOpacity>
              }
              inputStyle={styles.inputText}
              containerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Xác nhận mật khẩu"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              disabled={isLoading}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Icon name={showConfirmPassword ? "eye" : "eye-slash"} type="font-awesome" color="#888" size={20} />
                </TouchableOpacity>
              }
              inputStyle={styles.inputText}
              containerStyle={styles.inputContainer}
            />
          </>
        )}

        <Button
          title={step === 1 ? "Gửi OTP" : "Đổi mật khẩu"}
          buttonStyle={styles.primaryBtn}
          containerStyle={styles.buttonContainer}
          loading={isLoading}
          disabled={isLoading}
          onPress={handleSubmit}
        />

        <Text style={styles.returnText}>
          Quay lại{" "}
          <Text style={styles.linkPrimary} onPress={() => navigation.navigate("Login")}>
            Đăng nhập
          </Text>
        </Text>

        {step === 1 && (
          <>
            <View style={styles.orContainer}>
              <Divider style={styles.line} />
              <Text style={styles.orText}>HOẶC</Text>
              <Divider style={styles.line} />
            </View>

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
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ForgotPasswordScreen;
