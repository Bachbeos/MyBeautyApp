/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "expo-toast";
import * as ImagePicker from "expo-image-picker";
import { styles, COLORS } from "./Profile.styles";
import Header from "../../components/Header/Header";
import SelectCustom from "../../components/SelectCustom/SelectCustom";
import { getToken } from "../../utils/common";
import { uploadFile } from "../../services/UploadFileService";
import UserService from "../../services/UserService";
import { useSidebar } from "../../components/Sidebar/SidebarContext";
import { useAppSelector, useAppDispatch } from "../../store";
import { setUser } from "../../store/slices/userSlice";

const genderOptions = [
  { id: 1, name: "Nam" },
  { id: 2, name: "Nữ" },
  { id: 0, name: "Khác" },
];

export default function ProfileScreen() {
  const { open } = useSidebar();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state) => state.user) as any;
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState(1);
  const [cityName, setCityName] = useState("");
  const [subdistrictName, setSubdistrictName] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (userInfo && userInfo.id) {
      setName(userInfo.name || "");
      setAlias(userInfo.alias || "");
      setPhone(userInfo.phone || "");
      setEmail(userInfo.email || "");
      setGender(typeof userInfo.gender === "number" ? userInfo.gender : 1);
      setAvatar(userInfo.avatar || "");
      setCityName(userInfo.cityName || "");
      setSubdistrictName(userInfo.subdistrictName || "");
    }
  }, [userInfo]);

  const fetchUserInfo = async () => {
    const token = await getToken();
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await UserService.info(token);
      if (res?.code === 200) {
        const userData = Array.isArray(res.result?.items) ? res.result.items[0] : res.result;
        if (userData) {
          dispatch(setUser(userData));
        }
      }
    } catch (e) {
      console.error("Lỗi lấy thông tin user:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const token = await getToken();
      if (!token) return;

      setIsUploading(true);
      try {
        const fileToUpload = {
          uri: asset.uri,
          name: asset.fileName || "avatar.jpg",
          type: asset.mimeType || "image/jpeg",
        };

        const res = await uploadFile(fileToUpload as any, token);

        if (res?.code === 200) {
          setAvatar(res.result);
          toast.show("Tải ảnh lên thành công");
        } else {
          toast.show("Lỗi tải ảnh");
        }
      } catch (err) {
        toast.show("Lỗi kết nối");
      }
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ tên.");
      return;
    }
    const token = await getToken();
    if (!token) return;

    setIsLoading(true);
    try {
      const payload = {
        ...(userInfo?.id ? { id: userInfo.id } : {}),
        name,
        alias,
        phone,
        email,
        gender,
        avatar,
        cityName,
        subdistrictName,
      };

      const res = await UserService.updateInfo(payload, token);

      if (res?.code === 200) {
        toast.show("Cập nhật thông tin thành công!");
        dispatch(setUser(payload));
      } else {
        toast.show(res?.message || "Cập nhật thất bại");
      }
    } catch (e) {
      toast.show("Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (userInfo) {
      setName(userInfo.name || "");
      setAlias(userInfo.alias || "");
      setPhone(userInfo.phone || "");
      setEmail(userInfo.email || "");
      setGender(userInfo.gender ? Number(userInfo.gender) : 1);
      setAvatar(userInfo.avatar || "");
      setCityName(userInfo.cityName || "");
      setSubdistrictName(userInfo.subdistrictName || "");
      toast.show("Đã hủy thay đổi");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Header onMenuPress={open} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerBackground}>
            <View style={styles.avatarContainer}>
              {isUploading ? (
                <View style={[styles.avatar, { alignItems: "center", justifyContent: "center" }]}>
                  <ActivityIndicator color={COLORS.primary} />
                </View>
              ) : (
                <Image
                  source={{
                    uri: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=random&size=200`,
                  }}
                  style={styles.avatar}
                />
              )}
              <TouchableOpacity style={styles.editAvatarBtn} onPress={handlePickImage} disabled={isUploading}>
                <Ionicons name="camera" size={18} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{name || "Người dùng"}</Text>
            <Text style={styles.userEmail}>{email || "user@example.com"}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Họ và tên <Text style={styles.required}>*</Text>
              </Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nhập họ tên" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Bí danh / Nickname</Text>
              <TextInput style={styles.input} value={alias} onChangeText={setAlias} placeholder="Nhập bí danh" />
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>
                  Số điện thoại <Text style={styles.required}>*</Text>
                </Text>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="SĐT" />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Giới tính</Text>
                <SelectCustom options={genderOptions} value={gender} onChange={(opt) => setGender(Number(opt.id))} placeholder="Chọn" />
              </View>
            </View>

            <View style={[styles.formGroup, { marginTop: 14 }]}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="Email" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Địa chỉ</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tỉnh / Thành phố</Text>
              <TextInput style={styles.input} value={cityName} onChangeText={setCityName} placeholder="Nhập thành phố" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Phường / Xã / Quận</Text>
              <TextInput style={styles.input} value={subdistrictName} onChangeText={setSubdistrictName} placeholder="Nhập phường xã" />
            </View>
          </View>

          <View style={styles.btnContainer}>
            <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="white" />
                  <Text style={styles.btnSaveText}>Lưu thay đổi</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnCancel} onPress={handleCancel} disabled={isLoading}>
              <Text style={styles.btnCancelText}>Hủy bỏ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
