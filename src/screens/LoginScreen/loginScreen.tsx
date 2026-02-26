import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Input, Button, CheckBox, Icon } from "@rneui/themed";
import { loginStyles as styles } from "./loginScreen.styles";
import { RootStackParamList } from "../../types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import { Divider } from "react-native-elements";
import LogoApp from "../../../assets/splash/logoApp.svg";
import LogoGoogle from "../../../assets/images/logo_google.svg";
import { IUserLoginRequest } from "../../model/user/UserRequestModel";
import UserService from "../../services/UserService";
import PermissionService from "../../services/PermissionService";
import { useToast } from "expo-toast";

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, "Login">;

const LoginScreen = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const abortController = useRef<AbortController | null>(null);

  const handleLoginSuccess = async (token: string) => {
    setIsLoading(true);
    try {
      // 1. Lưu token
      await SecureStore.setItemAsync("token", token);

      // 2. Lấy danh sách quyền
      const response = await PermissionService.resources(token);

      if (response && Array.isArray(response.result)) {
        const map: Record<string, string> = {};
        response.result.forEach((item: any) => {
          const code = item.code;
          let actions = item.actions;

          // Xử lý parse actions nếu là string JSON
          if (typeof actions === "string" && actions.trim().startsWith("[") && actions.trim().endsWith("]")) {
            try {
              const parsed = JSON.parse(actions);
              if (Array.isArray(parsed)) actions = parsed;
            } catch (e) {
              console.error("Lỗi parse action:", e);
            }
          }

          if (code && Array.isArray(actions)) {
            actions.forEach((act: string) => {
              const key = `${code}_${act}`;
              map[key] = "1"; // Lưu quyền vào map
            });
          }
        });

        // Lưu toàn bộ quyền vào SecureStore
        const savePromises = Object.keys(map).map((k) => SecureStore.setItemAsync(k, map[k]));
        await Promise.all(savePromises);
      } else {
        toast.show(response?.message ?? "Có lỗi xảy ra khi lấy quyền!");
      }

      toast.show("Đăng nhập thành công!");
      navigation.replace("LeadReportScreen");
    } catch (e) {
      console.error("Lỗi trong quá trình xử lý sau đăng nhập:", e);
      toast.show("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // 1. Kiểm tra các trường trống
    if (!phone || !password) {
      toast.show("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // 2. Kiểm tra số điện thoại: Bắt đầu bằng 0 và có đúng 9 chữ số
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      toast.show("Số điện thoại phải bắt đầu bằng số 0 và có đúng 9 chữ số!");
      return;
    }

    // 3. Kiểm tra mật khẩu: Ít nhất 8 ký tự và 1 ký tự đặc biệt
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.show("Mật khẩu phải có ít nhất 8 ký tự và bao gồm ít nhất 1 ký tự đặc biệt!");
      return;
    }

    const body: IUserLoginRequest = {
      phone,
      plainPassword: password,
    };

    setIsLoading(true);
    try {
      const respond = await UserService.login(body);

      if (respond?.result?.token) {
        await handleLoginSuccess(respond.result.token);
      } else if (respond?.code === 400) {
        toast.show(respond?.message || "Số điện thoại hoặc mật khẩu không đúng!");
      } else {
        toast.show(respond?.message || "Có lỗi xảy ra, vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.show("Lỗi hệ thống, vui lòng thử lại sau!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => abortController.current?.abort();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <LogoApp width={140} height={24} style={styles.logo} />

        <View style={styles.header}>
          <Text style={styles.title}>Đăng nhập</Text>
          {/* Cập nhật Subtitle  */}
          <Text style={styles.subtitle}>Truy cập hệ thống My Beauty bằng số điện thoại và mật khẩu của bạn.</Text>
        </View>

        <Input
          placeholder="Số điện thoại"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          disabled={isLoading}
          inputStyle={styles.inputText}
          containerStyle={styles.inputContainer}
        />

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

        <View style={styles.row}>
          <CheckBox
            title="Ghi nhớ đăng nhập"
            checked={remember}
            onPress={() => setRemember(!remember)}
            containerStyle={styles.checkbox}
            textStyle={styles.checkboxLabel}
            disabled={isLoading}
          />
          <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.linkDanger}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>

        <Button
          title={isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          buttonStyle={styles.primaryBtn}
          containerStyle={styles.buttonContainer}
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
        />

        <Text style={styles.signupText}>
          Mới sử dụng hệ thống của chúng tôi?{" "}
          <Text style={styles.linkPrimary} onPress={() => navigation.navigate("Register")}>
            Tạo tài khoản
          </Text>
        </Text>

        <View style={styles.orContainer}>
          <Divider style={styles.line} />
          <Text style={styles.orText}>HOẶC</Text>
          <Divider style={styles.line} />
        </View>

        {/* Social Buttons aligned with Web UI */}
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

      {/* Cập nhật Footer thương hiệu */}
      <Text style={styles.footer}>© {new Date().getFullYear()} - My Beauty</Text>
    </View>
  );
};

export default LoginScreen;
